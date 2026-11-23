export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border p-5 bg-card">
            <div className="h-3 w-24 bg-muted rounded mb-4" />
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="h-5 w-36 bg-muted rounded mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4">
            <div className="flex-1">
              <div className="h-4 w-48 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
