import { useCallback, useEffect, useState } from 'react'
import { checkUsername } from '../api/user'

const DEBOUNCE_MS = 400
const NONE = { username: '', status: 'idle' }

// status: 'idle' | 'checking' | 'available' | 'taken' | 'error'
export function useUsernameCheck(username, skip) {
  const [result, setResult] = useState(NONE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (skip) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsername(username)
        if (!cancelled) setResult({ username, status: available ? 'available' : 'taken' })
      } catch {
        if (!cancelled) setResult({ username, status: 'error' })
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [username, skip, attempt])

  const retry = useCallback(() => {
    setResult(NONE)
    setAttempt((a) => a + 1)
  }, [])

  if (skip) return { status: 'idle', retry }
  // hasil milik username lain dianggap usang, jadi selama menunggu statusnya "checking"
  return { status: result.username === username ? result.status : 'checking', retry }
}