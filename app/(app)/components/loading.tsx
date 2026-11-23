export default function ComponentsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 bg-muted rounded mb-2" />
      <div className="h-4 w-64 bg-muted rounded mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-5 w-24 bg-muted rounded mb-3" />
          <div className="bg-card rounded-xl border border-border">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-6 px-6 py-3 border-b border-border/50">
                <div className="h-4 w-40 bg-muted rounded flex-1" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
