"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login, resetPassword } from "@/lib/actions/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    const result = await resetPassword(forgotEmail);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgot(false);
      setForgotEmail("");
    }
    setForgotLoading(false);
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

        {showForgot ? (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] mb-2">Reset Password</h2>
            <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-4">
              Enter your email and we will send you a password reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setShowForgot(false)}
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </>
        )}

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
