export default function ProjectsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-24 bg-muted rounded mb-2" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg" />
      </div>
      <div className="bg-card rounded-xl border border-border">
        <div className="border-b border-border px-6 py-4 flex gap-8">
          {["w-20", "w-24", "w-16", "w-20"].map((w, i) => (
            <div key={i} className={`h-4 ${w} bg-muted rounded`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-8 px-6 py-4 border-b border-border/50">
            <div className="h-4 w-40 bg-muted rounded flex-1" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
