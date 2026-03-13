export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:block">
        <div className="p-5 space-y-3">
          <div className="h-6 w-32 rounded-md bg-subtle animate-pulse" />
          <div className="h-5 w-full rounded-md bg-subtle animate-pulse" />
          <div className="h-5 w-full rounded-md bg-subtle animate-pulse" />
          <div className="h-5 w-full rounded-md bg-subtle animate-pulse" />
        </div>
      </aside>
      <div className="flex-1 p-8 bg-page">
        <div className="mb-8 h-7 w-48 rounded-md bg-subtle animate-pulse" />
        <div className="flex gap-3 mb-6">
          <div className="h-10 flex-1 rounded-lg bg-subtle animate-pulse" />
          <div className="h-10 w-48 rounded-lg bg-subtle animate-pulse" />
        </div>
        <div className="card overflow-hidden">
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-3.5 border-b border-border/60">
                <div className="h-4 rounded-md bg-subtle animate-pulse" style={{ width: `${60 + Math.random() * 20}%`, flexBasis: '25%' }} />
                <div className="h-4 rounded-md bg-subtle animate-pulse" style={{ width: `${50 + Math.random() * 20}%`, flexBasis: '30%' }} />
                <div className="h-4 rounded-md bg-subtle animate-pulse hidden sm:block" style={{ width: `${40 + Math.random() * 20}%`, flexBasis: '25%' }} />
                <div className="h-4 w-10 rounded-md bg-subtle animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
