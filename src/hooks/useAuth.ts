import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'
import type { LoginCredentials, User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { addToast } = useToast()

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true)
    
    try {
      const response = await apiService.login(credentials)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        
        addToast({
          type: 'success',
          title: 'Connexion réussie',
          message: `Bienvenue ${response.data.user.name}`
        })
        
        return { success: true }
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de connexion',
          message: response.error || 'Identifiants incorrects'
        })
        
        return { success: false, error: response.error }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur réseau'
      
      addToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: errorMsg
      })
      
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const logout = useCallback(async () => {
    try {
      await apiService.logout()
      
      setUser(null)
      setIsAuthenticated(false)
      
      addToast({
        type: 'info',
        title: 'Déconnexion',
        message: 'Vous avez été déconnecté avec succès'
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [addToast, router])

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsAuthenticated(true)
        return true
      } catch (error) {
        console.error('Invalid user data in localStorage')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
    
    return false
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  }
}