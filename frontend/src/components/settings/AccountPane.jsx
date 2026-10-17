import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeleteAccountDialog from './DeleteAccountDialog'
import { ComingSoon, SettingRow, SettingsCard, linkButton } from './SettingsParts'
import { deleteAccount } from '../../api/user'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSignOut } from '../../hooks/useSignOut'
import { formatDateRange } from '../../utils/date'

export default function AccountPane() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const doDelete = async () => {
    setBusy(true)
    setError('')
    try {
      await deleteAccount(user.username)
      toast.success('Akunmu sudah dihapus')
      signOut()
    } catch {
      setError('Gagal menghapus akun. Coba lagi.')
      setBusy(false)
    }
  }

  return (
    <>
      <SettingsCard title="Informasi Akun" desc="Data dasar akunmu.">
        <SettingRow title="Email">
          <span className="text-mute">{user.email}</span>
          <ComingSoon />
        </SettingRow>
        <SettingRow title="Username" desc="Ubah username lewat Edit Profil.">
          <span className="text-mute">@{user.username}</span>
          <Link to="/profile" state={{ edit: true }} className={linkButton}>
            Edit Profil
          </Link>
        </SettingRow>
        <SettingRow title="Bergabung sejak">
          <span className="text-mute">{user.joinedAt ? formatDateRange(user.joinedAt) : '–'}</span>
        </SettingRow>
        <SettingRow title="Status akun">
          <span className="font-semibold text-leaf-deep">Aktif</span>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Zona Berbahaya" danger>
        <SettingRow title="Hapus Akun" desc="Seluruh data akunmu akan dihapus dan tidak bisa dikembalikan.">
          <button
            type="button"
            onClick={() => setDeleting(true)}
            className="rounded-xl border border-warn px-4 py-2 text-[12.5px] font-semibold text-warn hover:bg-warnbg"
          >
            Hapus Akun
          </button>
        </SettingRow>
      </SettingsCard>

      {deleting && (
        <DeleteAccountDialog
          busy={busy}
          error={error}
          onConfirm={doDelete}
          onCancel={() => {
            setDeleting(false)
            setError('')
          }}
        />
      )}
    </>
  )
}
