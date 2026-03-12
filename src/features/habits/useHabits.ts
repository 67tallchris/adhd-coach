import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitsApi } from '../../api/habits'

export function useHabitHistory() {
  return useQuery({
    queryKey: ['habits', 'history'],
    queryFn: habitsApi.history,
  })
}

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.list,
  })
}

export function useHabitStreak(id: string) {
  return useQuery({
    queryKey: ['habits', id, 'streak'],
    queryFn: () => habitsApi.streak(id),
    enabled: !!id,
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
    },
    onError: (error) => {
      console.error('Failed to create habit:', error)
      alert(`Failed to create habit: ${error.message}`)
    },
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof habitsApi.update>[1]) =>
      habitsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useCheckHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.check(id, date),
    onSuccess: (_, { id }) => {
      // Update the cache immediately for responsive UI
      qc.setQueryData(['habits'], (old: any[] = []) => {
        return old.map(habit => 
          habit.id === id ? { ...habit, completedToday: true } : habit
        )
      })
      // Also refetch to ensure data consistency
      qc.refetchQueries({ queryKey: ['habits'] })
    },
    onError: (error) => {
      console.error('Failed to check habit:', error)
      alert(`Failed to check habit: ${error.message}`)
    },
  })
}

export function useUncheckHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.uncheck(id, date),
    onSuccess: (_, { id }) => {
      // Update the cache immediately for responsive UI
      qc.setQueryData(['habits'], (old: any[] = []) => {
        return old.map(habit => 
          habit.id === id ? { ...habit, completedToday: false } : habit
        )
      })
      // Also refetch to ensure data consistency
      qc.refetchQueries({ queryKey: ['habits'] })
    },
    onError: (error) => {
      console.error('Failed to uncheck habit:', error)
      alert(`Failed to uncheck habit: ${error.message}`)
    },
  })
}
