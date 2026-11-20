"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getCompanySettings, updateCompanySettings } from "@/lib/actions/settings";

type Settings = {
  id: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  bank_details: string;
  default_markup: number;
  default_valid_days: number;
  terms: string;
  logo_url: string | null;
};

export function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadSettings = async () => {
    setLoading(true);
    const result = await getCompanySettings();
    if (result.data) setSettings(result.data as Settings);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCompanySettings({
        company_name: form.get("company_name") as string,
        address: form.get("address") as string,
        phone: form.get("phone") as string,
        email: form.get("email") as string,
        bank_details: form.get("bank_details") as string,
        default_markup: Number(form.get("default_markup")),
        default_valid_days: Number(form.get("default_valid_days")),
        terms: form.get("terms") as string,
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Settings saved");
      loadSettings();
    });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">Company Settings</h1>
        <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground font-[family-name:var(--font-ui)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">Company Settings</h1>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
            No settings found. Please run the database migrations first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">Company Settings</h1>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-8">
        Company profile, default markup, quotation validity and terms.
      </p>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" name="company_name" defaultValue={settings.company_name} />
          </div>
          <div>
            <Label htmlFor="email">Company Email</Label>
            <Input id="email" name="email" type="email" defaultValue={settings.email} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={settings.phone} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={settings.address} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="default_markup">Default Markup (%)</Label>
            <Input id="default_markup" name="default_markup" type="number" min="0" max="100" step="0.5" defaultValue={settings.default_markup} />
          </div>
          <div>
            <Label htmlFor="default_valid_days">Quotation Validity (days)</Label>
            <Input id="default_valid_days" name="default_valid_days" type="number" min="1" defaultValue={settings.default_valid_days} />
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="bank_details">Bank Details</Label>
          <Textarea id="bank_details" name="bank_details" rows={3} defaultValue={settings.bank_details} placeholder="Bank name, account number, etc." />
        </div>

        <div className="mb-6">
          <Label htmlFor="terms">Terms &amp; Conditions</Label>
          <Textarea id="terms" name="terms" rows={4} defaultValue={settings.terms} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
