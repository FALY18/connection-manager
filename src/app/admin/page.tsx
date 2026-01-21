"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PricingPlans from "@/components/pricing-plans"
import VoucherManager from "@/components/voucher-manager"
import { Wifi, Users, Clock, Download, Smartphone, LogOut, Ban, AlertCircle, RefreshCw } from "lucide-react"

interface Connection {
  id: string
  username: string
  plan: string
  ipAddress: string
  dataUsed: number
  dataLimit: number
  timeRemaining: string
  devices: number
  status: "active" | "expiring" | "expired"
  startTime: string
  macAddress: string
  isBlocked?: boolean
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",
    username: "Ahmed Hassan",
    plan: "Plan 2h30 - 1Go",
    ipAddress: "192.168.1.45",
    macAddress: "AA:BB:CC:DD:EE:01",
    dataUsed: 0.7,
    dataLimit: 1,
    timeRemaining: "1h 45m",
    devices: 1,
    status: "active",
    startTime: "14:30",
    isBlocked: false,
  },
  {
    id: "2",
    username: "Fatima Mohamed",
    plan: "Plan 1 Journée - 10Go",
    ipAddress: "192.168.1.52",
    macAddress: "AA:BB:CC:DD:EE:02",
    dataUsed: 3.2,
    dataLimit: 10,
    timeRemaining: "18h 30m",
    devices: 2,
    status: "active",
    startTime: "09:15",
    isBlocked: false,
  },
  {
    id: "3",
    username: "Ibrahim Rakoto",
    plan: "Plan 10h - 3Go",
    ipAddress: "192.168.1.67",
    macAddress: "AA:BB:CC:DD:EE:03",
    dataUsed: 2.9,
    dataLimit: 3,
    timeRemaining: "15m",
    devices: 1,
    status: "expiring",
    startTime: "12:00",
    isBlocked: false,
  },
  {
    id: "4",
    username: "Marie Dupont",
    plan: "Plan 1 Semaine - 40Go",
    ipAddress: "192.168.1.88",
    macAddress: "AA:BB:CC:DD:EE:04",
    dataUsed: 12.5,
    dataLimit: 40,
    timeRemaining: "5d 12h",
    devices: 3,
    status: "active",
    startTime: "08:00",
    isBlocked: false,
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS)
  const [activeTab, setActiveTab] = useState("connections")
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem("adminSession")
    if (!session) {
      router.push("/login")
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          dataUsed: Math.min(conn.dataUsed + Math.random() * 0.05, conn.dataLimit),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    router.push("/login")
  }

  const handleDisconnect = (id: string) => {
    setConnections(connections.filter((c) => c.id !== id))
  }

  const handleBlock = (id: string) => {
    setConnections(connections.map((c) => (c.id === id ? { ...c, isBlocked: !c.isBlocked } : c)))
  }

  const handleReduceDataLimit = (id: string) => {
    setConnections(connections.map((c) => (c.id === id ? { ...c, dataLimit: Math.max(c.dataLimit * 0.5, 0.1) } : c)))
  }

  const handleReduceTimeLimit = (id: string) => {
    setConnections(
      connections.map((c) => {
        if (c.id === id) {
          const timeMatch = c.timeRemaining.match(/(\d+)h/)
          const currentHours = timeMatch ? Number.parseInt(timeMatch[1]) : 0
          return { ...c, timeRemaining: `${Math.max(currentHours / 2, 1)}h` }
        }
        return c
      }),
    )
  }

  if (!isAuthorized) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800" />
  }

  const activeConnections = connections.filter((c) => c.status === "active").length
  const totalDataUsed = connections.reduce((sum, c) => sum + c.dataUsed, 0)
  const totalDataLimit = connections.reduce((sum, c) => sum + c.dataLimit, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-200"
      case "expiring":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200"
      case "expired":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-200"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "expiring":
        return "Expirant"
      case "expired":
        return "Expiré"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin HotSpot</h1>
                <p className="text-sm text-white/80">Gestion complète du système</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 bg-slate-900/50 border border-slate-700/50">
            <TabsTrigger value="connections" className="text-white">
              Connexions Actives
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-white">
              Gestion Vouchers
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-white">
              Tarifs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Connexions Actives</p>
                      <p className="text-3xl font-bold text-foreground">{activeConnections}</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Wifi className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Utilisateurs Total</p>
                      <p className="text-3xl font-bold text-foreground">{connections.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Données Utilisées</p>
                      <p className="text-3xl font-bold text-foreground">
                        {totalDataUsed.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">Go</span>
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Download className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-pink-400 to-pink-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Utilisation Moyenne</p>
                      <p className="text-3xl font-bold text-foreground">
                        {((totalDataUsed / totalDataLimit) * 100).toFixed(0)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
                      </p>
                    </div>
                    <div className="p-3 bg-pink-500/20 rounded-lg">
                      <Smartphone className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connections Table */}
            <Card className="border-0 bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle>Utilisateurs Connectés</CardTitle>
                <CardDescription>Liste détaillée avec adresses IP et contrôles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        connection.isBlocked ? "border-red-500/50 bg-red-500/10" : "border-border hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{connection.username}</p>
                            {connection.isBlocked && (
                              <Badge className="bg-red-500/30 text-red-700 border-red-500">
                                <Ban className="w-3 h-3 mr-1" />
                                Bloqué
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            Connecté depuis {connection.startTime}
                          </p>
                        </div>
                        <Badge className={getStatusColor(connection.status)}>{getStatusLabel(connection.status)}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Plan</p>
                          <p className="font-medium text-foreground text-xs">{connection.plan}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Adresse IP</p>
                          <p className="font-mono text-xs font-medium text-foreground">{connection.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">MAC</p>
                          <p className="font-mono text-xs font-medium text-foreground">{connection.macAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Temps Restant</p>
                          <p className="font-medium text-foreground">{connection.timeRemaining}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Données</p>
                          <p className="font-medium text-foreground">
                            {connection.dataUsed.toFixed(2)}/{connection.dataLimit} Go
                          </p>
                        </div>
                      </div>

                      {/* Action buttons group */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(connection.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Déconnecter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlock(connection.id)}
                          className={
                            connection.isBlocked
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                          }
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {connection.isBlocked ? "Débloquer" : "Bloquer"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReduceDataLimit(connection.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="Réduire le quota de données de moitié"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Réduire Data
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReduceTimeLimit(connection.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
                          title="Réduire le temps de moitié"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Réduire Temps
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Gestion des Vouchers</h2>
              <p className="text-purple-200">Générez et gérez les codes d'activation</p>
            </div>
            <VoucherManager />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Gestion des Tarifs</h2>
              <p className="text-purple-200">Modifiez les plans et tarifs en temps réel</p>
            </div>
            <PricingPlans isClientView={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
