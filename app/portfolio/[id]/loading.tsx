export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard mx-auto mb-4"></div>
        <p className="text-deep-purple">Loading portfolio details...</p>
      </div>
    </div>
  )
}
