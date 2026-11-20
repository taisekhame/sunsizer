"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/actions/customers";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  site_address: string;
  notes: string;
  created_at: string;
};

export function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCustomers = async () => {
    setLoading(true);
    const { data } = await getCustomers();
    setCustomers(data as Customer[]);
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) {
        const result = await updateCustomer(editing.id, form);
        if (result.error) { toast.error(result.error); return; }
        toast.success("Customer updated");
      } else {
        const result = await createCustomer(form);
        if (result.error) { toast.error(result.error); return; }
        toast.success("Customer created");
      }
      setDialogOpen(false);
      setEditing(null);
      loadCustomers();
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    startTransition(async () => {
      const result = await deleteCustomer(id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Customer deleted");
      loadCustomers();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground">Customers</h1>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            Manage your customers and their projects.
          </p>
        </div>
        <Button variant="accent" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      {/* Customer list */}
      <div className="bg-card rounded-xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm font-[family-name:var(--font-ui)]">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center p-8">
            <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground mb-4">
              No customers yet. Add your first customer.
            </p>
            <Button variant="accent" size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              Add Customer
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                <Link href={`/customers/${c.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-[family-name:var(--font-ui)] font-medium text-foreground">{c.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    {c.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" /> {c.email}
                      </span>
                    )}
                    {c.address && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {c.address}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(c); setDialogOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] mb-4">
              {editing ? "Edit Customer" : "New Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required defaultValue={editing?.name || ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={editing?.phone || ""} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editing?.email || ""} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={editing?.address || ""} />
              </div>
              <div>
                <Label htmlFor="site_address">Site Address</Label>
                <Input id="site_address" name="site_address" defaultValue={editing?.site_address || ""} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} defaultValue={editing?.notes || ""} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" disabled={isPending}>
                  {isPending ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
