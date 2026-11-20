"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
    // On success, login() redirects to /dashboard
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground">
              S
            </div>
          </div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground">
            Welcome back
          </h1>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            Sign in to your SunSizer account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm font-[family-name:var(--font-ui)] text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
