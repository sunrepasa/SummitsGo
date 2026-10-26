import { useState } from 'react'
import {
  Cloud,
  CloudRain,
  CloudSun,
  ExternalLink,
  Flame,
  Hospital,
  Info,
  Phone,
  Siren,
  Star,
  Sun,
  Users,
} from 'lucide-react'
import Section from './Section'
import { facilityIcon } from './facilityMeta'
import { statusLabel } from '../../../utils/mountainLabels'
import { facilityLabel, groupFacilities, telUrl, warningFacilities } from '../../../utils/mountainDetail'
import { formatDateRange } from '../../../utils/date'

// ---------- Statistik ringkas + tanggal pembaruan ----------

export function StatsBlock({ mountain: m }) {
  const open = m.status === 'open'
  const items = [
    { label: 'Ketinggian', value: `${m.elevation.toLocaleString('id-ID')} m` },
    { label: 'Estimasi naik', value: m.estimate ?? '—' },
    { label: 'Status Jalur', value: statusLabel[m.status], tone: open ? 'text-leaf-deep' : 'text-warn' },
    {
      label: `${m.reviewCount} ulasan`,
      value: (
        <span className="inline-flex items-center justify-center gap-1">
          {m.rating.toFixed(1)}
          <Star size={13} fill="#E0A93B" strokeWidth={0} />
        </span>
      ),
    },
  ]

  return (
    <div className="border-b border-line md:flex md:flex-col md:gap-3 md:border-0">
      <div className="flex gap-2.5 px-5 pb-2.5 pt-3.5 md:grid md:grid-cols-4 md:gap-3 md:p-0">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex-1 text-center md:rounded-2xl md:border md:border-line md:bg-paper md:p-4"
          >
            <b className={`block font-heading text-[14.5px] md:text-[21px] ${it.tone ?? ''}`}>{it.value}</b>
            <span className="text-[10.5px] text-mute md:text-[11.5px]">{it.label}</span>
          </div>
        ))}
      </div>
      {m.updatedAt && (
        <p className="px-5 pb-3 text-center text-[11px] text-mute md:px-0 md:pb-0 md:text-left md:text-xs">
          Data terakhir diperbarui {formatDateRange(m.updatedAt)}
        </p>
      )}
    </div>
  )
}

// ---------- Pendaki aktif ----------

export function ActiveClimbers({ count }) {
  const [showTip, setShowTip] = useState(false)
  if (count == null) return null

  return (
    <Section>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 md:gap-2.5 md:border-0 md:p-0">
        <Users size={16} className="shrink-0 text-mute" />
        <p className="flex-1 text-xs md:text-[13.5px]">
          <b>{count}</b> pendaki pengguna SummitsGo sedang mendaki gunung ini
        </p>
        <button
          type="button"
          onClick={() => setShowTip((v) => !v)}
          aria-expanded={showTip}
          aria-label="Tentang angka ini"
          className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-mute text-mute md:size-5"
        >
          <Info size={11} />
        </button>
      </div>
      {showTip && (
        <p className="mt-2 rounded-[10px] border border-line bg-[#EEF1EA] px-3 py-2.5 text-[11px] leading-normal text-mute md:mt-3 md:rounded-[11px] md:px-3.5 md:py-3 md:text-[12.5px]">
          <b>Tentang angka ini —</b> menunjukkan jumlah pengguna SummitsGo yang sedang aktif mendaki gunung
          ini, bukan jumlah total pendaki sebenarnya. Pendaki asli bisa lebih banyak dari ini.
        </p>
      )}
    </Section>
  )
}

// ---------- Gunung api ----------

const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

export function VolcanoStatus({ volcano }) {
  if (!volcano) return null

  return (
    <Section title="Status Aktivitas Gunung Api">
      <div className="rounded-[14px] border border-[#F0D3BD] bg-warnbg px-3.5 py-3 md:px-[18px] md:py-4">
        <p className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-warn md:text-[15px]">
          <Flame size={16} />
          {volcano.label} (Level {ROMAN[volcano.level] ?? volcano.level})
        </p>
        <p className="text-[11.5px] leading-relaxed text-[#6B4A36] md:text-[13px]">
          Terakhir diverifikasi {volcano.verifiedAt}. Cek kondisi terbaru sebelum berangkat.
          <br />
          Sumber:{' '}
          <a
            href={volcano.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-warn"
          >
            {volcano.source.label}
            <ExternalLink size={11} />
          </a>
        </p>
      </div>
    </Section>
  )
}

// ---------- Deskripsi ----------

export function Description({ text }) {
  if (!text) return null
  return (
    <Section title="Deskripsi">
      <p className="text-[12.5px] leading-[1.55] text-[#3A4640] md:text-sm md:leading-[1.7]">{text}</p>
    </Section>
  )
}

// ---------- Cuaca ----------

const weatherIcon = { sun: Sun, partly: CloudSun, cloud: Cloud, rain: CloudRain }

export function Weather({ state }) {
  const { data, error, loading } = state

  let body
  if (error) {
    body = <p className="text-xs text-warn">Gagal memuat prakiraan cuaca.</p>
  } else if (loading) {
    body = (
      <div className="flex animate-pulse gap-2 md:grid md:grid-cols-5 md:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[88px] w-16 shrink-0 rounded-xl bg-line md:h-[100px] md:w-auto" />
        ))}
      </div>
    )
  } else if (!data?.length) {
    return null
  } else {
    body = (
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {data.map((d) => {
          const Icon = weatherIcon[d.icon] ?? Cloud
          return (
            <div
              key={d.label}
              className="w-16 shrink-0 rounded-xl border border-line bg-paper px-1.5 py-2.5 text-center md:w-auto md:rounded-[14px] md:bg-stone md:py-3.5"
            >
              <p className="text-[10.5px] text-mute md:text-xs">{d.label}</p>
              <Icon size={20} className="mx-auto my-1.5 text-pine md:my-2" />
              <p className="text-xs font-semibold md:text-sm">{d.temp}°</p>
            </div>
          )
        })}
      </div>
    )
  }

  return <Section title="Prakiraan Cuaca">{body}</Section>
}

// ---------- Info pendakian ----------

export function HikingInfo({ info, hasBasecamp }) {
  if (!info) return null

  const rows = [
    { label: 'Cara daftar', value: info.registration },
    {
      label: 'Link resmi',
      value: info.officialLink && (
        <a
          href={info.officialLink.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-leaf-deep"
        >
          {info.officialLink.label}
          <ExternalLink size={12} />
        </a>
      ),
    },
    { label: 'Pemandu', value: info.guide },
    { label: 'Aturan & persyaratan', value: info.rules },
    { label: 'Waktu terbaik', value: info.bestTime },
  ].filter((r) => r.value)

  if (rows.length === 0) return null

  return (
    <Section title="Info Pendakian">
      <dl>
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex justify-between gap-4 border-t border-dashed border-line py-2 text-xs leading-normal first:border-t-0 first:pt-0 md:grid md:grid-cols-[170px_1fr] md:py-3 md:text-[13px]"
          >
            <dt className="shrink-0 text-mute">{r.label}</dt>
            <dd className="text-right md:text-left">{r.value}</dd>
          </div>
        ))}
      </dl>
      {hasBasecamp && (
        <p className="mt-2 text-[11px] leading-normal text-mute md:mt-3 md:text-xs">
          Harga tiket dan kontak basecamp ada di bagian Jalur &amp; Pos.
        </p>
      )}
    </Section>
  )
}

// ---------- Kontak darurat ----------

const emergencyIcon = { sar: Siren, clinic: Hospital }

export function EmergencyContacts({ contacts }) {
  if (!contacts?.length) return null

  return (
    <Section title="Kontak Darurat">
      <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {contacts.map((c) => {
          const Icon = emergencyIcon[c.type] ?? Siren
          return (
            <div
              key={`${c.type}-${c.name}`}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3 py-2.5 md:gap-3 md:rounded-[14px] md:p-3.5"
            >
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-warnbg text-warn md:size-10 md:rounded-[11px]">
                <Icon size={17} />
              </span>
              <p className="flex-1 text-xs leading-snug md:text-[12.5px]">
                <b className="block text-[12.5px] md:text-[13.5px]">{c.title}</b>
                <span className="text-mute">{c.name}</span>
              </p>
              <a
                href={telUrl(c.phone)}
                className="flex items-center gap-1 whitespace-nowrap rounded-full bg-[#E7F0E1] px-3 py-[7px] text-[11.5px] font-semibold text-pine-deep md:px-3.5 md:py-2 md:text-xs"
              >
                <Phone size={12} />
                Telepon
              </a>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ---------- Fasilitas & peringatan ----------

export function Facilities({ routes }) {
  const groups = groupFacilities(routes)
  if (groups.length === 0) return null

  return (
    <Section title="Fasilitas & Peringatan">
      <div className="md:grid md:grid-cols-2 md:gap-3">
        {groups.map(({ type, items }) => {
          const Icon = facilityIcon[type]
          const warn = warningFacilities.includes(type)
          return (
            <div
              key={type}
              className="flex items-center gap-3 border-t border-dashed border-line py-[9px] first:border-t-0 first:pt-0 md:items-start md:rounded-[14px] md:border md:border-solid md:p-3.5 md:first:border-t md:first:pt-3.5"
            >
              <span
                className={`flex size-[38px] shrink-0 items-center justify-center rounded-full md:size-10 ${
                  warn ? 'bg-warnbg text-warn' : 'bg-[#E7F0E1] text-pine'
                }`}
              >
                <Icon size={17} />
              </span>
              <p className="text-[11.5px] leading-snug text-mute md:text-[12.5px] md:leading-[1.45]">
                <b className="block text-[12.5px] text-ink md:text-[13.5px]">{facilityLabel[type]}</b>
                {items.join(', ')}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
