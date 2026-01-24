"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface Voucher {
  id: string
  code: string
  quotaMB: number
  isUsed: boolean
  expiresAt: string
  usedAt?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getVouchers()
      
      if (response.success && response.data) {
        setVouchers(response.data)
      } else {
        setError(response.error || "Failed to fetch vouchers")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.isUsed) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Utilisé
        </Badge>
      )
    }

    const expiresAt = new Date(voucher.expiresAt)
    const now = new Date()
    
    if (expiresAt < now) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-400/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Expiré
        </Badge>
      )
    }

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 1) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Expire bientôt
        </Badge>
      )
    }

    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Actif ({daysLeft}j)
      </Badge>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-4"></div>
              <p className="text-white">Chargement des vouchers...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vouchers WiFi</h1>
          <p className="text-white/80">Gestion de vos codes d'accès Internet</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <p className="text-slate-400 text-sm mb-2">Total</p>
            <p className="text-3xl font-bold text-white">{vouchers.length}</p>
          </Card>
          <Card className="bg-green-500/10 border-green-400/30 p-6">
            <p className="text-green-400 text-sm mb-2">Utilisés</p>
            <p className="text-3xl font-bold text-green-400">
              {vouchers.filter(v => v.isUsed).length}
            </p>
          </Card>
          <Card className="bg-blue-500/10 border-blue-400/30 p-6">
            <p className="text-blue-400 text-sm mb-2">Disponibles</p>
            <p className="text-3xl font-bold text-blue-400">
              {vouchers.filter(v => !v.isUsed && new Date(v.expiresAt) > new Date()).length}
            </p>
          </Card>
          <Card className="bg-red-500/10 border-red-400/30 p-6">
            <p className="text-red-400 text-sm mb-2">Expirés</p>
            <p className="text-3xl font-bold text-red-400">
              {vouchers.filter(v => !v.isUsed && new Date(v.expiresAt) <= new Date()).length}
            </p>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-500/10 border-red-400/30 p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {/* Vouchers List */}
        <div className="space-y-4">
          {vouchers.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50 p-8 text-center">
              <p className="text-slate-400">Aucun voucher trouvé</p>
            </Card>
          ) : (
            vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className="bg-slate-900/50 border-slate-700/50 p-6 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Code & Quota */}
                  <div className="flex-1">
                    <p className="text-white font-mono font-semibold text-lg mb-2">
                      {voucher.code}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Quota: <span className="text-cyan-400 font-semibold">{voucher.quotaMB} MB</span>
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(voucher)}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex-1 text-sm">
                    <p className="text-slate-400">
                      Expire: <span className="text-white">{formatDate(voucher.expiresAt)}</span>
                    </p>
                    {voucher.usedAt && (
                      <p className="text-slate-400 mt-1">
                        Utilisé: <span className="text-green-400">{formatDate(voucher.usedAt)}</span>
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    onClick={fetchVouchers}
                    variant="ghost"
                    size="sm"
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                  >
                    Détails
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={fetchVouchers}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-8 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50"
          >
            {loading ? "Rafraîchissement..." : "Rafraîchir les données"}
          </Button>
        </div>
      </div>
    </div>
  )
}
