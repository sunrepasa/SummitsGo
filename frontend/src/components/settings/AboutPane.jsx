import { SettingsCard } from './SettingsParts'

export const APP_VERSION = '1.0.0'

export default function AboutPane() {
  return (
    <SettingsCard title="Tentang SummitsGo" desc={`SummitsGo · Versi ${APP_VERSION}`}>
      <p className="mt-2 text-[13px] leading-relaxed text-mute">
        SummitsGo adalah sistem informasi pendakian gunung berbasis web: data gunung dan jalur, checklist
        barang bersama, ulasan komunitas, logbook pribadi, serta peta offline dan Live Location yang bisa
        dibuka langsung dari browser.
      </p>
      <p className="mt-3 text-[12px] leading-relaxed text-mute">
        Dikembangkan sebagai tugas mata kuliah Pemrograman Web Lanjutan, Universitas Primakara.
      </p>
    </SettingsCard>
  )
}
