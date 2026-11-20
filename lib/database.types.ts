// Generated TypeScript types for the Supabase database schema.
// In production, regenerate with: npx supabase gen types typescript --project-id <id> > lib/database.types.ts
// This is a manual version matching our migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "ADMIN" | "INSTALLER";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          role?: "ADMIN" | "INSTALLER";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "ADMIN" | "INSTALLER";
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          address: string;
          site_address: string;
          notes: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string;
          email?: string;
          address?: string;
          site_address?: string;
          notes?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string;
          address?: string;
          site_address?: string;
          notes?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          customer_id: string | null;
          created_by: string;
          title: string;
          status: "DRAFT" | "VALIDATED" | "QUOTED";
          system_type: "OFF_GRID" | "HYBRID" | "GRID_TIED";
          mode: "BASIC" | "PROFESSIONAL";
          inputs: Json;
          assumptions: Json;
          results: Json | null;
          formula_version: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          created_by: string;
          title?: string;
          status?: "DRAFT" | "VALIDATED" | "QUOTED";
          system_type?: "OFF_GRID" | "HYBRID" | "GRID_TIED";
          mode?: "BASIC" | "PROFESSIONAL";
          inputs?: Json;
          assumptions?: Json;
          results?: Json | null;
          formula_version?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_id?: string | null;
          title?: string;
          status?: "DRAFT" | "VALIDATED" | "QUOTED";
          system_type?: "OFF_GRID" | "HYBRID" | "GRID_TIED";
          mode?: "BASIC" | "PROFESSIONAL";
          inputs?: Json;
          assumptions?: Json;
          results?: Json | null;
          formula_version?: string | null;
          updated_at?: string;
        };
      };
      components: {
        Row: {
          id: string;
          category: "INVERTER" | "BATTERY" | "PANEL" | "ACCESSORY";
          brand: string;
          model: string;
          specs: Json;
          datasheet_url: string | null;
          warranty: string | null;
          verified: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: "INVERTER" | "BATTERY" | "PANEL" | "ACCESSORY";
          brand?: string;
          model?: string;
          specs?: Json;
          datasheet_url?: string | null;
          warranty?: string | null;
          verified?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: "INVERTER" | "BATTERY" | "PANEL" | "ACCESSORY";
          brand?: string;
          model?: string;
          specs?: Json;
          datasheet_url?: string | null;
          warranty?: string | null;
          verified?: boolean;
          active?: boolean;
          updated_at?: string;
        };
      };
      prices: {
        Row: {
          id: string;
          component_id: string;
          unit_price: number;
          currency: string;
          is_placeholder: boolean;
          effective_from: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          component_id: string;
          unit_price: number;
          currency?: string;
          is_placeholder?: boolean;
          effective_from?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: never; // Prices are append-only
      };
      quotations: {
        Row: {
          id: string;
          project_id: string;
          number: string;
          issued_at: string;
          valid_days: number;
          lines: Json;
          subtotal: number;
          markup_rate: number;
          markup_amount: number;
          tax_rate: number;
          tax_amount: number;
          grand_total: number;
          pdf_url: string | null;
          status: "ISSUED" | "ACCEPTED" | "EXPIRED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          number: string;
          issued_at?: string;
          valid_days?: number;
          lines?: Json;
          subtotal?: number;
          markup_rate?: number;
          markup_amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          grand_total?: number;
          pdf_url?: string | null;
          status?: "ISSUED" | "ACCEPTED" | "EXPIRED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "ISSUED" | "ACCEPTED" | "EXPIRED";
          pdf_url?: string | null;
          updated_at?: string;
        };
      };
      company_settings: {
        Row: {
          id: string;
          company_name: string;
          logo_url: string | null;
          address: string;
          phone: string;
          email: string;
          bank_details: string;
          default_markup: number;
          default_valid_days: number;
          terms: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name?: string;
          logo_url?: string | null;
          address?: string;
          phone?: string;
          email?: string;
          bank_details?: string;
          default_markup?: number;
          default_valid_days?: number;
          terms?: string;
        };
        Update: {
          company_name?: string;
          logo_url?: string | null;
          address?: string;
          phone?: string;
          email?: string;
          bank_details?: string;
          default_markup?: number;
          default_valid_days?: number;
          terms?: string;
          updated_at?: string;
        };
      };
    };
  };
}
