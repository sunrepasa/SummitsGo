import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'

const MAX_BYTES = 5 * 1024 * 1024

export default function PhotoPicker({ onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('File harus berupa gambar')
    if (file.size > MAX_BYTES) return setError('Ukuran foto maksimal 5 MB')
    setError('')
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  const clear = () => {
    setPreview(null)
    setError('')
    onChange(null)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pick}
        tabIndex={-1}
        className="sr-only"
      />

      {preview ? (
        <div className="relative w-fit">
          <img src={preview} alt="Pratinjau foto" className="h-[120px] max-w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus foto"
            className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-[rgba(20,30,25,.65)] text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-line p-[18px] text-[11.5px] text-mute md:text-xs"
        >
          <Camera size={20} />
          <span>
            <span className="md:hidden">Tap</span>
            <span className="hidden md:inline">Klik</span> untuk unggah foto
          </span>
        </button>
      )}

      {error && <p className="mt-1.5 text-[11px] font-semibold text-warn">{error}</p>}
    </div>
  )
}