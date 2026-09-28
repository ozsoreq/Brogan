import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

/**
 * A choice (like a game's difficulty) kept in the URL as `${base}/:choice`, so the
 * phone's back button and the in-app back arrow do the same thing: leave the game
 * and return to the picker. An unknown choice in the URL falls back to the picker.
 */
export function useRouteChoice<K extends string>(base: string, valid: readonly K[]) {
  const { choice: param } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const choice = valid.find((k) => k === param) ?? null

  useEffect(() => {
    if (param !== undefined && choice === null) navigate(base, { replace: true })
  }, [param, choice, base, navigate])

  const choose = useCallback((k: K) => navigate(`${base}/${k}`), [base, navigate])

  // Step back to the picker entry we came from; if the game was opened directly
  // (a bookmark or a reload), there is no such entry, so replace instead.
  const clear = useCallback(() => {
    if (location.key !== 'default') navigate(-1)
    else navigate(base, { replace: true })
  }, [location.key, base, navigate])

  return [choice, choose, clear] as const
}
