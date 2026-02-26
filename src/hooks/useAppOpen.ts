import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { nudgesApi } from '../api/nudges'

// Generates one nudge per browser session on app open
export function useAppOpen() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const key = 'adhd_nudge_session'
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    nudgesApi.generate('app_open')
      .then(() => queryClient.invalidateQueries({ queryKey: ['nudges'] }))
      .catch(console.error)
  }, [queryClient])
}
