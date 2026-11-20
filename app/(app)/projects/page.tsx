import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus } from "lucide-react";
import { getProjects } from "@/lib/actions/projects";
import { formatNaira } from "@/lib/utils";

export default async function ProjectsPage() {
  const { data: projects } = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground">Projects</h1>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            All your saved designs and quotations.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center p-8">
            <FolderKanban className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground mb-4">
              No projects yet. Projects will appear here once saved.
            </p>
            <Button asChild variant="accent" size="sm">
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-[family-name:var(--font-ui)]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/projects/${p.id}`} className="font-medium text-foreground hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {(p.customers as { name: string } | null)?.name || " -"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={p.status === "QUOTED" ? "default" : p.status === "VALIDATED" ? "secondary" : "outline"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString()}
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
