export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  
  // Connections
  CONNECTIONS: '/connections',
  DISCONNECT: (id: string) => `/connections/${id}/disconnect`,
  BLOCK: (id: string) => `/connections/${id}/block`,
  DATA_LIMIT: (id: string) => `/connections/${id}/data-limit`,
  TIME_LIMIT: (id: string) => `/connections/${id}/time-limit`,
  
  // Vouchers
  VOUCHERS: '/vouchers',
  ACTIVATE_VOUCHER: '/vouchers/activate',
  GENERATE_VOUCHERS: '/vouchers/generate',
  
  // Plans
  PLANS: '/plans',
  PLAN: (id: string) => `/plans/${id}`,
  
  // Stats
  STATS: '/stats',
  SESSION: '/session'
} as const

export const WS_EVENTS = {
  SUBSCRIBE: 'subscribe',
  CONNECTION_UPDATE: 'connection_update',
  CONNECTION_NEW: 'connection_new',
  CONNECTION_REMOVED: 'connection_removed',
  STATS_UPDATE: 'stats_update'
} as const

export const WS_CHANNELS = {
  CONNECTIONS: 'connections',
  STATS: 'stats'
} as const