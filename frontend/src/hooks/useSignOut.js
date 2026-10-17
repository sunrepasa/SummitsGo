import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// Keluar dilakukan dalam dua langkah: pindah ke Beranda dengan penanda, lalu UserLayout memanggil
// logout() setelah Beranda tampil. Memanggil logout() langsung bersamaan dengan navigate() membuat
// halaman asal sempat dirender dalam keadaan logout dan mengarahkan ke /login.
export function useSignOut() {
  const navigate = useNavigate()
  return useCallback(() => navigate('/', { replace: true, state: { signOut: true } }), [navigate])
}
