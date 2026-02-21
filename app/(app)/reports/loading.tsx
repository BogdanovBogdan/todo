export default function Loading() {
  return (
    <div className="max-w-2xl w-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-32 bg-gray-100 rounded animate-pulse mb-8" />
      {/* Bar chart skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full bg-gray-100 rounded-t animate-pulse"
                style={{ height: `${20 + (i % 4) * 20}%` }}
              />
              <div className="h-2 w-4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      {/* Day skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-100 rounded animate-pulse flex-shrink-0" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse flex-1" style={{ width: `${50 + j * 15}%` }} />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
