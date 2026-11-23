export default function CustomersLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-28 bg-muted rounded mb-2" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-lg" />
      </div>
      <div className="bg-card rounded-xl border border-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-border/50">
            <div className="w-9 h-9 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
