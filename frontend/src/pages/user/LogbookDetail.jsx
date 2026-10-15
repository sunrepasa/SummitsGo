import { useState } from 'react'
import { BookOpen, PenLine, Trash2 } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import CrewSection from '../../components/logbook/detail/CrewSection'
import EntryActions from '../../components/logbook/detail/EntryActions'
import EntryStats from '../../components/logbook/detail/EntryStats'
import LikeButton from '../../components/logbook/detail/LikeButton'
import LogbookHero from '../../components/logbook/detail/LogbookHero'
import NoteSection from '../../components/logbook/detail/NoteSection'
import PhotoSection from '../../components/logbook/detail/PhotoSection'
import ReviewModal from '../../components/mountain/detail/ReviewModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  MAX_PHOTOS,
  addLogbookPhoto,
  deleteLogbook,
  getLogbookById,
  setLogbookLike,
  updateLogbookNote,
} from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'

function NotFound({ notFound, onRetry }) {
  return (
    <div className="px-[30px] py-24 text-center text-mute">
      <BookOpen size={42} strokeWidth={1.5} className="mx-auto mb-3" />
      <h1 className="mb-1.5 font-heading text-base text-ink md:text-lg">
        {notFound ? 'Entri logbook tidak ditemukan' : 'Gagal memuat entri logbook'}
      </h1>
      <p className="mb-4 text-xs md:text-[13px]">
        {notFound ? 'Entri ini tidak ada atau sudah dihapus.' : 'Periksa koneksi lalu coba lagi.'}
      </p>
      {notFound ? (
        <Link to="/logbook" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
          Ke Logbook
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse md:pt-[70px]" aria-busy="true" aria-label="Memuat entri logbook">
      <div className="h-[150px] bg-line md:mb-[22px] md:h-[230px] md:rounded-[22px]" />
      <div className="space-y-3 px-5 pt-4 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-6 md:space-y-0 md:px-0 md:pt-0">
        <div className="space-y-3">
          <div className="h-14 rounded-2xl bg-line" />
          <div className="h-[150px] rounded-2xl bg-line" />
          <div className="h-[110px] rounded-2xl bg-line" />
        </div>
        <div className="hidden h-[220px] rounded-[18px] bg-line md:block" />
      </div>
    </div>
  )
}

function DetailContent({ id }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: entry, error, loading, reload } = useAsync(() => getLogbookById(id), [id])

  const [editingNote, setEditingNote] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // suka diubah langsung di layar (optimistis), lalu dikembalikan bila server menolak
  const [likeOverride, setLikeOverride] = useState(null)

  if (loading) return <DetailSkeleton />
  if (error) return <NotFound notFound={error.status === 404} onRetry={reload} />

  const like = likeOverride ?? { liked: entry.likedByMe, count: entry.likes }
  const hasCrew = entry.verified && entry.crew.length > 0

  const toggleLike = async () => {
    const previous = like
    const liked = !previous.liked
    setLikeOverride({ liked, count: previous.count + (liked ? 1 : -1) })
    try {
      await setLogbookLike(entry.id, liked)
    } catch {
      setLikeOverride(previous)
      toast.error('Gagal memperbarui suka. Coba lagi.')
    }
  }

  const saveNote = async (note) => {
    setSavingNote(true)
    try {
      await updateLogbookNote(entry.id, note)
      setEditingNote(false)
      toast.success('Catatan disimpan')
      reload()
    } catch {
      toast.error('Gagal menyimpan catatan. Coba lagi.')
    } finally {
      setSavingNote(false)
    }
  }

  const addPhoto = async (file) => {
    setUploading(true)
    try {
      await addLogbookPhoto(entry.id, file)
      toast.success('Foto ditambahkan')
      reload()
    } catch (err) {
      toast.error(err.code === 'PHOTO_LIMIT' ? err.message : 'Gagal mengunggah foto. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await deleteLogbook(entry.id)
      toast.success('Entri logbook dihapus')
      navigate('/logbook', { replace: true })
    } catch {
      toast.error('Gagal menghapus entri. Coba lagi.')
      setConfirmDelete(false)
      setDeleting(false)
    }
  }

  const startEdit = () => setEditingNote(true)
  const share = () => toast.success('Segera hadir: bagikan entri logbook')

  return (
    <>
      <LogbookHero entry={entry} onEditNote={startEdit} onShare={share} onDelete={() => setConfirmDelete(true)} />

      <div className="pb-6 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6 md:pb-12">
        <div className="min-w-0 md:flex md:flex-col md:gap-[18px]">
          <div className="border-b border-line px-5 py-3 md:hidden">
            <LikeButton liked={like.liked} count={like.count} onToggle={toggleLike} />
          </div>

          <EntryStats entry={entry} />

          <PhotoSection
            photos={entry.photos}
            max={MAX_PHOTOS}
            uploading={uploading}
            onAdd={addPhoto}
            onError={toast.error}
          />

          <NoteSection
            note={entry.note}
            editing={editingNote}
            saving={savingNote}
            onEdit={startEdit}
            onCancel={() => setEditingNote(false)}
            onSave={saveNote}
          />

          {hasCrew && <CrewSection variant="mobile" crew={entry.crew} checklistName={entry.checklistName} />}

          <div className="px-5 pt-4 md:hidden">
            <button
              type="button"
              onClick={() => setReviewing(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-pine py-3 text-[13px] font-semibold text-white"
            >
              <PenLine size={15} />
              Tulis Review dari Sini
            </button>
          </div>
        </div>

        <aside className="hidden md:sticky md:top-[88px] md:flex md:flex-col md:gap-4">
          <LikeButton variant="card" liked={like.liked} count={like.count} onToggle={toggleLike} />
          {hasCrew && <CrewSection variant="desktop" crew={entry.crew} checklistName={entry.checklistName} />}
          <EntryActions
            onReview={() => setReviewing(true)}
            onShare={share}
            onEditNote={startEdit}
            onDelete={() => setConfirmDelete(true)}
          />
        </aside>
      </div>

      {reviewing && (
        <ReviewModal
          mountain={entry.mountain}
          route={entry.route}
          logbookId={entry.id}
          verified={entry.verified}
          onClose={() => setReviewing(false)}
          onSaved={() => {
            setReviewing(false)
            toast.success('Ulasan terkirim')
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title="Hapus entri logbook ini?"
          confirmLabel="Ya, Hapus"
          busy={deleting}
          busyLabel="Menghapus..."
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(false)}
        >
          Entri{' '}
          <b>
            {entry.mountain.name} — Via {entry.route}
          </b>{' '}
          akan dihapus beserta foto dan catatannya.
          {entry.isPublic && ' Tautan publiknya juga tidak bisa dibuka lagi.'}
        </ConfirmDialog>
      )}
    </>
  )
}

// halaman ini hanya untuk pemilik entri; guest diarahkan ke Login lalu kembali ke sini
export default function LogbookDetail() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <DetailContent key={id} id={id} />
}
