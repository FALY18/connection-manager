import type { LoginCredentials, PurchaseData, VoucherActivation } from '@/types'

export const validateLogin = (values: LoginCredentials): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!values.username?.trim()) {
    errors.username = 'Nom d\'utilisateur requis'
  }
  
  if (!values.password?.trim()) {
    errors.password = 'Mot de passe requis'
  } else if (values.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
  }
  
  return errors
}

export const validatePurchase = (values: PurchaseData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!values.email?.trim()) {
    errors.email = 'Email requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Format email invalide'
  }
  
  if (!values.phone?.trim()) {
    errors.phone = 'Numéro de téléphone requis'
  } else if (!/^\+?[\d\s-()]+$/.test(values.phone)) {
    errors.phone = 'Format de téléphone invalide'
  }
  
  if (!values.planId) {
    errors.planId = 'Plan requis'
  }
  
  return errors
}

export const validateVoucherActivation = (values: VoucherActivation): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!values.username?.trim()) {
    errors.username = 'Nom d\'utilisateur requis'
  }
  
  if (!values.code?.trim()) {
    errors.code = 'Code voucher requis'
  } else if (!/^[0-9][A-Z][0-9]{4}$/.test(values.code.toUpperCase())) {
    errors.code = 'Format de code invalide (ex: 1A0001)'
  }
  
  return errors
}

export const validateRequired = (value: any, fieldName: string): string | undefined => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} est requis`
  }
  return undefined
}

export const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email requis'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Format email invalide'
  }
  return undefined
}

export const validatePhone = (phone: string): string | undefined => {
  if (!phone) return 'Téléphone requis'
  if (!/^\+?[\d\s-()]+$/.test(phone)) {
    return 'Format de téléphone invalide'
  }
  if (phone.replace(/\D/g, '').length < 8) {
    return 'Numéro trop court'
  }
  return undefined
}

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | undefined => {
  if (!value) return `${fieldName} requis`
  if (value.length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractères`
  }
  return undefined
}