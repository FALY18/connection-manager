import { API_ENDPOINTS } from '@/constants'
import type { 
  ApiResponse, 
  LoginCredentials, 
  VoucherActivation, 
  Connection, 
  User 
} from '@/types'

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
    this.baseUrl = baseUrl
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<{ token: string; user: User }>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.token = response.data.token
      localStorage.setItem('authToken', this.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }

    return response
  }

  async logout(): Promise<void> {
    this.token = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    await this.request(API_ENDPOINTS.LOGOUT, { method: 'POST' })
  }

  // Connections Management
  async getConnections(): Promise<ApiResponse<Connection[]>> {
    return this.request<Connection[]>(API_ENDPOINTS.CONNECTIONS)
  }

  async disconnectUser(connectionId: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.DISCONNECT(connectionId), {
      method: 'POST',
    })
  }

  async blockUser(connectionId: string, blocked: boolean): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.BLOCK(connectionId), {
      method: 'POST',
      body: JSON.stringify({ blocked }),
    })
  }

  async updateDataLimit(connectionId: string, newLimit: number): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.DATA_LIMIT(connectionId), {
      method: 'PUT',
      body: JSON.stringify({ dataLimit: newLimit }),
    })
  }

  async updateTimeLimit(connectionId: string, newTimeMinutes: number): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.TIME_LIMIT(connectionId), {
      method: 'PUT',
      body: JSON.stringify({ timeLimit: newTimeMinutes }),
    })
  }

  // Voucher Management
  async activateVoucher(activation: VoucherActivation): Promise<ApiResponse<{ session: any }>> {
    return this.request<{ session: any }>(API_ENDPOINTS.ACTIVATE_VOUCHER, {
      method: 'POST',
      body: JSON.stringify(activation),
    })
  }

  async generateVouchers(planId: string, quantity: number): Promise<ApiResponse<{ codes: string[] }>> {
    return this.request<{ codes: string[] }>(API_ENDPOINTS.GENERATE_VOUCHERS, {
      method: 'POST',
      body: JSON.stringify({ planId, quantity }),
    })
  }

  async getVouchers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(API_ENDPOINTS.VOUCHERS)
  }

  // Plans Management
  async getPlans(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(API_ENDPOINTS.PLANS)
  }

  async updatePlan(planId: string, planData: any): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.PLAN(planId), {
      method: 'PUT',
      body: JSON.stringify(planData),
    })
  }

  // Statistics
  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.STATS)
  }

  // User Session
  async getUserSession(): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.SESSION)
  }
}

export const apiService = new ApiService()