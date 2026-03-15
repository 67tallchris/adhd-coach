import { useState } from 'react'
import { X, Bell, Clock, Settings } from 'lucide-react'
import clsx from 'clsx'
import { useFocusReminders } from '../../hooks/useFocusReminders'

interface FocusReminderSettingsProps {
  onClose: () => void
}

export function FocusReminderSettings({ onClose }: FocusReminderSettingsProps) {
  const { config, updateConfig } = useFocusReminders()
  const [localConfig, setLocalConfig] = useState(config)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  const handleSave = () => {
    updateConfig(localConfig)
    onClose()
  }

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Focus Reminders</h3>
              <p className="text-xs text-gray-400">Get gentle nudges to log your focus</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Permission */}
        <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className={clsx('w-4 h-4', notificationPermission === 'granted' ? 'text-green-400' : 'text-gray-400')} />
              <span className="text-sm font-medium text-white">Browser Notifications</span>
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
            {notificationPermission === 'granted'
              ? 'Notifications are enabled. You\'ll receive random reminders during active hours.'
              : notificationPermission === 'denied'
                ? 'Notifications are blocked. Please enable them in your browser settings.'
                : 'Enable notifications to receive focus reminders.'}
          </p>
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Enable Reminders</span>
          </div>
          <button
            onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              localConfig.enabled ? 'bg-brand-600' : 'bg-gray-700'
            )}
          >
            <div
              className={clsx(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                localConfig.enabled ? 'left-7' : 'left-1'
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
              value={localConfig.startTime}
              onChange={(e) => setLocalConfig({ ...localConfig, startTime: parseInt(e.target.value, 10) })}
              disabled={!localConfig.enabled}
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
              value={localConfig.endTime}
              onChange={(e) => setLocalConfig({ ...localConfig, endTime: parseInt(e.target.value, 10) })}
              disabled={!localConfig.enabled}
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
              value={localConfig.minIntervalMinutes}
              onChange={(e) => setLocalConfig({ ...localConfig, minIntervalMinutes: parseInt(e.target.value, 10) })}
              disabled={!localConfig.enabled}
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
              value={localConfig.maxIntervalMinutes}
              onChange={(e) => setLocalConfig({ ...localConfig, maxIntervalMinutes: parseInt(e.target.value, 10) })}
              disabled={!localConfig.enabled}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!localConfig.enabled && notificationPermission !== 'granted'}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
