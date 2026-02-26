import { useEffect } from 'react'

export function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      if (e.key === key && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}
