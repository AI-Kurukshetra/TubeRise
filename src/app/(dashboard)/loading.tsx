export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded ml-2 animate-pulse" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-gray-100 shrink-0" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-24 animate-pulse" />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 h-64 animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
