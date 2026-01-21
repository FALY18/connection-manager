"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [purchaseData, setPurchaseData] = useState({
    email: "",
    phone: "",
    planId: "plan1",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Simulation API call - will be replaced with real backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (loginData.username && loginData.password) {
        setMessage({ type: "success", text: "Connexion réussie! Redirection..." })
        setTimeout(() => onLoginSuccess(), 1500)
      } else {
        setMessage({ type: "error", text: "Veuillez remplir tous les champs" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion. Veuillez réessayer." })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Simulation API call - will be replaced with real backend
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (purchaseData.email && purchaseData.phone) {
        setMessage({
          type: "success",
          text: "Achat réussi! Un ticket vous a été envoyé par email.",
        })
        setTimeout(() => {
          setMessage(null)
          setPurchaseData({ email: "", phone: "", planId: "plan1" })
        }, 3000)
      } else {
        setMessage({ type: "error", text: "Veuillez remplir tous les champs" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'achat. Veuillez réessayer." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Accès Internet</CardTitle>
          <CardDescription>Se connecter ou acheter un ticket</CardDescription>
        </CardHeader>

        <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
          <TabsTrigger value="login">Se Connecter</TabsTrigger>
          <TabsTrigger value="purchase">Acheter Ticket</TabsTrigger>
        </TabsList>

        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="border-0">
              <div className="flex items-center gap-2">
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </div>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se Connecter"}
              </Button>
            </form>

            <div className="text-xs text-center text-muted-foreground pt-2">
              Vous n'avez pas de compte? Achetez un ticket ci-contre pour accéder à internet
            </div>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4">
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={purchaseData.email}
                  onChange={(e) => setPurchaseData({ ...purchaseData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+261 XX XX XX XX"
                  value={purchaseData.phone}
                  onChange={(e) => setPurchaseData({ ...purchaseData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                disabled={loading}
              >
                {loading ? "Traitement en cours..." : "Acheter et Recevoir Ticket"}
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-2">
                Un ticket de connexion avec mot de passe vous sera envoyé par email
              </div>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
