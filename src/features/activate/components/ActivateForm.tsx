"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useVoucherActivation } from "../hooks/useVoucherActivation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ActivateForm() {
	const { activate, status, message, session, isLoading } = useVoucherActivation()

	const [voucherCode, setVoucherCode] = useState("")
	const [username, setUsername] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await activate(voucherCode.trim(), username.trim())
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="username" className="text-slate-200">
					Nom d'utilisateur
				</Label>
				<Input
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					disabled={isLoading || status === "success"}
					className="bg-slate-800 border-slate-700 text-white"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="voucher" className="text-slate-200">
					Code Voucher
				</Label>
				<Input
					id="voucher"
					value={voucherCode}
					onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
					disabled={isLoading || status === "success"}
					className="bg-slate-800 border-slate-700 text-white text-center font-mono tracking-widest"
				/>
			</div>

			{status === "success" && session && (
				<div className="bg-green-900/30 border border-green-500/40 p-4 rounded-lg flex gap-3">
					<CheckCircle2 className="text-green-400" />
					<div>
						<p className="text-green-300 text-sm font-semibold">Accès autorisé</p>
						<p className="text-green-200/70 text-xs">
							Expiration : {new Date(session.expires_at).toLocaleString()}
						</p>
					</div>
				</div>
			)}

			{status === "error" && (
				<div className="bg-red-900/30 border border-red-500/40 p-4 rounded-lg flex gap-3">
					<AlertCircle className="text-red-400" />
					<p className="text-red-300 text-sm">{message}</p>
				</div>
			)}

			<Button
				type="submit"
				disabled={isLoading || !voucherCode || !username || status === "success"}
				className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50"
			>
				{isLoading ? "Activation..." : "Activer"}
			</Button>
		</form>
	)
}