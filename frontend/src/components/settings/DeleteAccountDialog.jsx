import { useState } from 'react'
import { UserX } from 'lucide-react'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Input } from '../ui/FormControls'

export const DELETE_WORD = 'HAPUS'

export default function DeleteAccountDialog({ busy, error, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('')

  return (
    <ConfirmDialog
      icon={UserX}
      danger
      title="Hapus akun secara permanen?"
      confirmLabel="Hapus Akun"
      busy={busy}
      busyLabel="Menghapus..."
      confirmDisabled={typed !== DELETE_WORD}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p className="mb-3">
        Semua logbook, checklist, dan ulasanmu akan ikut terhapus dan tidak bisa dikembalikan. Ketik{' '}
        <b className="text-ink">{DELETE_WORD}</b> untuk melanjutkan.
      </p>
      <Input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={`Ketik ${DELETE_WORD}`}
        aria-label={`Ketik ${DELETE_WORD} untuk konfirmasi`}
        autoComplete="off"
        className="text-center"
      />
      {error && <p className="mt-2 text-[11.5px] font-semibold text-warn">{error}</p>}
    </ConfirmDialog>
  )
}
