export default function ProjectDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 bg-muted rounded mb-4" />
      <div className="h-7 w-64 bg-muted rounded mb-2" />
      <div className="flex gap-3 mb-6">
        <div className="h-5 w-16 bg-muted rounded-full" />
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="h-3 w-20 bg-muted rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
