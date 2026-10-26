import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY } from '../config'

const AuthContext = createContext(null)

function readStored() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStored)

  const login = useCallback((data) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    setAuth(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }, [])

  const updateUser = useCallback((patch) => {
    const stored = readStored()
    if (!stored) return
    const next = { ...stored, user: { ...stored.user, ...patch } }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }, [])

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      role: auth?.user?.role ?? null,
      isLoggedIn: Boolean(auth?.token),
      login,
      logout,
      updateUser,
    }),
    [auth, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook dan provider sengaja satu file
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}