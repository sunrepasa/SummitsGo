import { useCallback, useEffect, useState } from 'react'

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, loading: false })
      })
    return () => {
      cancelled = true
    }
    // deps dioper dari pemanggil supaya hook ini bisa dipakai ulang untuk request lain
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, reload }
}