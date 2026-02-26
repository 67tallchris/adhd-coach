import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '../../api/goals'
import type { GoalStatus } from '../../types'

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: ['goals', status],
    queryFn: () => goalsApi.list(status),
  })
}

export function useGoalDetail(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => goalsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof goalsApi.update>[1]) =>
      goalsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}
