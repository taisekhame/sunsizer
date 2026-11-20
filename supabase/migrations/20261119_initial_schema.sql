-- =============================================================================
-- SunSizer — Initial Schema Migration
-- Creates all tables with RLS policies.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS (profile + role; auth credentials live in Supabase Auth)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'INSTALLER' CHECK (role IN ('ADMIN', 'INSTALLER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read all users (needed for display)
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any user (role changes)
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Service role can insert (used during registration trigger)
CREATE POLICY "Service can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  site_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read customers
CREATE POLICY "Authenticated users can read customers" ON public.customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can create customers
CREATE POLICY "Authenticated users can create customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- All authenticated users can update customers
CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Only admins can delete customers
CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECTS (designs)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATED', 'QUOTED')),
  system_type TEXT NOT NULL DEFAULT 'OFF_GRID' CHECK (system_type IN ('OFF_GRID', 'HYBRID', 'GRID_TIED')),
  mode TEXT NOT NULL DEFAULT 'BASIC' CHECK (mode IN ('BASIC', 'PROFESSIONAL')),
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB,
  formula_version TEXT DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all projects
CREATE POLICY "Authenticated users can read projects" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- All authenticated users can update projects
CREATE POLICY "Authenticated users can update projects" ON public.projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Admins can delete any project; Installers can delete own drafts only
CREATE POLICY "Admins can delete any project" ON public.projects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Installers can delete own drafts" ON public.projects
  FOR DELETE USING (
    created_by = auth.uid() AND status = 'DRAFT'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPONENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('INVERTER', 'BATTERY', 'PANEL', 'ACCESSORY')),
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  datasheet_url TEXT,
  warranty TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read components
CREATE POLICY "Authenticated users can read components" ON public.components
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete components
CREATE POLICY "Admins can insert components" ON public.components
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update components" ON public.components
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete components" ON public.components
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PRICES (append-only audit trail)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  unit_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_placeholder BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read prices
CREATE POLICY "Authenticated users can read prices" ON public.prices
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert prices (never update/delete — append only)
CREATE POLICY "Admins can insert prices" ON public.prices
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- QUOTATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_days INT NOT NULL DEFAULT 30,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  markup_rate NUMERIC NOT NULL DEFAULT 0,
  markup_amount NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'ACCEPTED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read quotations
CREATE POLICY "Authenticated users can read quotations" ON public.quotations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can create quotations
CREATE POLICY "Authenticated users can create quotations" ON public.quotations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- All authenticated users can update quotations
CREATE POLICY "Authenticated users can update quotations" ON public.quotations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPANY SETTINGS (single row)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL DEFAULT 'My Solar Company',
  logo_url TEXT,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  bank_details TEXT DEFAULT '',
  default_markup NUMERIC NOT NULL DEFAULT 15,
  default_valid_days INT NOT NULL DEFAULT 30,
  terms TEXT DEFAULT 'Standard terms and conditions apply.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read settings" ON public.company_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.company_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Allow insert for initial seed
CREATE POLICY "Admins can insert settings" ON public.company_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: Auto-create user profile on registration
-- First user becomes ADMIN; subsequent users become INSTALLER.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_count INT;
  user_role TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  IF user_count = 0 THEN
    user_role := 'ADMIN';
  ELSE
    user_role := 'INSTALLER';
  END IF;

  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.email, ''),
    user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: initial company settings row
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.company_settings (company_name) VALUES ('SunSizer Demo Company');
