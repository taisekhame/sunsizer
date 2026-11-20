"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { register } from "@/lib/actions/auth";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await register(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else if (result?.success) {
      setRegisteredEmail(result.email || "");
      setRegistered(true);
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (registered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-3">
              Account Created!
            </h1>
            <p className="text-base font-[family-name:var(--font-body)] text-muted-foreground mb-2">
              We&apos;ve sent a confirmation email to:
            </p>
            <p className="text-base font-[family-name:var(--font-ui)] font-semibold text-foreground mb-6">
              {registeredEmail}
            </p>
            <div className="bg-muted rounded-xl p-5 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-[family-name:var(--font-ui)] font-medium text-foreground mb-1">
                    Check your inbox
                  </p>
                  <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground leading-relaxed">
                    Click the confirmation link in the email to verify your account, then come back here to log in.
                    Check your spam folder if you don&apos;t see it.
                  </p>
                </div>
              </div>
            </div>
            <Button asChild variant="accent" size="lg" className="w-full text-base rounded-xl">
              <Link href="/login">
                Go to Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ──
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
            Create your account
          </h1>
          <p className="text-base font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            Get started with SunSizer  - for companies and individuals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm font-[family-name:var(--font-ui)] text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
