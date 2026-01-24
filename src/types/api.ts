export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface VoucherActivation {
  code: string
  username: string
}

export interface PurchaseData {
  email: string
  phone: string
  planId: string
}

export interface ConnectionStats {
  activeConnections: number
  totalUsers: number
  totalDataUsed: number
  averageUsage: number
}

export interface WebSocketMessage {
  type: string
  channel?: string
  data?: any
}

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}