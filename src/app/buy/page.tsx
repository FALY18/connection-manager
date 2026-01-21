"use client"

import Link from "next/link"
import { ArrowRight, Wifi } from "lucide-react"

interface Plan {
  id: string
  name: string
  duration: string
  dataLimit: number
  maxDevices: number
  price: number
  color: string
  description: string
}

const PLANS: Plan[] = [
  {
    id: "1",
    name: "2h30min",
    duration: "2h30min",
    dataLimit: 1,
    maxDevices: 1,
    price: 1000,
    color: "from-cyan-400 to-blue-500",
    description: "Accès court terme",
  },
  {
    id: "2",
    name: "10h00",
    duration: "10h00",
    dataLimit: 3,
    maxDevices: 1,
    price: 2000,
    color: "from-yellow-400 to-orange-500",
    description: "Pour une journée",
  },
  {
    id: "3",
    name: "1 Journée",
    duration: "1 Journée",
    dataLimit: 10,
    maxDevices: 1,
    price: 3000,
    color: "from-red-400 to-pink-500",
    description: "Accès 24h complet",
  },
  {
    id: "4",
    name: "1 Semaine",
    duration: "1 Semaine",
    dataLimit: 40,
    maxDevices: 3,
    price: 15000,
    color: "from-pink-400 to-purple-500",
    description: "Parfait pour la semaine",
  },
  {
    id: "5",
    name: "2 Semaines",
    duration: "2 Semaines",
    dataLimit: 100,
    maxDevices: 5,
    price: 25000,
    color: "from-lime-400 to-yellow-500",
    description: "Meilleur rapport",
  },
  {
    id: "6",
    name: "1 mois",
    duration: "1 mois",
    dataLimit: 200,
    maxDevices: 10,
    price: 45000,
    color: "from-green-400 to-emerald-500",
    description: "Accès illimité",
  },
]

export default function BuyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-400/20 p-4 rounded-full">
              <Wifi className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choisissez votre forfait</h1>
          <p className="text-purple-200">Sélectionnez le plan qui vous convient et recevez votre code</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-400/50 transition-all hover:shadow-xl hover:shadow-cyan-400/20"
            >
              {/* Color Header */}
              <div className={`bg-gradient-to-r ${plan.color} h-24 rounded-lg mb-6 flex items-center justify-center`}>
                <span className="text-slate-900 font-bold text-2xl">{plan.price.toLocaleString()}Ar</span>
              </div>

              {/* Plan Details */}
              <h3 className="text-white text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400">•</span>
                  <span className="text-sm">{plan.dataLimit}Go Data</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400">•</span>
                  <span className="text-sm">{plan.maxDevices} appareil(s) max</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400">•</span>
                  <span className="text-sm">Durée: {plan.duration}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50">
                Acheter ce plan
              </button>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
