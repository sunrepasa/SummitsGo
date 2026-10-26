import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ListChecks, Trash2, UserPlus, UserMinus } from 'lucide-react'
import AddItemModal from '../../components/checklist/detail/AddItemModal'
import DetailHeader from '../../components/checklist/detail/DetailHeader'
import InviteModal from '../../components/checklist/detail/InviteModal'
import ItemList from '../../components/checklist/detail/ItemList'
import LeaderActions from '../../components/checklist/detail/LeaderActions'
import MemberList from '../../components/checklist/detail/MemberList'
import MembersSheet from '../../components/checklist/detail/MembersSheet'
import Recommendations from '../../components/checklist/detail/Recommendations'
import SaveTemplateModal from '../../components/checklist/detail/SaveTemplateModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  addItem,
  cancelInvitation,
  claimItem,
  deleteChecklist,
  getChecklistById,
  removeItem,
  removeMember,
  setItemDone,
  unclaimItem,
} from '../../api/checklist'
import { useAsync } from '../../hooks/useAsync'

const errorMessages = {
  ALREADY_CLAIMED: 'Barang ini sudah diklaim anggota lain.',
  FORBIDDEN: 'Kamu tidak punya izin untuk aksi ini.',
  NOT_FOUND: 'Checklist atau barang tidak ditemukan.',
}
const errorMessage = (err) => errorMessages[err.code] ?? 'Gagal memproses. Coba lagi.'

function NotFound({ notFound, onRetry }) {
  return (
    <div className="px-[30px] py-24 text-center text-mute">
      <ListChecks size={42} strokeWidth={1.5} className="mx-auto mb-3" />
      <h1 className="mb-1.5 font-heading text-base text-ink md:text-lg">
        {notFound ? 'Checklist tidak ditemukan' : 'Gagal memuat checklist'}
      </h1>
      <p className="mb-4 text-xs md:text-[13px]">
        {notFound
          ? 'Checklist ini tidak ada, sudah dihapus, atau kamu bukan anggotanya.'
          : 'Periksa koneksi lalu coba lagi.'}
      </p>
      {notFound ? (
        <Link to="/checklist" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
          Ke Checklist Saya
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
    <div className="animate-pulse px-5 pt-4 md:px-0 md:pt-[70px]" aria-busy="true" aria-label="Memuat checklist">
      <div className="mb-4 h-[110px] rounded-2xl bg-line md:h-[130px] md:rounded-[20px]" />
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-6">
        <div className="space-y-3">
          <div className="h-[150px] rounded-2xl bg-line" />
          <div className="h-[190px] rounded-2xl bg-line" />
        </div>
        <div className="hidden h-[220px] rounded-[18px] bg-line md:block" />
      </div>
    </div>
  )
}

function DetailContent({ id }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: c, error, loading, reload } = useAsync(() => getChecklistById(id), [id])

  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [kickTarget, setKickTarget] = useState(null)
  const [itemTarget, setItemTarget] = useState(null)
  const [addedRecos, setAddedRecos] = useState([])

  if (loading) return <DetailSkeleton />
  if (error) return <NotFound notFound={error.status === 404} onRetry={reload} />

  const progress = { done: c.items.filter((i) => i.done).length, total: c.items.length }
  const isLeader = c.role === 'leader'
  const categories = [...new Set(c.items.map((i) => i.category))]

  // setelah aksi apa pun data dimuat ulang dari sumbernya, jadi tampilan tidak pernah menebak hasilnya
  const run = async (action, successMessage) => {
    setBusy(true)
    try {
      await action()
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      reload()
      setBusy(false)
    }
  }

  const addRecommendation = (rec) =>
    run(async () => {
      await addItem(c.id, { name: rec.name, category: rec.category })
      setAddedRecos((list) => [...list, rec])
    })

  const confirmKick = async () => {
    const target = kickTarget
    setKickTarget(null)
    await run(() => removeMember(c.id, target.id), `${target.name} dikeluarkan dari checklist`)
  }

  const confirmRemoveItem = async () => {
    const target = itemTarget
    setItemTarget(null)
    await run(() => removeItem(c.id, target.id), 'Barang dihapus')
  }

  const doDelete = async () => {
    setBusy(true)
    try {
      await deleteChecklist(c.id)
      toast.success('Checklist dihapus')
      navigate('/checklist', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
      setConfirmDelete(false)
      setBusy(false)
    }
  }

  const openInvite = () => {
    setShowMembers(false)
    setInviting(true)
  }

  const itemTargetOwner = itemTarget?.ownerId && c.members.find((m) => m.id === itemTarget.ownerId)

  return (
    <>
      <DetailHeader
        checklist={c}
        progress={progress}
        onShowMembers={() => setShowMembers(true)}
        onInvite={openInvite}
      />

      <div className="pb-6 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6 md:pb-12">
        <div className="min-w-0">
          <ItemList
            checklist={c}
            busy={busy}
            onClaim={(item) => run(() => claimItem(c.id, item.id))}
            onUnclaim={(item) => run(() => unclaimItem(c.id, item.id))}
            onToggle={(item, done) => run(() => setItemDone(c.id, item.id, done))}
            onDelete={setItemTarget}
            onAdd={() => setAdding(true)}
          />
          <Recommendations
            mountainName={c.mountain.name}
            recommendations={c.recommendations}
            added={addedRecos}
            busy={busy}
            onAdd={addRecommendation}
          />

          {isLeader && (
            <div className="mt-5 px-5 md:hidden">
              <LeaderActions onSaveTemplate={() => setSavingTemplate(true)} onDelete={() => setConfirmDelete(true)} />
              <p className="mt-2.5 text-center text-[10px] text-mute">
                Undang anggota cocok untuk menyiapkan barang bersama sebelum berangkat
              </p>
            </div>
          )}
        </div>

        <aside className="hidden md:sticky md:top-[88px] md:flex md:flex-col md:gap-4">
          <section className="rounded-[18px] border border-line bg-paper p-5">
            <h2 className="mb-3.5 font-heading text-[15px] font-bold">Anggota Rombongan</h2>
            <MemberList
              checklist={c}
              busy={busy}
              onKick={setKickTarget}
              onCancelInvite={(invite) => run(() => cancelInvitation(c.id, invite.id), 'Undangan dibatalkan')}
            />
            {isLeader && (
              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={openInvite}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-pine py-[11px] text-[13px] font-semibold text-white hover:bg-pine-deep"
                >
                  <UserPlus size={14} />
                  Undang Anggota
                </button>
                <p className="mt-2 text-[11.5px] leading-normal text-mute">
                  Cocok untuk menyiapkan barang bersama sebelum berangkat.
                </p>
              </div>
            )}
          </section>

          {isLeader && (
            <section className="rounded-[18px] border border-line bg-paper p-5">
              <h2 className="mb-3.5 font-heading text-[15px] font-bold">Pengaturan Ketua</h2>
              <LeaderActions onSaveTemplate={() => setSavingTemplate(true)} onDelete={() => setConfirmDelete(true)} />
            </section>
          )}
        </aside>
      </div>

      {adding && (
        <AddItemModal
          checklistId={c.id}
          categories={categories}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            toast.success('Barang ditambahkan')
            reload()
          }}
        />
      )}
      {inviting && <InviteModal checklistId={c.id} onClose={() => setInviting(false)} onInvited={reload} />}
      {showMembers && (
        <MembersSheet
          checklist={c}
          busy={busy}
          onClose={() => setShowMembers(false)}
          onKick={(m) => {
            setShowMembers(false)
            setKickTarget(m)
          }}
          onCancelInvite={(invite) => run(() => cancelInvitation(c.id, invite.id), 'Undangan dibatalkan')}
          onInvite={openInvite}
        />
      )}
      {savingTemplate && (
        <SaveTemplateModal
          checklist={c}
          onClose={() => setSavingTemplate(false)}
          onSaved={() => {
            setSavingTemplate(false)
            toast.success('Template disimpan ke Template Saya')
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title="Hapus checklist ini?"
          confirmLabel="Ya, Hapus"
          busy={busy}
          busyLabel="Menghapus..."
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(false)}
        >
          Checklist <b>{c.mountain.name}</b> akan dihapus untuk semua anggota dan tidak bisa dikembalikan.
        </ConfirmDialog>
      )}
      {kickTarget && (
        <ConfirmDialog
          icon={UserMinus}
          danger
          title={`Keluarkan ${kickTarget.name}?`}
          confirmLabel="Ya, Keluarkan"
          onConfirm={confirmKick}
          onCancel={() => setKickTarget(null)}
        >
          Barang yang ia klaim kembali ke &quot;belum diklaim&quot; dan status centangnya dihapus.
        </ConfirmDialog>
      )}
      {itemTarget && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title="Hapus barang ini?"
          confirmLabel="Ya, Hapus"
          onConfirm={confirmRemoveItem}
          onCancel={() => setItemTarget(null)}
        >
          <b>{itemTarget.name}</b> akan dihapus dari checklist
          {itemTargetOwner ? ` (diklaim ${itemTargetOwner.name})` : ''}.
        </ConfirmDialog>
      )}
    </>
  )
}

// halaman ini hanya untuk anggota yang login; guest diarahkan ke Login lalu kembali ke sini
export default function ChecklistDetail() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <DetailContent key={id} id={id} />
}
