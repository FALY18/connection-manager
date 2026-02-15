"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Plus, Trash2, CheckCircle, Clock, Download } from "lucide-react"
import { useVouchers } from "../hooks/useVouchers"

export default function VoucherManager() {
	const { vouchers, plans, loading, generate, activate } = useVouchers()
	const [form, setForm] = useState({ planId: "", quantity: 1 })
	const [copied, setCopied] = useState<string | null>(null)

	if (loading) return <p>Chargement...</p>

	const unusedCount = vouchers.filter(v => v.status === "unused").length
	const usedCount = vouchers.filter(v => v.status === "used").length

	const copy = (code: string) => {
		navigator.clipboard.writeText(code)
		setCopied(code)
		setTimeout(() => setCopied(null), 1500)
	}

	const statusColor = (s: string) =>
		s === "unused"
			? "bg-green-500/20 text-green-700"
			: s === "used"
			? "bg-blue-500/20 text-blue-700"
			: "bg-red-500/20 text-red-700"

	return (
		<div className="space-y-6">

			{/* STATS */}
			<div className="grid md:grid-cols-3 gap-4">
				<Stat title="Total" value={vouchers.length} icon={<Copy />} />
				<Stat title="Non utilisés" value={unusedCount} icon={<Clock />} />
				<Stat title="Utilisés" value={usedCount} icon={<CheckCircle />} />
			</div>

			{/* GENERATE */}
			<Card>
				<CardHeader>
					<CardTitle>Générer des vouchers</CardTitle>
					<CardDescription>Création depuis le backend</CardDescription>
				</CardHeader>

				<CardContent className="flex gap-3 flex-wrap">
					<select
						className="px-3 py-2 border rounded"
						value={form.planId}
						onChange={(e) => setForm({ ...form, planId: e.target.value })}
					>
						<option value="">Choisir un plan</option>
						{plans.map(p => (
							<option key={p.id} value={p.id}>
								{p.name} - {p.price} Ar
							</option>
						))}
					</select>

					<input
						type="number"
						min={1}
						value={form.quantity}
						onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
						className="px-3 py-2 border rounded w-28"
					/>

					<Button onClick={() => generate(form.planId, form.quantity)}>
						<Plus className="w-4 h-4 mr-2" /> Générer
					</Button>
				</CardContent>
			</Card>

			{/* LIST */}
			<Card>
				<CardHeader>
					<CardTitle>Liste des vouchers</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
					{vouchers.map(v => (
						<div key={v.id} className="border rounded-lg p-3 space-y-2">

							<div className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<span className="font-mono font-bold">{v.code}</span>
									<button onClick={() => copy(v.code)}>
										<Copy className="w-4 h-4" />
									</button>
									{copied === v.code && <span className="text-xs text-green-600">Copié</span>}
								</div>

								<Badge className={statusColor(v.status)}>
									{v.status.toUpperCase()}
								</Badge>
							</div>

							<div className="grid grid-cols-3 text-sm text-muted-foreground">
								<div>
									<p>Plan</p>
									<p className="font-semibold text-foreground">{v.planName}</p>
								</div>
								<div>
									<p>Créé</p>
									<p className="font-semibold text-foreground">{v.createdAt}</p>
								</div>
								{v.usedAt && (
									<div>
										<p>Utilisé</p>
										<p className="font-semibold text-foreground">{v.usedAt}</p>
									</div>
								)}
							</div>

							{v.status === "unused" && (
								<Button size="sm" variant="outline" onClick={() => activate(v.code)}>
									Activer
								</Button>
							)}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	)
}

const Stat = ({ title, value, icon }: any) => (
	<Card className="p-4 flex justify-between items-center">
		<div>
			<p className="text-sm text-muted-foreground">{title}</p>
			<p className="text-3xl font-bold">{value}</p>
		</div>
		<div className="p-2 bg-secondary rounded">{icon}</div>
	</Card>
)
