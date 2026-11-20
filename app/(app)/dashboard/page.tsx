import { FolderKanban, DollarSign, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getRecentProjects } from "@/lib/actions/users";
import { formatNaira } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentProjects] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(5),
  ]);

  const statCards = [
    { label: "Total Projects", value: String(stats.totalProjects), icon: FolderKanban, accent: false },
    { label: "Quoted Value", value: formatNaira(stats.quotedValue), icon: DollarSign, accent: true },
    { label: "Pending Quotations", value: String(stats.pendingQuotations), icon: Clock, accent: false },
    { label: "Active Customers", value: String(stats.totalCustomers), icon: Users, accent: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground">
            Dashboard
          </h1>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            Welcome to SunSizer. Here&apos;s your overview.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/projects/new">New Quotation</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 ${
              s.accent
                ? "bg-accent text-accent-foreground border-accent/50"
                : "bg-card text-foreground border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-[family-name:var(--font-ui)] font-medium uppercase tracking-wider opacity-70">
                {s.label}
              </span>
              <s.icon className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-2xl font-[family-name:var(--font-heading)]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-8">
        <h2 className="text-lg font-[family-name:var(--font-heading)] mb-4">Recent Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground mb-4">
              No projects yet. Create your first quotation to get started.
            </p>
            <Button asChild variant="accent" size="sm">
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-[family-name:var(--font-ui)] font-medium text-foreground truncate">
                    {p.title}
                  </p>
                  <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground mt-0.5">
                    {(p.customers as unknown as { name: string } | null)?.name || "No customer"} · Updated{" "}
                    {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={p.status === "QUOTED" ? "default" : p.status === "VALIDATED" ? "secondary" : "outline"}>
                  {p.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
