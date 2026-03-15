import { apiFetch } from './client'
import type { FocusLog, FocusInsights, FocusCorrelation } from '../types'

export interface FocusDashboard {
  today: {
    logs: FocusLog[]
    avgFocus: number | null
  }
  yesterday: number | null
  weekDaily: Array<{ date: string; avgFocus: number; logCount: number }>
  monthDaily: Array<{ date: string; avgFocus: number; logCount: number }>
  correlations: FocusCorrelation[]
}

export interface DailyFocus {
  date: string
  avgFocus: number
  logCount: number
}

export const focusApi = {
  logFocus: (focusLevel: number, notes?: string, context?: { energy: string; sleep: string; mood: string[] }) =>
    apiFetch<FocusLog>('/focus', {
      method: 'POST',
      body: JSON.stringify({ focusLevel, notes, context }),
    }),

  getToday: () => apiFetch<FocusLog[]>('/focus/today'),

  getHistory: (days: number = 30) => apiFetch<FocusLog[]>(`/focus/history?days=${days}`),

  getDaily: (days: number = 30) => apiFetch<DailyFocus[]>(`/focus/daily?days=${days}`),

  getDashboard: () => apiFetch<FocusDashboard>('/focus/dashboard'),

  getInsights: (days: number = 30) => apiFetch<FocusInsights>(`/focus/insights?days=${days}`),

  computeCorrelations: (days: number = 30) =>
    apiFetch<{ message: string; daysAnalyzed: number; correlationScores: Record<string, number> }>(
      `/focus/compute-correlations?days=${days}`,
      { method: 'POST' }
    ),

  deleteLog: (id: string) => apiFetch<{ ok: boolean }>(`/focus/${id}`, { method: 'DELETE' }),
}
