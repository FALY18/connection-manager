"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Plus, Trash2, CheckCircle, Clock, Download } from "lucide-react"

interface Voucher {
  id: string
  code: string
  planId: string
  planName: string
  status: "unused" | "used" | "expired"
  createdAt: string
  usedAt?: string
  usedBy?: string
}

interface VoucherManagerProps {
  vouchers?: Voucher[]
}

const PLANS = [
  { id: "1", name: "2h30min - 1Go", price: "1000Ar" },
  { id: "2", name: "10h00 - 3Go", price: "2000Ar" },
  { id: "3", name: "1 Journée - 10Go", price: "3000Ar" },
  { id: "4", name: "1 Semaine - 40Go", price: "15000Ar" },
  { id: "5", name: "2 Semaines - 100Go", price: "25000Ar" },
  { id: "6", name: "1 mois - 200Go", price: "45000Ar" },
]

const MOCK_VOUCHERS: Voucher[] = [
  {
    id: "v1",
    code: "1A0001",
    planId: "1",
    planName: "2h30min - 1Go",
    status: "unused",
    createdAt: "2024-01-08 10:30",
  },
  {
    id: "v2",
    code: "3A0001",
    planId: "3",
    planName: "1 Journée - 10Go",
    status: "used",
    createdAt: "2024-01-08 09:15",
    usedAt: "2024-01-08 11:45",
    usedBy: "Ahmed Hassan",
  },
]

export default function VoucherManager({ vouchers = MOCK_VOUCHERS }: VoucherManagerProps) {
  const [voucherList, setVoucherList] = useState<Voucher[]>(vouchers)
  const [newVouchers, setNewVouchers] = useState({ planId: "1", quantity: 10 })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const generateShortCode = (planId: string, index: number): string => {
    const letter = String.fromCharCode(65 + (index % 26)) // A-Z
    const number = String(Math.floor(index / 26) + 1).padStart(4, "0")
    return `${planId}${letter}${number}`
  }

  const handleGenerateVouchers = () => {
    const planInfo = PLANS.find((p) => p.id === newVouchers.planId)
    if (!planInfo) return

    const newCodes = Array.from({ length: newVouchers.quantity }, (_, i) => ({
      id: `v${Date.now()}_${i}`,
      code: generateShortCode(newVouchers.planId, i),
      planId: newVouchers.planId,
      planName: planInfo.name,
      status: "unused" as const,
      createdAt: new Date().toLocaleString("fr-FR"),
    }))

    setVoucherList([...newCodes, ...voucherList])
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeleteVoucher = (id: string) => {
    setVoucherList(voucherList.filter((v) => v.id !== id))
  }

  const handleDownloadPDF = () => {
    const unusedVouchers = voucherList.filter((v) => v.status === "unused")
    if (unusedVouchers.length === 0) {
      alert("Aucun voucher non utilisé à télécharger")
      return
    }

    // Create a simple PDF-like HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vouchers</title>
        <style>
          @page { margin: 0.5cm; }
          body { margin: 0; padding: 0.5cm; font-family: Arial, sans-serif; }
          .a4-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5cm;
            page-break-after: always;
          }
          .voucher-card {
            border: 2px dashed #333;
            padding: 1cm;
            text-align: center;
            background: #f0f0f0;
            border-radius: 0.5cm;
            break-inside: avoid;
          }
          .voucher-code {
            font-family: 'Courier New', monospace;
            font-size: 2em;
            font-weight: bold;
            margin: 0.5cm 0;
            letter-spacing: 2px;
            color: #0066cc;
          }
          .voucher-plan {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 0.5cm;
          }
          .voucher-price {
            font-size: 1.1em;
            font-weight: bold;
            color: #000;
          }
          @media print {
            .a4-grid { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="a4-grid">
          ${unusedVouchers
            .map(
              (v) => `
            <div class="voucher-card">
              <div class="voucher-code">${v.code}</div>
              <div class="voucher-plan">${v.planName}</div>
              <div class="voucher-price">${PLANS.find((p) => p.id === v.planId)?.price}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `vouchers-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unused":
        return "bg-green-500/20 text-green-700 border-green-200"
      case "used":
        return "bg-blue-500/20 text-blue-700 border-blue-200"
      case "expired":
        return "bg-red-500/20 text-red-700 border-red-200"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-200"
    }
  }

  const unusedCount = voucherList.filter((v) => v.status === "unused").length
  const usedCount = voucherList.filter((v) => v.status === "used").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Vouchers</p>
                <p className="text-3xl font-bold text-foreground">{voucherList.length}</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Copy className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Non Utilisés</p>
                <p className="text-3xl font-bold text-foreground">{unusedCount}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilisés</p>
                <p className="text-3xl font-bold text-foreground">{usedCount}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Vouchers */}
      <Card className="border-0 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>Générer des Vouchers</CardTitle>
          <CardDescription>Créez de nouveaux codes d'activation courts et simples</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={newVouchers.planId}
              onChange={(e) => setNewVouchers({ ...newVouchers, planId: e.target.value })}
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
            >
              {PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              max="1000"
              value={newVouchers.quantity}
              onChange={(e) =>
                setNewVouchers({ ...newVouchers, quantity: Math.max(1, Number.parseInt(e.target.value) || 1) })
              }
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground w-32"
              placeholder="Quantité"
            />

            <Button onClick={handleGenerateVouchers} className="bg-gradient-to-r from-cyan-400 to-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Générer {newVouchers.quantity}
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="bg-transparent"
              disabled={unusedCount === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF A4
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers List */}
      <Card className="border-0 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>Liste des Vouchers</CardTitle>
          <CardDescription>Codes générés - Format: PlanID + Lettre + Numéro (ex: 1A0001)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {voucherList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun voucher généré</p>
            ) : (
              voucherList.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="font-mono font-bold text-lg text-foreground">{voucher.code}</div>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                        title="Copier le code"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {copiedCode === voucher.code && <span className="text-xs text-green-600">Copié!</span>}
                    </div>
                    <Badge className={getStatusColor(voucher.status)}>{voucher.status.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-3 text-muted-foreground">
                    <div>
                      <p className="text-xs">Plan</p>
                      <p className="font-semibold text-foreground">{voucher.planName}</p>
                    </div>
                    <div>
                      <p className="text-xs">Créé</p>
                      <p className="font-semibold text-foreground">{voucher.createdAt}</p>
                    </div>
                    {voucher.usedAt && (
                      <div>
                        <p className="text-xs">Utilisé par {voucher.usedBy}</p>
                        <p className="font-semibold text-foreground">{voucher.usedAt}</p>
                      </div>
                    )}
                  </div>

                  {voucher.status === "unused" && (
                    <button
                      onClick={() => handleDeleteVoucher(voucher.id)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
