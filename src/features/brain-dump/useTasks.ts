import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../../api/tasks'
import type { TaskStatus } from '../../types'

export function useTasks(params?: { status?: TaskStatus; goalId?: string }) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.list(params),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof tasksApi.update>[1]) =>
      tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.complete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useSnoozeTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) => tasksApi.snooze(id, until),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
