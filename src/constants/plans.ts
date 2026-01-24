import type { Plan } from '@/types'

export const PLANS: Plan[] = [
  {
    id: '1',
    name: '2h30min',
    duration: '2h30min',
    durationMinutes: 150,
    dataLimit: 1,
    maxDevices: 1,
    price: 1000,
    color: 'from-cyan-400 to-blue-500',
    description: 'Accès court terme'
  },
  {
    id: '2',
    name: '10h00',
    duration: '10h00',
    durationMinutes: 600,
    dataLimit: 3,
    maxDevices: 1,
    price: 2000,
    color: 'from-yellow-400 to-orange-500',
    description: 'Pour une journée'
  },
  {
    id: '3',
    name: '1 Journée',
    duration: '1 Journée',
    durationMinutes: 1440,
    dataLimit: 10,
    maxDevices: 1,
    price: 3000,
    color: 'from-red-400 to-pink-500',
    description: 'Accès 24h complet'
  },
  {
    id: '4',
    name: '1 Semaine',
    duration: '1 Semaine',
    durationMinutes: 10080,
    dataLimit: 40,
    maxDevices: 3,
    price: 15000,
    color: 'from-pink-400 to-purple-500',
    description: 'Parfait pour la semaine'
  },
  {
    id: '5',
    name: '2 Semaines',
    duration: '2 Semaines',
    durationMinutes: 20160,
    dataLimit: 100,
    maxDevices: 5,
    price: 25000,
    color: 'from-lime-400 to-yellow-500',
    description: 'Meilleur rapport'
  },
  {
    id: '6',
    name: '1 mois',
    duration: '1 mois',
    durationMinutes: 43200,
    dataLimit: 200,
    maxDevices: 10,
    price: 45000,
    color: 'from-green-400 to-emerald-500',
    description: 'Accès illimité'
  }
]