import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'

export function useUserProfile() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => settingsApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    profile,
    isLoading,
    error,
    timezone: profile?.timezone || 'UTC',
    displayName: profile?.displayName,
  }
}
