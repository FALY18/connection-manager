"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, Edit2, Check } from "lucide-react"

interface PricingPlan {
  id: string
  price: number
  duration: string
  dataQuota: string
  maxDevices: number
  color: string
}

const initialPlans: PricingPlan[] = [
  {
    id: "plan1",
    price: 1000,
    duration: "2h 30min",
    dataQuota: "1 Go",
    maxDevices: 1,
    color: "from-cyan-400 to-cyan-300",
  },
  {
    id: "plan2",
    price: 2000,
    duration: "10h 00",
    dataQuota: "3 Go",
    maxDevices: 1,
    color: "from-yellow-400 to-yellow-300",
  },
  {
    id: "plan3",
    price: 3000,
    duration: "1 Journée",
    dataQuota: "10 Go",
    maxDevices: 1,
    color: "from-red-400 to-red-300",
  },
  {
    id: "plan4",
    price: 15000,
    duration: "1 Semaine",
    dataQuota: "40 Go",
    maxDevices: 3,
    color: "from-pink-400 to-pink-300",
  },
  {
    id: "plan5",
    price: 25000,
    duration: "2 Semaines",
    dataQuota: "100 Go",
    maxDevices: 5,
    color: "from-lime-400 to-lime-300",
  },
  {
    id: "plan6",
    price: 45000,
    duration: "1 Mois",
    dataQuota: "200 Go",
    maxDevices: 10,
    color: "from-green-400 to-green-300",
  },
]

interface PricingPlansProps {
  isClientView?: boolean
}

export default function PricingPlans({ isClientView = false }: PricingPlansProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PricingPlan>>({})

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id)
    setEditValues({ ...plan })
  }

  const handleSave = () => {
    if (editingId && editValues.id) {
      setPlans(plans.map((p) => (p.id === editingId ? (editValues as PricingPlan) : p)))
      setEditingId(null)
      setEditValues({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`group overflow-hidden border-0 transition-all duration-300 ${
              isClientView
                ? "bg-white/90 hover:shadow-xl hover:scale-105 cursor-pointer"
                : "bg-card/95 backdrop-blur hover:shadow-lg"
            }`}
          >
            <div className={`h-2 bg-gradient-to-r ${plan.color}`} />

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === plan.id ? (
                    <Input
                      value={editValues.duration || ""}
                      onChange={(e) => setEditValues({ ...editValues, duration: e.target.value })}
                      className="mb-2 text-sm"
                      placeholder="Duration"
                    />
                  ) : (
                    <CardDescription className="text-base font-semibold text-foreground mb-1">
                      {plan.duration}
                    </CardDescription>
                  )}
                  <CardTitle className="text-3xl font-bold">
                    {editingId === plan.id ? (
                      <Input
                        type="number"
                        value={editValues.price || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            price: Number.parseInt(e.target.value),
                          })
                        }
                        className="text-2xl"
                        placeholder="Price"
                      />
                    ) : (
                      <>
                        {plan.price.toLocaleString("fr-FR")}
                        <span className="text-sm font-normal text-muted-foreground ml-1">Ar</span>
                      </>
                    )}
                  </CardTitle>
                </div>
                {!isClientView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (editingId === plan.id) {
                        handleSave()
                      } else {
                        handleEdit(plan)
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {editingId === plan.id ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quota de données</p>
                    {editingId === plan.id ? (
                      <Input
                        value={editValues.dataQuota || ""}
                        onChange={(e) => setEditValues({ ...editValues, dataQuota: e.target.value })}
                        className="text-sm"
                        placeholder="Data quota"
                      />
                    ) : (
                      <p className="font-semibold text-foreground">{plan.dataQuota}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Appareils max</p>
                    {editingId === plan.id ? (
                      <Input
                        type="number"
                        value={editValues.maxDevices || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            maxDevices: Number.parseInt(e.target.value),
                          })
                        }
                        className="text-sm"
                        placeholder="Max devices"
                      />
                    ) : (
                      <p className="font-semibold text-foreground">
                        {plan.maxDevices} {plan.maxDevices === 1 ? "appareil" : "appareils"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {editingId === plan.id ? (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="flex-1" onClick={handleSave}>
                    Enregistrer
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  className={`w-full mt-4 ${
                    isClientView
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-gradient-to-r from-primary to-primary/80"
                  }`}
                >
                  {isClientView ? "Sélectionner ce plan" : "Modifier"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isClientView && (
        <Card className="border-0 bg-card/95 backdrop-blur mt-6">
          <CardHeader>
            <CardTitle>Résumé des Plans</CardTitle>
            <CardDescription>Tarifs actuels en Ariary (Ar)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold">Durée</th>
                    <th className="text-right py-2 px-3 font-semibold">Tarif</th>
                    <th className="text-right py-2 px-3 font-semibold">Données</th>
                    <th className="text-right py-2 px-3 font-semibold">Max Appareils</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-border last:border-0">
                      <td className="py-2 px-3">{plan.duration}</td>
                      <td className="text-right py-2 px-3 font-semibold">{plan.price.toLocaleString("fr-FR")} Ar</td>
                      <td className="text-right py-2 px-3">{plan.dataQuota}</td>
                      <td className="text-right py-2 px-3">
                        <Badge variant="outline">{plan.maxDevices}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
