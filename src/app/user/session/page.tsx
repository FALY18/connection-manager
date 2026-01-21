"use client"

import { useEffect, useState } from "react"
import { Wifi, Clock, HardDrive, Activity, LogOut, ArrowRight } from "lucide-react"
import Link from "next/link"

interface UserSession {
  username: string
  planName: string
  planDuration: string
  dataUsed: number
  dataLimit: number
  connectedTime: string
  timeRemaining: string
  ipAddress: string
  status: "active" | "inactive"
}

export default function UserSessionPage() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(150 * 60) // 150 minutes in seconds

  useEffect(() => {
    // Simulate fetching user session
    const timer = setTimeout(() => {
      setSession({
        username: "john_doe",
        planName: "2h30min",
        planDuration: "150 minutes",
        dataUsed: 45,
        dataLimit: 1000,
        connectedTime: "2 minutes 34 secondes",
        timeRemaining: "2h27m",
        ipAddress: "192.168.1.105",
        status: "active",
      })
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!session || session.status !== "active") return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          // Auto disconnect
          setSession((s) => (s ? { ...s, status: "inactive" } : null))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h${String(minutes).padStart(2, "0")}m${String(secs).padStart(2, "0")}s`
    }
    return `${minutes}m${String(secs).padStart(2, "0")}s`
  }

  const dataPercentage = session ? (session.dataUsed / session.dataLimit) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin mb-4">
            <Wifi className="w-8 h-8" />
          </div>
          <p>Chargement de votre session...</p>
        </div>
      </div>
    )
  }

  if (!session || session.status === "inactive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Wifi className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Session Expirée</h1>
          <p className="text-slate-300 mb-6">
            Votre temps de connexion est écoulé. Activez un nouveau voucher pour continuer.
          </p>
          <Link
            href="/activate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all"
          >
            Activer un voucher
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-6 h-6 text-cyan-400" />
            Ma Session
          </h1>
          <Link
            href="/activate"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
            title="Obtenir un autre voucher"
          >
            <Activity className="w-5 h-5" />
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl mb-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">Connecté</span>
          </div>

          {/* Username */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-1">Utilisateur</p>
            <p className="text-2xl font-bold text-white">{session.username}</p>
          </div>

          {/* Plan Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <div>
              <p className="text-slate-400 text-xs mb-1">Plan</p>
              <p className="text-white font-semibold text-sm">{session.planName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Durée</p>
              <p className="text-white font-semibold text-sm">{session.planDuration}</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-5 h-5 text-red-400" />
              <div className="text-center">
                <p className="text-slate-400 text-xs">Temps restant</p>
                <p className="text-red-400 font-bold text-2xl font-mono">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>

          {/* Data Usage */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <p className="text-slate-300 text-sm">Utilisation Données</p>
              </div>
              <p className="text-white font-semibold text-sm">
                {session.dataUsed} / {session.dataLimit} Go
              </p>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(dataPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-slate-400 text-xs mt-2">{Math.round(dataPercentage)}% utilisé</p>
          </div>

          {/* Connection Time */}
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Connecté depuis {session.connectedTime}</span>
          </div>

          {/* IP Address */}
          <div className="p-3 bg-slate-800/30 rounded-lg mb-6 border border-slate-700/30">
            <p className="text-slate-400 text-xs mb-1">Adresse IP</p>
            <p className="text-slate-200 font-mono text-sm">{session.ipAddress}</p>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={() => setShowDisconnect(true)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnecter
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/activate"
            className="block w-full p-4 bg-slate-800/30 border border-cyan-400/20 hover:border-cyan-400/50 rounded-lg text-white font-medium transition-all text-center"
          >
            Acheter un autre forfait
          </Link>
          <button className="block w-full p-4 bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 rounded-lg text-slate-300 font-medium transition-all">
            Contacter le Support
          </button>
        </div>

        {/* Disconnect Confirmation */}
        {showDisconnect && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-xs">
              <p className="text-white font-semibold mb-4">Déconnecter du WiFi?</p>
              <p className="text-slate-300 text-sm mb-6">
                Vous perdrez votre connexion Internet. Vous pouvez vous reconnecter à tout moment avec votre voucher.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisconnect(false)}
                  className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setSession((s) => (s ? { ...s, status: "inactive" } : null))
                    setShowDisconnect(false)
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
