export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300
} as const

export const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200',
  expiring: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200',
  expired: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200',
  default: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200'
} as const

export const STATUS_LABELS = {
  active: 'Actif',
  expiring: 'Expirant',
  expired: 'Expiré'
} as const

export const TOAST_ICONS = {
  success: 'CheckCircle',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
  info: 'Info'
} as const

export const TOAST_COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
} as const