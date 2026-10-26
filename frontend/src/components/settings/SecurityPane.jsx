import { useState } from 'react'
import ChangePasswordModal from './ChangePasswordModal'
import { ComingSoon, SettingRow, SettingsCard, linkButton } from './SettingsParts'
import { useToast } from '../../context/ToastContext'

// fitur keamanan lanjutan ada di desain, tetapi di luar cakupan tahap ini
const upcoming = [
  { title: 'Verifikasi 2 Langkah', desc: 'Kode OTP ke email saat masuk dari perangkat baru' },
  { title: 'Notifikasi Login Baru', desc: 'Email otomatis jika ada login dari perangkat atau lokasi baru' },
  { title: 'Perangkat Aktif', desc: 'Lihat dan keluarkan perangkat yang sedang masuk' },
  { title: 'Riwayat Aktivitas Login', desc: 'Termasuk percobaan login yang gagal' },
  { title: 'Unduh Data Saya', desc: 'Ekspor logbook, checklist, dan ulasan' },
]

export default function SecurityPane() {
  const toast = useToast()
  const [changing, setChanging] = useState(false)

  return (
    <>
      <SettingsCard title="Keamanan" desc="Lindungi akunmu dari akses yang tidak dikenal.">
        <SettingRow title="Ganti Kata Sandi" desc="Gunakan kata sandi yang kuat dan tidak dipakai di tempat lain.">
          <button type="button" onClick={() => setChanging(true)} className={linkButton}>
            Ganti ›
          </button>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Fitur keamanan lainnya" desc="Sedang disiapkan dan belum bisa dipakai.">
        {upcoming.map((item) => (
          <SettingRow key={item.title} title={item.title} desc={item.desc}>
            <ComingSoon />
          </SettingRow>
        ))}
      </SettingsCard>

      {changing && (
        <ChangePasswordModal
          onClose={() => setChanging(false)}
          onSaved={() => {
            setChanging(false)
            toast.success('Kata sandi berhasil diganti')
          }}
        />
      )}
    </>
  )
}
