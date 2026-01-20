"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle, CheckCircle2, Wifi, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Plan {
	id: string
	name: string
	duration: string
	durationMinutes: number
	dataLimit: number
	maxDevices: number
	price: number
	color: string
}

const PLANS: Plan[] = [
	{
		id: "1",
		name: "2h30min",
		duration: "2h30min",
		durationMinutes: 150,
		dataLimit: 1,
		maxDevices: 1,
		price: 1000,
		color: "from-cyan-400 to-blue-500",
	},
	{
		id: "2",
		name: "10h00",
		duration: "10h00",
		durationMinutes: 600,
		dataLimit: 3,
		maxDevices: 1,
		price: 2000,
		color: "from-yellow-400 to-orange-500",
	},
	{
		id: "3",
		name: "1 Journée",
		duration: "1 Journée",
		durationMinutes: 1440,
		dataLimit: 10,
		maxDevices: 1,
		price: 3000,
		color: "from-red-400 to-pink-500",
	},
	{
		id: "4",
		name: "1 Semaine",
		duration: "1 Semaine",
		durationMinutes: 10080,
		dataLimit: 40,
		maxDevices: 3,
		price: 15000,
		color: "from-pink-400 to-purple-500",
	},
	{
		id: "5",
		name: "2 Semaines",
		duration: "2 Semaines",
		durationMinutes: 20160,
		dataLimit: 100,
		maxDevices: 5,
		price: 25000,
		color: "from-lime-400 to-yellow-500",
	},
	{
		id: "6",
		name: "1 mois",
		duration: "1 mois",
		durationMinutes: 43200,
		dataLimit: 200,
		maxDevices: 10,
		price: 45000,
		color: "from-green-400 to-emerald-500",
	},
]

export default function ActivatePage() {
	const [voucherCode, setVoucherCode] = useState("")
	const [username, setUsername] = useState("")
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
	const [message, setMessage] = useState("")
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

	const validVouchers: Record<string, Plan> = {
		"1A0001": PLANS[0],
		"1B0002": PLANS[0],
		"2A0001": PLANS[1],
		"3A0001": PLANS[2],
		"4A0001": PLANS[3],
		"5A0001": PLANS[4],
		"6A0001": PLANS[5],
	}

	const handleActivate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!voucherCode.trim() || !username.trim()) return

		setLoading(true)
		setStatus("idle")

		try {
			await new Promise((resolve) => setTimeout(resolve, 1200))

			const upperCode = voucherCode.toUpperCase().replace(/[^A-Z0-9]/g, "")
			const foundPlan = validVouchers[upperCode]

			if (!foundPlan) {
				setStatus("error")
				setMessage("Code de voucher invalide. Veuillez vérifier et réessayer.")
			} else {
				setStatus("success")
				setSelectedPlan(foundPlan)
				setMessage("Voucher activé avec succès! Vous êtes maintenant connecté.")
				setVoucherCode("")

				setTimeout(() => {
					window.location.href = "/user/session"
				}, 2000)
			}
		} catch (error) {
			setStatus("error")
			setMessage("Erreur de connexion. Veuillez réessayer.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 p-4 relative overflow-hidden">
			<div className="absolute inset-0 opacity-20 pointer-events-none">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 h-full">
					{PLANS.map((plan) => (
						<div key={plan.id} className={`bg-gradient-to-r ${plan.color} p-4 rounded-lg shadow-lg backdrop-blur-sm`}>
							<div className="text-white font-bold text-sm mb-2">{plan.name}</div>
							<div className="text-white text-xs space-y-1">
								<div>{plan.dataLimit}Go</div>
								<div>{plan.price.toLocaleString()}Ar</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Content Layer */}
			<div className="w-full max-w-2xl mx-auto relative z-10">
				{/* Header */}
				<div className="text-center mb-12 pt-8">
					<div className="flex justify-center mb-4">
						<div className="bg-cyan-400/20 p-4 rounded-full">
							<Wifi className="w-8 h-8 text-cyan-400" />
						</div>
					</div>
					<h1 className="text-4xl font-bold text-white mb-2">Activez votre connexion</h1>
					<p className="text-purple-200">Entrez votre code voucher pour accéder à Internet</p>
				</div>

				{/* Activation Form Card */}
				<div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
					<form onSubmit={handleActivate} className="space-y-5">
						{/* Username Input */}
						<div>
							<label className="block text-sm font-medium text-slate-200 mb-2">Nom d'utilisateur</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Entrez votre nom"
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
								disabled={loading || status === "success"}
							/>
						</div>

						{/* Voucher Code Input - Updated placeholder to show shorter format */}
						<div>
							<label className="block text-sm font-medium text-slate-200 mb-2">Code Voucher</label>
							<input
								type="text"
								value={voucherCode}
								onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
								placeholder="ex: 1A0001"
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all font-mono tracking-widest text-center text-2xl"
								disabled={loading || status === "success"}
							/>
							<p className="text-xs text-slate-400 mt-2">Format: PlanID + Lettre + Numéro (ex: 1A0001, 2B0002)</p>
						</div>

						{/* Status Messages */}
						{status === "success" && selectedPlan && (
							<div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex gap-3">
								<CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-green-300">Connexion Activée!</p>
									<p className="text-xs text-green-200/70 mt-1">
										Plan: {selectedPlan.name} - {selectedPlan.dataLimit}Go
									</p>
									<p className="text-xs text-green-200/70">Redirection en cours...</p>
								</div>
							</div>
						)}

						{status === "error" && (
							<div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex gap-3">
								<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-red-300">Activation Échouée</p>
									<p className="text-xs text-red-200/70 mt-1">{message}</p>
								</div>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading || !voucherCode.trim() || !username.trim() || status === "success"}
							className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Activation en cours..." : "Activer la connexion"}
						</button>
					</form>

					{/* Info Box */}
					<div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
						<p className="text-xs text-slate-300">
							Pas de voucher?{" "}
							<Link href="/buy" className="text-cyan-400 hover:text-cyan-300 font-semibold">
								Acheter un forfait
							</Link>
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center">
					<Link
						href="/"
						className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
					>
						<ArrowRight className="w-4 h-4 rotate-180" />
						Retour à l'accueil
					</Link>
				</div>
			</div>
		</div>
	)
}
