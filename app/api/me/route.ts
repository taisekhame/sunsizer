import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ name: "", email: "", role: "" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role")
    .eq("id", user.id)
    .single();

  return NextResponse.json(profile || { name: "", email: user.email || "", role: "INSTALLER" });
}
