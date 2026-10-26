import { useEffect, useState } from 'react'

// Waktu sekarang yang diperbarui berkala, untuk teks seperti "diperbarui 2 menit lalu". intervalMs kosong = berhenti.
export function useNow(intervalMs) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!intervalMs) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
