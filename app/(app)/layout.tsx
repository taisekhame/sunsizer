import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  let profile: { name: string; role: string; email: string } | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: p } = await supabase
        .from("users")
        .select("name, role, email")
        .eq("id", user.id)
        .single();
      profile = p;
    }
  } catch {
    // Supabase not configured or unreachable
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={profile?.name || user.email?.split("@")[0] || "User"}
      userRole={(profile?.role as "ADMIN" | "INSTALLER") || "INSTALLER"}
      userEmail={profile?.email || user.email || ""}
    >
      {children}
    </AppShell>
  );
}
