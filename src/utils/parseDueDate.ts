/**
 * Natural language date parser for task due dates
 * Supports formats like:
 * - "tomorrow", "today", "next week"
 * - "monday", "next monday"
 * - "in 3 days", "in 2 weeks"
 * - "dec 25", "december 25", "12/25"
 * - "at 3pm", "at 15:00"
 * - "tomorrow at 5pm"
 */

export interface ParsedDateTime {
  date: string // YYYY-MM-DD
  time?: string // HH:MM
  original: string
}

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
}

function parseTime(timeStr: string): string | undefined {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!match) return undefined

  let hours = parseInt(match[1])
  const minutes = match[2] ? parseInt(match[2]) : 0
  const ampm = match[3]?.toLowerCase()

  if (ampm === 'pm' && hours < 12) hours += 12
  if (ampm === 'am' && hours === 12) hours = 0

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  const now = new Date()
  const currentDay = now.getDay()
  let daysUntil = dayOfWeek - currentDay

  if (daysUntil <= 0) {
    daysUntil += 7 // Next week if today or already passed
  }

  const result = new Date(now)
  result.setDate(now.getDate() + daysUntil)
  result.setHours(0, 0, 0, 0)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function parseNaturalDate(input: string): ParsedDateTime | null {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.toLowerCase().trim()
  const now = new Date()
  let resultDate = new Date(now)
  let resultTime: string | undefined

  // Extract time first (e.g., "at 3pm", "at 15:00")
  const timeMatch = trimmed.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i)
  if (timeMatch) {
    resultTime = parseTime(timeMatch[1])
  }

  // Remove time portion for date parsing
  let dateStr = trimmed.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i, '').trim()

  // Today
  if (dateStr === 'today') {
    return { date: formatDate(now), time: resultTime, original: input }
  }

  // Tomorrow
  if (dateStr === 'tomorrow') {
    resultDate.setDate(now.getDate() + 1)
    return { date: formatDate(resultDate), time: resultTime, original: input }
  }

  // Yesterday
  if (dateStr === 'yesterday') {
    resultDate.setDate(now.getDate() - 1)
    return { date: formatDate(resultDate), time: resultTime, original: input }
  }

  // Next week
  if (dateStr === 'next week') {
    resultDate.setDate(now.getDate() + 7)
    return { date: formatDate(resultDate), time: resultTime, original: input }
  }

  // In X days/weeks/months
  const inMatch = dateStr.match(/^in\s+(\d+)\s*(day|week|month|hour)s?$/)
  if (inMatch) {
    const value = parseInt(inMatch[1])
    const unit = inMatch[2]

    switch (unit) {
      case 'day':
        resultDate.setDate(now.getDate() + value)
        break
      case 'week':
        resultDate.setDate(now.getDate() + value * 7)
        break
      case 'month':
        resultDate.setMonth(now.getMonth() + value)
        break
      case 'hour':
        resultDate.setHours(now.getHours() + value)
        break
    }
    return { date: formatDate(resultDate), time: resultTime, original: input }
  }

  // Day of week (e.g., "monday", "next monday")
  const nextWeekMatch = dateStr.match(/^next\s+(\w+)$/)
  const dayOfWeekMatch = dateStr.match(/^(\w+)$/)

  for (const match of [nextWeekMatch, dayOfWeekMatch]) {
    if (!match) continue

    const dayName = (nextWeekMatch ? match[1] : match[1]).toLowerCase()
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName)

    if (dayIndex !== -1) {
      resultDate = getNextDayOfWeek(dayIndex)

      // If "next X", add another week
      if (nextWeekMatch) {
        resultDate.setDate(resultDate.getDate() + 7)
      }

      return { date: formatDate(resultDate), time: resultTime, original: input }
    }
  }

  // Month day (e.g., "dec 25", "december 25", "12/25")
  const monthDayMatch = dateStr.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?$/)
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1].toLowerCase()
    const day = parseInt(monthDayMatch[2])
    const month = MONTHS[monthStr]

    if (month !== undefined && day >= 1 && day <= 31) {
      resultDate.setMonth(month, day)
      // If this date already passed this year, use next year
      if (resultDate < now && resultDate.getFullYear() === now.getFullYear()) {
        resultDate.setFullYear(now.getFullYear() + 1)
      }
      return { date: formatDate(resultDate), time: resultTime, original: input }
    }
  }

  // Numeric date (MM/DD or MM/DD/YY)
  const numericMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (numericMatch) {
    const month = parseInt(numericMatch[1]) - 1
    const day = parseInt(numericMatch[2])
    let year = numericMatch[3] ? parseInt(numericMatch[3]) : now.getFullYear()

    if (year < 100) year += 2000

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      resultDate = new Date(year, month, day)
      return { date: formatDate(resultDate), time: resultTime, original: input }
    }
  }

  // Try standard date parsing as fallback
  const standardDate = new Date(dateStr)
  if (!isNaN(standardDate.getTime())) {
    return { date: formatDate(standardDate), time: resultTime, original: input }
  }

  return null
}

/**
 * Extract due date from task title using natural language
 * Returns the cleaned title and parsed date
 */
export function extractDueDateFromTitle(title: string): { cleanedTitle: string; dueDate: ParsedDateTime | null } {
  // Look for common patterns at the end of the title
  const patterns = [
    /\s+(today|tomorrow|yesterday|next\s+week)\b/i,
    /\s+(next\s+\w+)\b/i, // next monday, next week
    /\s+(\w+)\s+\d{1,2}(?:st|nd|rd|th)?\b/i, // dec 25
    /\s+in\s+\d+\s*(day|week|month|hour)s?\b/i,
    /\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/i, // 12/25
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      const potentialDate = match[0].trim()
      const parsed = parseNaturalDate(potentialDate)

      if (parsed) {
        return {
          cleanedTitle: title.replace(pattern, '').trim(),
          dueDate: parsed,
        }
      }
    }
  }

  return { cleanedTitle: title, dueDate: null }
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate: string, dueTime?: string | null): string {
  const date = new Date(dueDate + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (inputDate.getTime() === today.getTime()) {
    return `Today${dueTime ? ' at ' + dueTime : ''}`
  }

  if (inputDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow${dueTime ? ' at ' + dueTime : ''}`
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (inputDate.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric'
  }

  let formatted = date.toLocaleDateString('en-US', options)

  if (dueTime) {
    formatted += ' at ' + dueTime
  }

  return formatted
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate: string, dueTime?: string | null): boolean {
  const now = new Date()
  const taskDate = new Date(dueDate + 'T' + (dueTime || '23:59') + ':00')
  return taskDate < now
}
