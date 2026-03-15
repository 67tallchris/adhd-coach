import { create } from 'zustand'

interface LadderState {
  // Builder state
  isBuilderOpen: boolean
  builderGoalTitle: string
  builderGoalDescription: string
  builderSteps: Array<{ stepNumber: number; title: string; notes?: string }>
  builderLinkedTaskId?: string
  builderLinkedGoalId?: string

  // Actions
  openBuilder: (params?: { taskId?: string; goalId?: string }) => void
  closeBuilder: () => void
  setGoalTitle: (title: string) => void
  setGoalDescription: (description: string) => void
  addStep: () => void
  updateStep: (index: number, updates: Partial<{ title: string; notes: string }>) => void
  removeStep: (index: number) => void
  moveStepUp: (index: number) => void
  moveStepDown: (index: number) => void
  resetBuilder: () => void
}

export const useLadderStore = create<LadderState>((set) => ({
  // Initial builder state
  isBuilderOpen: false,
  builderGoalTitle: '',
  builderGoalDescription: '',
  builderSteps: [],
  builderLinkedTaskId: undefined,
  builderLinkedGoalId: undefined,

  openBuilder: (params) => set({
    isBuilderOpen: true,
    builderGoalTitle: '',
    builderGoalDescription: '',
    builderSteps: [],
    builderLinkedTaskId: params?.taskId,
    builderLinkedGoalId: params?.goalId,
  }),

  closeBuilder: () => set({ isBuilderOpen: false }),

  setGoalTitle: (title) => set({ builderGoalTitle: title }),

  setGoalDescription: (description) => set({ builderGoalDescription: description }),

  addStep: () => set((state) => {
    const nextNumber = state.builderSteps.length + 1
    return {
      builderSteps: [
        ...state.builderSteps,
        { stepNumber: nextNumber, title: '', notes: '' },
      ],
    }
  }),

  updateStep: (index, updates) => set((state) => {
    const newSteps = [...state.builderSteps]
    if (newSteps[index]) {
      newSteps[index] = { ...newSteps[index], ...updates }
    }
    return { builderSteps: newSteps }
  }),

  removeStep: (index) => set((state) => {
    const newSteps = state.builderSteps.filter((_, i) => i !== index)
    // Renumber steps
    return {
      builderSteps: newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })),
    }
  }),

  moveStepUp: (index) => set((state) => {
    if (index === 0) return state
    const newSteps = [...state.builderSteps]
    const temp = newSteps[index - 1]
    newSteps[index - 1] = newSteps[index]
    newSteps[index] = temp
    return {
      builderSteps: newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })),
    }
  }),

  moveStepDown: (index) => set((state) => {
    if (index >= state.builderSteps.length - 1) return state
    const newSteps = [...state.builderSteps]
    const temp = newSteps[index]
    newSteps[index] = newSteps[index + 1]
    newSteps[index + 1] = temp
    return {
      builderSteps: newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })),
    }
  }),

  resetBuilder: () => set({
    builderGoalTitle: '',
    builderGoalDescription: '',
    builderSteps: [],
    builderLinkedTaskId: undefined,
    builderLinkedGoalId: undefined,
  }),
}))
