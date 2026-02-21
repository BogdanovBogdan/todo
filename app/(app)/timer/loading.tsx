export default function Loading() {
  return (
    <div className="max-w-2xl w-full min-w-0">
      <div className="h-8 w-24 bg-gray-100 rounded-lg mb-6 animate-pulse" />
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
