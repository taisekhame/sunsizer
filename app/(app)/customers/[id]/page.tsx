import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/actions/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, FolderKanban } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: customer, error } = await getCustomer(id);
  if (error || !customer) return notFound();

  const projects = (customer.projects || []) as Array<{
    id: string;
    title: string;
    status: string;
    updated_at: string;
  }>;

  return (
    <div>
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-sm font-[family-name:var(--font-ui)] text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-2">
            {customer.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-[family-name:var(--font-ui)]">
            {customer.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {customer.phone}
              </span>
            )}
            {customer.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {customer.email}
              </span>
            )}
            {customer.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {customer.address}
              </span>
            )}
          </div>
        </div>
      </div>

      {customer.site_address && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h2 className="text-sm font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Site Address
          </h2>
          <p className="text-sm font-[family-name:var(--font-body)] text-foreground">{customer.site_address}</p>
        </div>
      )}

      {customer.notes && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h2 className="text-sm font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Notes
          </h2>
          <p className="text-sm font-[family-name:var(--font-body)] text-foreground whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-[family-name:var(--font-heading)]">Projects</h2>
          <Button asChild variant="accent" size="sm">
            <Link href="/projects/new">New Project</Link>
          </Button>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
              No projects for this customer yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-[family-name:var(--font-ui)] font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={p.status === "QUOTED" ? "default" : "outline"}>{p.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
