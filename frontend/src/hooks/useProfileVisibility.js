import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { setProfilePublic } from '../api/user'

// profil publik aktif secara bawaan; sesi lama yang belum punya field ini dianggap publik
export function useProfileVisibility() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const isPublic = user.isProfilePublic ?? true

  const change = async (next) => {
    if (saving) return
    setSaving(true)
    updateUser({ isProfilePublic: next })
    try {
      await setProfilePublic(next)
    } catch {
      updateUser({ isProfilePublic: !next })
      toast.error('Gagal mengubah privasi profil. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return { isPublic, saving, change }
}
