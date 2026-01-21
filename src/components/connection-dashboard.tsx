"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Wifi, Users, Clock, Download, TrendingUp } from "lucide-react"

interface Connection {
  id: string
  username: string
  plan: string
  dataUsed: number
  dataLimit: number
  timeRemaining: string
  devices: number
  status: "active" | "expiring" | "expired"
  startTime: string
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",
    username: "Ahmed Hassan",
    plan: "Plan 2h30 - 1Go",
    dataUsed: 0.7,
    dataLimit: 1,
    timeRemaining: "1h 45m",
    devices: 1,
    status: "active",
    startTime: "14:30",
  },
  {
    id: "2",
    username: "Fatima Mohamed",
    plan: "Plan 1 Journée - 10Go",
    dataUsed: 3.2,
    dataLimit: 10,
    timeRemaining: "18h 30m",
    devices: 2,
    status: "active",
    startTime: "09:15",
  },
  {
    id: "3",
    username: "Ibrahim Rakoto",
    plan: "Plan 10h - 3Go",
    dataUsed: 2.9,
    dataLimit: 3,
    timeRemaining: "15m",
    devices: 1,
    status: "expiring",
    startTime: "12:00",
  },
]

const chartData = [
  { time: "08:00", connections: 5, data: 2.1 },
  { time: "10:00", connections: 12, data: 5.8 },
  { time: "12:00", connections: 18, data: 9.2 },
  { time: "14:00", connections: 15, data: 7.5 },
  { time: "16:00", connections: 22, data: 12.3 },
  { time: "18:00", connections: 19, data: 10.8 },
  { time: "20:00", connections: 14, data: 6.9 },
]

const statusData = [
  { name: "Actif", value: 2, fill: "#10b981" },
  { name: "Expirant", value: 1, fill: "#f59e0b" },
  { name: "Inactif", value: 3, fill: "#6b7280" },
]

export default function ConnectionDashboard() {
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS)

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          dataUsed: Math.min(conn.dataUsed + Math.random() * 0.1, conn.dataLimit),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
    <div className="space-y-8">
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
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Tendances d'Utilisation</CardTitle>
            <CardDescription>Connexions et données par heure</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="time" stroke="currentColor" opacity={0.5} />
                <YAxis yAxisId="left" stroke="currentColor" opacity={0.5} />
                <YAxis yAxisId="right" orientation="right" stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none" }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="connections"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Connexions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="data"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Données (Go)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Statut des Connexions</CardTitle>
            <CardDescription>Distribution actuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Connections Table */}
      <Card className="border-0 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>Connexions Actives</CardTitle>
          <CardDescription>Détails en temps réel des utilisateurs connectés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{connection.username}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      Connecté depuis {connection.startTime}
                    </p>
                  </div>
                  <Badge className={getStatusColor(connection.status)}>{getStatusLabel(connection.status)}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="font-medium text-foreground">{connection.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temps Restant</p>
                    <p className="font-medium text-foreground">{connection.timeRemaining}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Appareils</p>
                    <p className="font-medium text-foreground">{connection.devices}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Données</p>
                    <p className="font-medium text-foreground">
                      {connection.dataUsed.toFixed(2)}/{connection.dataLimit} Go
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Utilisation des données</span>
                    <span className="font-medium text-foreground">
                      {((connection.dataUsed / connection.dataLimit) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(connection.dataUsed / connection.dataLimit) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
