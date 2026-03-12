import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nudgesApi } from '../../api/nudges'

export function useLatestNudge() {
  return useQuery({
    queryKey: ['nudges', 'latest'],
    queryFn: () => nudgesApi.list({ limit: 1 }),
    select: (rows) => rows[0] ?? null,
  })
}

export function useNudges(limit = 20) {
  return useQuery({
    queryKey: ['nudges', { limit }],
    queryFn: () => nudgesApi.list({ limit }),
  })
}

export function useGenerateNudge(provider: 'claude' | 'qwen' = 'qwen') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => nudgesApi.generate('manual_refresh', provider),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nudges'] }),
  })
}

export function useMarkNudgeRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => nudgesApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nudges'] }),
  })
}
