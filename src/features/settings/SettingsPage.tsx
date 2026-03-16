import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Clock, Save, Check, AlertCircle, Bell, Smartphone, Download } from 'lucide-react'
import clsx from 'clsx'
import { settingsApi } from '../../api/settings'
import { useFocusReminders } from '../../hooks/useFocusReminders'
import { usePWA, useServiceWorker } from '../../hooks/usePWA'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('UTC')
  const [saved, setSaved] = useState(false)

  // Focus reminders state
  const { config: focusConfig, updateConfig } = useFocusReminders()
  const { isInstalled, promptInstall, browserInfo, hasPrompt } = usePWA()
  const { notificationPermission, requestNotificationPermission, scheduleFocusReminders } = useServiceWorker()
  const [localFocusConfig, setLocalFocusConfig] = useState(focusConfig)
  const [showInstallInstructions, setShowInstallInstructions] = useState(false)
  const [focusRemindersSaved, setFocusRemindersSaved] = useState(false)

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => settingsApi.getProfile(),
  })

  const { data: timezones } = useQuery({
    queryKey: ['timezones'],
    queryFn: () => settingsApi.getTimezones(),
  })

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setTimezone(profile.timezone || 'UTC')
    }
  }, [profile])

  // Sync focus config
  useEffect(() => {
    setLocalFocusConfig(focusConfig)
  }, [focusConfig])

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName?: string | null; timezone?: string }) =>
      settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleSave = () => {
    updateProfileMutation.mutate({
      displayName: displayName.trim() || null,
      timezone,
    })
  }

  const handleSaveFocusReminders = async () => {
    updateConfig(localFocusConfig)
    await scheduleFocusReminders(localFocusConfig.enabled)
    setFocusRemindersSaved(true)
    setTimeout(() => setFocusRemindersSaved(false), 2000)
  }

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      await scheduleFocusReminders(true)
    }
  }

  const handleInstallClick = async () => {
    const success = await promptInstall()
    if (!success) {
      setShowInstallInstructions(true)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800/40 rounded-lg w-1/3"></div>
          <div className="h-32 bg-gray-800/40 rounded-2xl"></div>
          <div className="h-32 bg-gray-800/40 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: new Date(0, 0, 0, i).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
  }))

  const intervalOptions = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 150, label: '2.5 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-sm text-gray-400">
          Customize your experience
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              This name will be shown throughout the app
            </p>
          </div>
        </div>
      </div>

      {/* Timezone Section */}
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Time & Date</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors appearance-none cursor-pointer"
          >
            {timezones?.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Your timezone is used for daily streaks and time-based features
          </p>
        </div>
      </div>

      {/* Focus Reminders Section */}
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Focus Reminders</h2>
        </div>

        {/* PWA Installation Banner */}
        {!isInstalled && (
          <div className="mb-6 p-4 bg-gradient-to-br from-brand-900/30 to-purple-900/30 rounded-xl border border-brand-700/40">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-600/30 text-brand-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">Install for Better Reminders</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Install ADHD Coach as an app to receive focus reminders even when the app is closed!
                </p>
              </div>
            </div>
            
            {showInstallInstructions && browserInfo ? (
              <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/40">
                <p className="text-xs text-gray-300 font-medium mb-2">📱 Install on {browserInfo.name}:</p>
                <p className="text-xs text-gray-400">{browserInfo.installInstructions}</p>
                <button
                  onClick={() => setShowInstallInstructions(false)}
                  className="mt-2 text-xs text-brand-400 hover:text-brand-300"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {hasPrompt ? 'Install Now' : 'Show Install Instructions'}
              </button>
            )}
          </div>
        )}

        {/* Notification Permission */}
        <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className={clsx('w-4 h-4', notificationPermission === 'granted' ? 'text-green-400' : 'text-gray-400')} />
              <span className="text-sm font-medium text-white">Notifications</span>
            </div>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full',
              notificationPermission === 'granted'
                ? 'bg-green-900/30 text-green-400'
                : notificationPermission === 'denied'
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-yellow-900/30 text-yellow-400'
            )}>
              {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : 'Not set'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {isInstalled
              ? 'App installed! Enable notifications to receive reminders even when the app is closed.'
              : notificationPermission === 'granted'
                ? 'Notifications enabled. Keep the app open to receive reminders.'
                : notificationPermission === 'denied'
                  ? 'Notifications blocked. Enable in browser settings.'
                  : 'Enable notifications + install app for best experience!'}
          </p>
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="w-full py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Enable Reminders</span>
          </div>
          <button
            onClick={() => setLocalFocusConfig({ ...localFocusConfig, enabled: !localFocusConfig.enabled })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              localFocusConfig.enabled ? 'bg-brand-600' : 'bg-gray-700'
            )}
          >
            <div
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                localFocusConfig.enabled ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {/* Active Hours */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Start Time
            </label>
            <select
              value={localFocusConfig.startTime}
              onChange={(e) => setLocalFocusConfig({ ...localFocusConfig, startTime: parseInt(e.target.value, 10) })}
              disabled={!localFocusConfig.enabled}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-600 disabled:opacity-50"
            >
              {timeOptions.map((opt) => (
                <option key={`start-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-2">
              <Clock className="w-3 h-3" />
              End Time
            </label>
            <select
              value={localFocusConfig.endTime}
              onChange={(e) => setLocalFocusConfig({ ...localFocusConfig, endTime: parseInt(e.target.value, 10) })}
              disabled={!localFocusConfig.enabled}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-600 disabled:opacity-50"
            >
              {timeOptions.map((opt) => (
                <option key={`end-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reminder Frequency */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Minimum Interval</label>
            <select
              value={localFocusConfig.minIntervalMinutes}
              onChange={(e) => setLocalFocusConfig({ ...localFocusConfig, minIntervalMinutes: parseInt(e.target.value, 10) })}
              disabled={!localFocusConfig.enabled}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-600 disabled:opacity-50"
            >
              {intervalOptions.map((opt) => (
                <option key={`min-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Maximum Interval</label>
            <select
              value={localFocusConfig.maxIntervalMinutes}
              onChange={(e) => setLocalFocusConfig({ ...localFocusConfig, maxIntervalMinutes: parseInt(e.target.value, 10) })}
              disabled={!localFocusConfig.enabled}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-600 disabled:opacity-50"
            >
              {intervalOptions.map((opt) => (
                <option key={`max-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Note */}
        <div className="mb-6 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
          <p className="text-xs text-blue-300">
            💡 Reminders are randomized between the min and max intervals to keep them unpredictable and less annoying.
          </p>
        </div>
      </div>

      {/* Save Buttons */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Profile saved!</span>
          </div>
        )}
        {focusRemindersSaved && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Reminders saved!</span>
          </div>
        )}
        {updateProfileMutation.isError && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to save</span>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleSaveFocusReminders}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          Save Reminders
        </button>
      </div>
    </div>
  )
}
