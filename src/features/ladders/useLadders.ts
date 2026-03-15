import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { laddersApi } from '../../api/ladders'

export function useLadders(params?: { status?: 'active' | 'completed' | 'archived' }) {
  return useQuery({
    queryKey: ['ladders', params],
    queryFn: () => laddersApi.list(params),
  })
}

export function useLadder(id: string) {
  return useQuery({
    queryKey: ['ladders', id],
    queryFn: () => laddersApi.get(id),
    enabled: !!id,
  })
}

export function useCreateLadder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: laddersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ladders'] }),
  })
}

export function useUpdateLadder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof laddersApi.update>[1]) =>
      laddersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ladders'] }),
  })
}

export function useDeleteLadder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: laddersApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ladders'] }),
  })
}

export function useAddStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ladderId, ...data }: { ladderId: string } & Parameters<typeof laddersApi.addStep>[1]) =>
      laddersApi.addStep(ladderId, data),
    onSuccess: (_, { ladderId }) => qc.invalidateQueries({ queryKey: ['ladders', ladderId] }),
  })
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: { ladderId: string; stepId: string; isCompleted: boolean }) =>
      laddersApi.updateStep(variables.ladderId, variables.stepId, { isCompleted: variables.isCompleted }),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['ladders', variables.ladderId] }),
  })
}

export function useDeleteStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ladderId, stepId }: { ladderId: string; stepId: string }) =>
      laddersApi.deleteStep(ladderId, stepId),
    onSuccess: (_, { ladderId }) => qc.invalidateQueries({ queryKey: ['ladders', ladderId] }),
  })
}
