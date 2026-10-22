import { useRef, useState } from 'react'
import { Download, Link as LinkIcon, MessageCircle, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import EditPosterDialog from './EditPosterDialog'
import PosterCanvas, { PosterPreview } from './PosterCanvas'
import PosterDialog from './PosterDialog'
import { useToast } from '../../context/ToastContext'
import { copyText, publicEntryUrl } from '../../utils/clipboard'
import { downloadBlob, posterFilename, posterToBlob } from '../../utils/posterImage'
import { entryShareText, displayUrl, whatsappShareUrl } from '../../utils/shareLinks'

// Dialog Bagikan Poster untuk satu entri logbook milik pengguna.
// username boleh kosong; poster lalu tampil tanpa baris @username.
export default function ShareEntryDialog({ entry, username, onClose }) {
  const toast = useToast()
  const exportRef = useRef(null)
  const photos = entry.photos
  const [template, setTemplate] = useState(photos.length > 0 ? 'full' : 'minimal')
  const [photoId, setPhotoId] = useState(photos[0]?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const link = entry.isPublic && entry.slug ? publicEntryUrl(entry.slug) : null
  const photo = photos.find((p) => p.id === photoId) ?? photos[0]
  const data = {
    mountainName: entry.mountain.name,
    route: entry.route,
    startDate: entry.startDate,
    endDate: entry.endDate,
    nights: entry.nights,
    elevation: entry.mountain.elevation.toLocaleString('id-ID'),
    verified: entry.verified,
    username,
  }

  const copy = async () => {
    if (!(await copyText(link))) {
      toast.error('Browser menolak menyalin. Salin tautannya secara manual.')
      return
    }
    setCopied(true)
    toast.success('Tautan disalin')
    setTimeout(() => setCopied(false), 1600)
  }

  const download = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const blob = await posterToBlob(exportRef.current)
      downloadBlob(blob, posterFilename(entry.mountain.name, entry.route))
    } catch {
      toast.error('Gagal membuat gambar poster. Coba lagi.')
    } finally {
      setDownloading(false)
    }
  }

  const shareWhatsApp = () => {
    const text = entryShareText({ mountainName: entry.mountain.name, route: entry.route, url: link })
    window.open(whatsappShareUrl(text), '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <PosterDialog title="Bagikan entri logbook" onClose={onClose} floatingClose closeOnEscape={!editing}>
        <div className="md:hidden">
          <PosterPreview scale={0.8} template={template} data={data} photo={photo} />
        </div>
        <div className="hidden md:block">
          <PosterPreview scale={0.95} template={template} data={data} photo={photo} />
        </div>

        {link ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-stone py-[5px] pl-3 pr-[5px]">
            <LinkIcon size={13} className="shrink-0 text-mute" />
            <div className="min-w-0 flex-1 truncate text-[11.5px] text-mute">{displayUrl(link)}</div>
            <button
              type="button"
              onClick={copy}
              className={`whitespace-nowrap rounded-[9px] px-3.5 py-2 text-xs font-semibold text-white ${
                copied ? 'bg-leaf-deep' : 'bg-pine'
              }`}
            >
              {copied ? 'Tersalin ✓' : 'Salin'}
            </button>
          </div>
        ) : (
          <p className="mt-3.5 rounded-xl bg-stone px-3 py-[11px] text-[11.5px] leading-[1.55] text-mute">
            Entri ini masih privat.{' '}
            <Link to="/settings/public-logbook" className="font-semibold text-leaf-deep">
              Jadikan publik di Pengaturan &amp; Privasi
            </Link>{' '}
            untuk membagikan tautannya.
          </p>
        )}

        <div className="mt-3 flex gap-2 md:mt-3.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Edit template"
            aria-label="Edit template poster"
            className="flex w-[46px] shrink-0 items-center justify-center rounded-xl border border-line bg-paper"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-pine px-2.5 py-3 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            <Download size={14} />
            {downloading ? 'Membuat...' : 'Unduh'}
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex flex-[1.25] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E7F0E1] px-2.5 py-3 text-[13px] font-semibold text-pine-deep md:flex-[1.6]"
          >
            <MessageCircle size={14} />
            <span className="md:hidden">WhatsApp</span>
            <span className="hidden md:inline">Kirim ke WhatsApp</span>
          </button>
        </div>
      </PosterDialog>

      {editing && (
        <EditPosterDialog
          template={template}
          photoId={photo?.id ?? null}
          photos={photos}
          data={data}
          onTemplate={setTemplate}
          onPhoto={setPhotoId}
          onClose={() => setEditing(false)}
        />
      )}

      {/* salinan ukuran asli di luar layar; inilah yang dirender menjadi PNG */}
      <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0">
        <div ref={exportRef}>
          <PosterCanvas template={template} data={data} photo={photo} rounded={false} />
        </div>
      </div>
    </>
  )
}
