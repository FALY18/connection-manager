import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketState {
  socket: WebSocket | null
  isConnected: boolean
  error: string | null
  reconnectAttempts: number
}

export function useWebSocket({ url, reconnectInterval = 3000, maxReconnectAttempts = 5 }: WebSocketConfig) {
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    error: null,
    reconnectAttempts: 0
  })
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const shouldReconnect = useRef(true)

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          socket: ws,
          isConnected: true,
          error: null,
          reconnectAttempts: 0
        }))
      }

      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false, socket: null }))
        
        if (shouldReconnect.current && state.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }))
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = () => {
        setState(prev => ({ ...prev, error: 'WebSocket connection failed' }))
      }

    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to create WebSocket connection' }))
    }
  }, [url, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts])

  const disconnect = useCallback(() => {
    shouldReconnect.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    state.socket?.close()
  }, [state.socket])

  const sendMessage = useCallback((message: string | object) => {
    if (state.socket && state.isConnected) {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      state.socket.send(data)
    }
  }, [state.socket, state.isConnected])

  useEffect(() => {
    connect()
    return () => {
      shouldReconnect.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      state.socket?.close()
    }
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  }
}