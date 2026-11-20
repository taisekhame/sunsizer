import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function EmailConfirmedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-10 w-10 text-accent-foreground" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-foreground mb-4">
          Email Confirmed!
        </h1>

        {/* Description */}
        <p className="text-lg font-[family-name:var(--font-body)] text-muted-foreground mb-3 leading-relaxed">
          Your email address has been verified successfully. Your SunSizer account is now fully activated.
        </p>
        <p className="text-base font-[family-name:var(--font-body)] text-muted-foreground mb-10">
          You can now log in and start sizing solar PV systems, generating quotations, and managing your projects.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-foreground text-background text-base font-semibold font-[family-name:var(--font-ui)] hover:bg-foreground/90 transition-colors"
        >
          Log In to SunSizer
          <ArrowRight className="h-5 w-5" />
        </Link>

        {/* Branding */}
        <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground/50">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
            S
          </div>
          <span className="text-sm font-[family-name:var(--font-heading)]">SunSizer</span>
        </div>
      </div>
    </main>
  );
}
