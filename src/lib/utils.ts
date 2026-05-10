import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date string to relative time (e.g. "3 days ago") */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/** Format a number with commas (e.g. 12345 → "12,345") */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Generate a WhatsApp share URL */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Material type labels */
export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  full_notes: 'Full Notes',
  summary: 'AI Summary',
  unit_test: 'Unit Test',
  youtube: 'Video',
}

/** Material type badge colors */
export const MATERIAL_TYPE_COLORS: Record<string, string> = {
  full_notes: 'bg-bg-navy-soft text-primary-navy',
  summary:    'bg-bg-lime-soft text-accent-lime-dark',
  unit_test:  'bg-amber-50 text-warn-amber',
  youtube:    'bg-red-50 text-danger-red',
}

/** Branch options */
export const BRANCHES = ['CSE', 'IT', 'ECE', 'ME', 'CE', 'ALL'] as const
export type Branch = typeof BRANCHES[number]
