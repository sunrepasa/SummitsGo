export default function DetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Memuat detail gunung">
      <div className="md:pt-6">
        <div className="h-[210px] bg-line md:mb-6 md:h-[250px] md:rounded-[22px]" />
      </div>
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-6">
        <div className="space-y-4 px-5 pt-4 md:space-y-[18px] md:px-0 md:pt-0">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-12 rounded-xl bg-line md:h-[76px] md:rounded-2xl" />
            ))}
          </div>
          <div className="h-12 rounded-xl bg-line md:rounded-[18px]" />
          <div className="h-[170px] rounded-xl bg-line md:rounded-[18px]" />
          <div className="h-[120px] rounded-xl bg-line md:rounded-[18px]" />
        </div>
        <div className="hidden h-[330px] rounded-[18px] bg-line md:block" />
      </div>
    </div>
  )
}
