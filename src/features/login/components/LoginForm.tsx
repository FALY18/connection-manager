"use client"

import { useState } from "react"
import { AlertCircle, LogIn } from "lucide-react"
import { useAdminLogin } from "../hooks/useAdminLogin"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
	const { login, loading, error } = useAdminLogin()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await login(email, password)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="email" className="text-slate-200 font-medium">
					Email Admin
				</Label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="admin@hotspot.local"
					disabled={loading}
					className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400/50 transition-all"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="password" className="text-slate-200 font-medium">
					Mot de passe
				</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					disabled={loading}
					className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400/50 transition-all"
				/>
			</div>

			{error && (
				<div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex gap-3">
					<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-sm font-medium text-red-300">
							Erreur de connexion
						</p>
						<p className="text-xs text-red-200/70 mt-1">
							{error}
						</p>
					</div>
				</div>
			)}

			<Button
				type="submit"
				disabled={loading || !email.trim() || !password.trim()}
				className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<LogIn className="w-4 h-4 mr-2" />
				{loading ? "Connexion en cours..." : "Se connecter"}
			</Button>
		</form>
	)
}
