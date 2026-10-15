import { useRef } from 'react'
import { Plus } from 'lucide-react'
import Section from '../../mountain/detail/Section'

const MAX_BYTES = 5 * 1024 * 1024
const tile = 'h-24 w-24 shrink-0 rounded-xl md:h-auto md:w-auto md:aspect-[4/3] md:rounded-[14px]'

export default function PhotoSection({ photos, max, uploading, onAdd, onError }) {
  const inputRef = useRef(null)
  const full = photos.length >= max

  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return onError('File harus berupa gambar')
    if (file.size > MAX_BYTES) return onError('Ukuran foto maksimal 5 MB')
    onAdd(file)
  }

  return (
    <Section title="Foto">
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} tabIndex={-1} className="sr-only" />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0">
        {photos.map((p, i) =>
          p.url ? (
            <img key={p.id} src={p.url} alt={`Foto pendakian ${i + 1}`} className={`${tile} object-cover`} />
          ) : (
            <div
              key={p.id}
              role="img"
              aria-label={`Foto pendakian ${i + 1}`}
              className={tile}
              style={{ background: `linear-gradient(160deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
            />
          ),
        )}

        {uploading && (
          <div
            className={`${tile} flex animate-pulse items-center justify-center bg-line text-[11px] text-mute`}
            aria-live="polite"
          >
            Mengunggah...
          </div>
        )}

        {!full && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Tambah foto"
            className={`${tile} flex flex-col items-center justify-center gap-1 border-[1.5px] border-dashed border-line text-xs text-mute hover:bg-[#EEF2EA]`}
          >
            <Plus size={20} />
            <span className="hidden md:inline">Tambah Foto</span>
          </button>
        )}
      </div>

      {full && <p className="mt-2.5 text-[11px] text-mute">Batas {max} foto per entri sudah tercapai.</p>}
    </Section>
  )
}
