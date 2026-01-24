import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'
import type { Connection, ConnectionStats } from '@/types'

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [stats, setStats] = useState<ConnectionStats>({
    activeConnections: 0,
    totalUsers: 0,
    totalDataUsed: 0,
    averageUsage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { addToast } = useToast()

  const updateStats = useCallback((connectionList: Connection[]) => {
    const activeConnections = connectionList.filter(c => c.status === 'active').length
    const totalDataUsed = connectionList.reduce((sum, c) => sum + c.dataUsed, 0)
    const totalDataLimit = connectionList.reduce((sum, c) => sum + c.dataLimit, 0)
    
    setStats({
      activeConnections,
      totalUsers: connectionList.length,
      totalDataUsed,
      averageUsage: totalDataLimit > 0 ? (totalDataUsed / totalDataLimit) * 100 : 0
    })
  }, [])

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getConnections()
      
      if (response.success && response.data) {
        setConnections(response.data)
        updateStats(response.data)
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch connections')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [updateStats])

  const disconnectUser = useCallback(async (connectionId: string) => {
    try {
      const response = await apiService.disconnectUser(connectionId)
      
      if (response.success) {
        setConnections(prev => prev.filter(c => c.id !== connectionId))
        addToast({
          type: 'success',
          title: 'Utilisateur déconnecté',
          message: 'La connexion a été fermée avec succès'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de déconnexion',
          message: response.error || 'Impossible de déconnecter l\'utilisateur'
        })
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erreur réseau',
        message: 'Impossible de déconnecter l\'utilisateur'
      })
    }
  }, [addToast])

  const blockUser = useCallback(async (connectionId: string, blocked: boolean) => {
    try {
      const response = await apiService.blockUser(connectionId, blocked)
      
      if (response.success) {
        setConnections(prev => 
          prev.map(c => 
            c.id === connectionId 
              ? { ...c, isBlocked: blocked }
              : c
          )
        )
        
        addToast({
          type: 'success',
          title: blocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
          message: `L'accès a été ${blocked ? 'restreint' : 'rétabli'} avec succès`
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de blocage',
          message: response.error || 'Impossible de modifier le statut'
        })
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erreur réseau',
        message: 'Impossible de modifier le statut de l\'utilisateur'
      })
    }
  }, [addToast])

  const updateDataLimit = useCallback(async (connectionId: string, newLimit: number) => {
    try {
      const response = await apiService.updateDataLimit(connectionId, newLimit)
      
      if (response.success) {
        setConnections(prev => 
          prev.map(c => 
            c.id === connectionId 
              ? { ...c, dataLimit: newLimit }
              : c
          )
        )
        
        addToast({
          type: 'warning',
          title: 'Quota modifié',
          message: `Limite de données mise à jour: ${newLimit.toFixed(1)}Go`
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de modification',
          message: response.error || 'Impossible de modifier le quota'
        })
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erreur réseau',
        message: 'Impossible de modifier le quota de données'
      })
    }
  }, [addToast])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  return {
    connections,
    stats,
    loading,
    error,
    fetchConnections,
    disconnectUser,
    blockUser,
    updateDataLimit
  }
}