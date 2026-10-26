import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// halaman publik sering dibuka langsung dari tautan yang dibagikan, jadi tidak ada riwayat untuk
// dikembalikan; location.key bernilai 'default' pada halaman pertama sesi
export function useBack(fallback = '/') {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    () => (location.key === 'default' ? navigate(fallback, { replace: true }) : navigate(-1)),
    [location.key, navigate, fallback],
  )
}
