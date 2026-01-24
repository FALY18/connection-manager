import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Connection } from '@/lib/api'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name: string
}

interface AppState {
  // Authentication
  user: User | null
  isAuthenticated: boolean
  token: string | null
  
  // Connections
  connections: Connection[]
  connectionStats: {
    active: number
    total: number
    dataUsed: number
    averageUsage: number
  }
  
  // UI State
  isLoading: boolean
  error: string | null
  lastUpdated: number
  
  // WebSocket
  isConnected: boolean
  reconnectAttempts: number
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setConnections: (connections: Connection[]) => void
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void
  removeConnection: (connectionId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setWebSocketStatus: (connected: boolean) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  logout: () => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
  connections: [],
  connectionStats: {
    active: 0,
    total: 0,
    dataUsed: 0,
    averageUsage: 0
  },
  isLoading: false,
  error: null,
  lastUpdated: 0,
  isConnected: false,
  reconnectAttempts: 0
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        setToken: (token) => set({ token }),
        
        setConnections: (connections) => {
          const active = connections.filter(c => c.status === 'active').length
          const dataUsed = connections.reduce((sum, c) => sum + c.dataUsed, 0)
          const dataLimit = connections.reduce((sum, c) => sum + c.dataLimit, 0)
          
          set({
            connections,
            connectionStats: {
              active,
              total: connections.length,
              dataUsed,
              averageUsage: dataLimit > 0 ? (dataUsed / dataLimit) * 100 : 0
            },
            lastUpdated: Date.now()
          })
        },
        
        updateConnection: (connectionId, updates) => {
          const connections = get().connections.map(conn =>
            conn.id === connectionId ? { ...conn, ...updates } : conn
          )
          get().setConnections(connections)
        },
        
        removeConnection: (connectionId) => {
          const connections = get().connections.filter(conn => conn.id !== connectionId)
          get().setConnections(connections)
        },
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error }),
        
        setWebSocketStatus: (isConnected) => set({ isConnected }),
        
        incrementReconnectAttempts: () => set(state => ({ 
          reconnectAttempts: state.reconnectAttempts + 1 
        })),
        
        resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
        
        logout: () => set({
          user: null,
          isAuthenticated: false,
          token: null,
          connections: [],
          connectionStats: initialState.connectionStats
        }),
        
        reset: () => set(initialState)
      }),
      {
        name: 'wifi-connect-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'wifi-connect-store'
    }
  )
)

// Selectors for better performance
export const useAuth = () => useAppStore(state => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  token: state.token,
  setUser: state.setUser,
  setToken: state.setToken,
  logout: state.logout
}))

export const useConnections = () => useAppStore(state => ({
  connections: state.connections,
  stats: state.connectionStats,
  setConnections: state.setConnections,
  updateConnection: state.updateConnection,
  removeConnection: state.removeConnection,
  lastUpdated: state.lastUpdated
}))

export const useUI = () => useAppStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
  setLoading: state.setLoading,
  setError: state.setError
}))

export const useWebSocket = () => useAppStore(state => ({
  isConnected: state.isConnected,
  reconnectAttempts: state.reconnectAttempts,
  setWebSocketStatus: state.setWebSocketStatus,
  incrementReconnectAttempts: state.incrementReconnectAttempts,
  resetReconnectAttempts: state.resetReconnectAttempts
}))