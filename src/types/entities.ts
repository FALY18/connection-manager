export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name: string
}

export interface Connection {
  id: string
  username: string
  plan: string
  ipAddress: string
  macAddress: string
  dataUsed: number
  dataLimit: number
  timeRemaining: string
  devices: number
  status: 'active' | 'expiring' | 'expired'
  startTime: string
  isBlocked?: boolean
}

export interface Plan {
  id: string
  name: string
  duration: string
  durationMinutes: number
  dataLimit: number
  maxDevices: number
  price: number
  color: string
  description?: string
}

export interface Voucher {
  id: string
  code: string
  planId: string
  planName: string
  status: 'unused' | 'used' | 'expired'
  createdAt: string
  usedAt?: string
  usedBy?: string
}

export interface UserSession {
  username: string
  planName: string
  planDuration: string
  dataUsed: number
  dataLimit: number
  connectedTime: string
  timeRemaining: string
  ipAddress: string
  status: 'active' | 'inactive'
}