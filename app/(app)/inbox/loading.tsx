export default function Loading() {
  return (
    <div className="max-w-2xl w-full min-w-0">
      <div className="h-8 w-24 bg-gray-100 rounded-lg mb-6 animate-pulse" />
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100">
            <div className="w-[18px] h-[18px] rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="h-4 bg-gray-100 rounded animate-pulse flex-1" style={{ width: `${60 + (i % 3) * 15}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
