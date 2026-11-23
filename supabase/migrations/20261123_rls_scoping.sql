-- =============================================================================
-- RLS policies: scope projects/customers/quotations per user role.
-- Installers see only rows they created; Admins see all.
-- =============================================================================

-- ---- PROJECTS ----
DROP POLICY IF EXISTS "Users can read own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can read all projects" ON public.projects;

CREATE POLICY "projects_select_scoped" ON public.projects FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ---- CUSTOMERS ----
DROP POLICY IF EXISTS "Users can read own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can read all customers" ON public.customers;

CREATE POLICY "customers_select_scoped" ON public.customers FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ---- QUOTATIONS ----
DROP POLICY IF EXISTS "Users can read own quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can read all quotations" ON public.quotations;

CREATE POLICY "quotations_select_scoped" ON public.quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = quotations.project_id
        AND (
          projects.created_by = auth.uid()
          OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
        )
    )
  );
