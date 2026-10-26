import { todayIso } from './date'

// Checklist "aktif" = rencana tanggalnya belum lewat, atau belum diberi tanggal.
export const isActiveChecklist = (c, today = todayIso()) => !c.plannedDate || c.plannedDate >= today

// Trip aktif yang ditonjolkan: rencana terdekat yang bertanggal; kalau tidak ada, checklist aktif tanpa tanggal.
export function pickActiveTrip(checklists, today = todayIso()) {
  const active = checklists.filter((c) => isActiveChecklist(c, today))
  const dated = active.filter((c) => c.plannedDate).sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
  return dated[0] ?? active[0] ?? null
}
