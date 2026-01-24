import type { ReactNode } from 'react'
import type { Connection, Plan, Voucher } from './entities'

export interface LoginFormProps {
  onLoginSuccess: () => void
}

export interface ConnectionDashboardProps {
  connections?: Connection[]
  onConnectionUpdate?: (connections: Connection[]) => void
}

export interface VoucherManagerProps {
  vouchers?: Voucher[]
  onVoucherGenerated?: (vouchers: Voucher[]) => void
}

export interface PricingPlansProps {
  isClientView?: boolean
  plans?: Plan[]
  onPlanUpdate?: (plan: Plan) => void
}

export interface ToastProviderProps {
  children: ReactNode
}

export interface ToastItemProps {
  toast: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRemove: (id: string) => void
}