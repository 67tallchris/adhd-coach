import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Zap } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

export default function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  useKeyboardShortcut('n', () => setOpen(true))

  useEffect(() => {
    if (open) {
      setValue('')
      setSaved(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || saving) return

    setSaving(true)
    try {
      await tasksApi.create({ title: value.trim() })
      await qc.invalidateQueries({ queryKey: ['tasks'] })
      setSaved(true)
      setValue('')
      setTimeout(() => {
        setSaved(false)
        inputRef.current?.focus()
      }, 800)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-gray-800">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-medium text-gray-400">Brain Dump — press Enter to save, add more</span>
              <span className="ml-auto text-xs text-gray-600">Esc to close</span>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-lg text-gray-100 placeholder-gray-600 outline-none"
                autoComplete="off"
              />
              {saved && (
                <p className="mt-2 text-xs text-green-400">Captured! Type another or press Esc.</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 rounded-lg transition-colors"
                >
                  Done
                </button>
                <button
                  type="submit"
                  disabled={!value.trim() || saving}
                  className="px-4 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : 'Capture ↵'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
