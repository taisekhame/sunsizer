import Link from "next/link";
import { UserCog, DollarSign, Wrench } from "lucide-react";

const adminSections = [
  { title: "Users", description: "Manage users and assign roles.", icon: UserCog, href: "/admin/users" },
  { title: "Components & Prices", description: "Add and edit components, manage pricing.", icon: DollarSign, href: "/admin/components" },
  { title: "Settings", description: "Company profile, defaults and quotation settings.", icon: Wrench, href: "/admin/settings" },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">Admin Panel</h1>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-8">
        Manage users, components, prices and company settings.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {adminSections.map((s) => (
          <Link key={s.href} href={s.href} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <s.icon className="h-6 w-6 text-foreground mb-3" />
            <h2 className="text-base font-[family-name:var(--font-heading)] mb-1">{s.title}</h2>
            <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
