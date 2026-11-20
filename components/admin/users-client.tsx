"use client";

import React, { useState, useEffect, useTransition } from "react";
import { UserCog, Shield, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUsers, updateUserRole } from "@/lib/actions/users";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTALLER";
  created_at: string;
};

export function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await getUsers();
    setUsers(data as User[]);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = (userId: string, newRole: "ADMIN" | "INSTALLER") => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Role updated");
      loadUsers();
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">Manage Users</h1>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-8">
        View all users and assign Admin or Installer roles.
      </p>

      <div className="bg-card rounded-xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm font-[family-name:var(--font-ui)]">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <UserCog className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
              No users registered yet. The first user to register becomes Admin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-[family-name:var(--font-ui)]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold">
                          {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{u.name || " -"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-4">
                      <Badge variant={u.role === "ADMIN" ? "default" : "outline"}>
                        {u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><Wrench className="w-3 h-3" /> Installer</span>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRoleChange(u.id, u.role === "ADMIN" ? "INSTALLER" : "ADMIN")}
                      >
                        {u.role === "ADMIN" ? "Make Installer" : "Make Admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
