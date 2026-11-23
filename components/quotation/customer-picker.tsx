"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getCustomers, createCustomerQuick } from "@/lib/actions/customers";

interface CustomerOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomerPickerProps {
  selectedCustomerId: string | null;
  onSelect: (id: string | null, name: string | null) => void;
}

export function CustomerPicker({ selectedCustomerId, onSelect }: CustomerPickerProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomers().then((res) => {
      if (res.data) {
        setCustomers(res.data.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.name as string,
          email: (c.email as string) || "",
          phone: (c.phone as string) || "",
        })));
      }
    });
  }, []);

  // Set the selected name from loaded customers
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) setSelectedName(found.name);
    }
  }, [selectedCustomerId, customers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c: CustomerOption) => {
    onSelect(c.id, c.name);
    setSelectedName(c.name);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onSelect(null, null);
    setSelectedName(null);
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const result = await createCustomerQuick({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
    });
    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      const newCust = { id: result.id, name: result.name || newName.trim(), email: newEmail, phone: newPhone };
      setCustomers((prev) => [...prev, newCust]);
      onSelect(result.id, newCust.name);
      setSelectedName(newCust.name);
      setShowAdd(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      toast.success("Customer added");
    }
    setAdding(false);
  };

  return (
    <div className="mb-6" ref={ref}>
      <Label className="text-sm font-medium mb-2 block">
        Customer <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>

      {selectedName ? (
        <div className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-muted/30">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-[family-name:var(--font-ui)] flex-1">{selectedName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              className="pl-9"
            />
          </div>

          {isOpen && (
            <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 font-[family-name:var(--font-ui)]">No customers found</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm font-[family-name:var(--font-ui)]"
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.email && <span className="text-muted-foreground ml-2 text-xs">{c.email}</span>}
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => { setShowAdd(true); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 border-t border-border hover:bg-muted/50 transition-colors text-sm font-[family-name:var(--font-ui)] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add new customer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick add new customer */}
      {showAdd && (
        <div className="mt-3 rounded-lg border border-border p-4 bg-muted/30">
          <h4 className="text-sm font-[family-name:var(--font-ui)] font-medium mb-3">Quick Add Customer</h4>
          <form onSubmit={handleAddNew} className="space-y-3">
            <Input
              placeholder="Customer name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm" disabled={adding}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
