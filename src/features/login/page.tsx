"use client"

import Link from "next/link"
import { Wifi } from "lucide-react"
import LoginForm from "./components/LoginForm"

export default function AdminLoginPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="bg-cyan-400/20 p-4 rounded-full">
							<Wifi className="w-8 h-8 text-cyan-400" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
					<p className="text-purple-200">Gestion du Hotspot</p>
				</div>

				{/* Login Card */}
				<div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl mb-6">
					<LoginForm />

					<div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
						<p className="text-xs text-slate-300 font-semibold mb-2">Identifiants de test:</p>
						<p className="text-xs text-slate-400">Email: admin@hotspot.local</p>
						<p className="text-xs text-slate-400">Mot de passe: admin123</p>
					</div>
				</div>

				{/* Back Link */}
				<div className="text-center">
					<Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
						Retour à l'accueil
					</Link>
				</div>
			</div>
		</div>
	)
}
