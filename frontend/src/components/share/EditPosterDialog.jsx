import { X } from 'lucide-react'
import PosterDialog from './PosterDialog'
import { PosterPreview } from './PosterCanvas'
import { photoBackground, TEMPLATES } from '../../utils/posterTemplates'

const miniBackground = {
  full: 'linear-gradient(180deg,#6B8F6F 30%,#233B26)',
  card: 'linear-gradient(180deg,#6B8F6F 55%,#fff 55%)',
  minimal: 'linear-gradient(160deg,#24473A,#142822)',
}

export default function EditPosterDialog({ template, photoId, photos, data, onTemplate, onPhoto, onClose }) {
  const hasPhotos = photos.length > 0
  const photo = photos.find((p) => p.id === photoId) ?? photos[0]

  return (
    <PosterDialog title="Edit Poster" level={1} widthClass="w-[304px] md:w-[360px]" onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-base font-bold">Edit Poster</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="flex size-7 items-center justify-center rounded-full bg-stone text-mute"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mb-3.5">
        <PosterPreview scale={0.4519} template={template} data={data} photo={photo} />
      </div>

      <div className="mb-2 text-xs font-semibold">Template</div>
      <div className="mb-3.5 flex gap-2">
        {TEMPLATES.map((t) => {
          const disabled = t.needsPhoto && !hasPhotos
          const active = template === t.id
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onTemplate(t.id)}
              className={`flex-1 rounded-xl border-[1.5px] p-1.5 text-center text-[10px] font-semibold disabled:pointer-events-none disabled:opacity-40 ${
                active ? 'border-pine bg-[#EFF4EB]' : 'border-line'
              }`}
            >
              <div className="mb-[5px] h-[38px] rounded-[7px]" style={{ background: miniBackground[t.id] }} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mb-2 text-xs font-semibold">Foto poster</div>
      {hasPhotos ? (
        <div className={`mb-3.5 flex flex-wrap gap-2 ${template === 'minimal' ? 'pointer-events-none opacity-40' : ''}`}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Foto ${i + 1}`}
              aria-pressed={p.id === photo.id}
              onClick={() => onPhoto(p.id)}
              className={`size-12 rounded-[10px] border-2 ${p.id === photo.id ? 'border-pine' : 'border-transparent'}`}
              style={{ background: photoBackground(p) }}
            />
          ))}
        </div>
      ) : (
        <p className="mb-3 text-[11px] leading-normal text-mute">
          Entri ini belum punya foto, jadi hanya template Minimal yang bisa dipakai.
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-pine px-2.5 py-3 text-[13px] font-semibold text-white"
      >
        Selesai
      </button>
    </PosterDialog>
  )
}
