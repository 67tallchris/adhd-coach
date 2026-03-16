import { apiFetch } from './client'

export interface UserProfile {
  id: string
  displayName: string | null
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface TimezoneOption {
  value: string
  label: string
}

export const settingsApi = {
  getProfile: () => apiFetch<UserProfile>('/settings/profile'),

  updateProfile: (data: { displayName?: string | null; timezone?: string }) =>
    apiFetch<UserProfile>('/settings/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTimezones: () => apiFetch<TimezoneOption[]>('/settings/timezones'),
}
