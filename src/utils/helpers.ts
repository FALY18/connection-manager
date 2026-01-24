export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h${String(minutes).padStart(2, '0')}m${String(secs).padStart(2, '0')}s`
  }
  return `${minutes}m${String(secs).padStart(2, '0')}s`
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const generateShortCode = (planId: string, index: number): string => {
  const letter = String.fromCharCode(65 + (index % 26)) // A-Z
  const number = String(Math.floor(index / 26) + 1).padStart(4, '0')
  return `${planId}${letter}${number}`
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200'
    case 'expiring':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200'
    case 'expired':
      return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200'
    default:
      return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200'
  }
}

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'Actif'
    case 'expiring': return 'Expirant'
    case 'expired': return 'Expiré'
    default: return status
  }
}