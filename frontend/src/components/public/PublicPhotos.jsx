import Section from '../mountain/detail/Section'

// foto entri publik, hanya untuk dilihat; bagian disembunyikan bila tidak ada foto
export default function PublicPhotos({ photos }) {
  if (photos.length === 0) return null

  return (
    <Section title="Foto">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0">
        {photos.map((p, i) => {
          const tile = 'h-24 w-24 shrink-0 rounded-xl md:h-auto md:w-auto md:aspect-[4/3] md:rounded-[14px]'
          return p.url ? (
            <img key={p.id} src={p.url} alt={`Foto pendakian ${i + 1}`} className={`${tile} object-cover`} />
          ) : (
            <div
              key={p.id}
              role="img"
              aria-label={`Foto pendakian ${i + 1}`}
              className={tile}
              style={{ background: `linear-gradient(160deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
            />
          )
        })}
      </div>
    </Section>
  )
}
