import { SettingsCard } from './SettingsParts'

const faqs = [
  {
    q: 'Apa arti badge "Terverifikasi" pada logbook?',
    a: 'Entri logbook mendapat badge ini bila pendakiannya terdeteksi otomatis dari lokasimu. Entri yang kamu isi sendiri lewat "Tambah Manual" tidak mendapat badge.',
  },
  {
    q: 'Apakah Live Location jalan saat aplikasi ditutup?',
    a: 'Tidak. Live Location memakai lokasi browser dan hanya aktif selama tab SummitsGo terbuka dan layar menyala.',
  },
  {
    q: 'Bagaimana cara memakai peta tanpa sinyal?',
    a: 'Unduh peta gunung saat masih ada koneksi. Peta tersimpan di perangkatmu dan tetap bisa dibuka saat offline di jalur.',
  },
  {
    q: 'Siapa yang bisa melihat logbook saya?',
    a: 'Hanya kamu, kecuali entri yang kamu aktifkan di "Logbook Ditampilkan Publik". Entri publik bisa dibuka siapa saja lewat tautannya.',
  },
  {
    q: 'Bagaimana cara mengundang teman ke checklist?',
    a: 'Buka checklist, ketuk tambah anggota, lalu cari username temanmu. Kamu juga bisa membagikan tautan undangan sebagai cadangan.',
  },
]

export default function HelpPane() {
  return (
    <SettingsCard title="Bantuan & Dukungan" desc="Pertanyaan yang sering diajukan.">
      <div className="mt-2">
        {faqs.map((f) => (
          <details key={f.q} className="group border-t border-line py-3 first:border-t-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold">
              {f.q}
              <span className="text-mute transition-transform group-open:rotate-90" aria-hidden="true">
                ›
              </span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-mute md:text-[13px]">{f.a}</p>
          </details>
        ))}
      </div>
    </SettingsCard>
  )
}
