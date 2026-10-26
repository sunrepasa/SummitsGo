import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { setPublicEntryLike } from '../api/publicProfile'

// Suka pada entri publik. Guest memicu dialog "Masuk dulu"; pengguna login diubah langsung di layar
// (optimistis) lalu dikembalikan bila server menolak. Satu hook per halaman melayani banyak entri.
export function usePublicLikes() {
  const { isLoggedIn } = useAuth()
  const toast = useToast()
  const [overrides, setOverrides] = useState({})
  const [needLogin, setNeedLogin] = useState(false)

  const stateOf = useCallback(
    (entry) => overrides[entry.slug] ?? { liked: entry.likedByMe, count: entry.likes },
    [overrides],
  )

  const toggle = useCallback(
    async (entry) => {
      if (!isLoggedIn) {
        setNeedLogin(true)
        return
      }
      const previous = overrides[entry.slug] ?? { liked: entry.likedByMe, count: entry.likes }
      const liked = !previous.liked
      setOverrides((o) => ({ ...o, [entry.slug]: { liked, count: previous.count + (liked ? 1 : -1) } }))
      try {
        await setPublicEntryLike(entry.slug, liked)
      } catch {
        setOverrides((o) => ({ ...o, [entry.slug]: previous }))
        toast.error('Gagal memperbarui suka. Coba lagi.')
      }
    },
    [isLoggedIn, overrides, toast],
  )

  return { stateOf, toggle, needLogin, closeLogin: () => setNeedLogin(false) }
}
