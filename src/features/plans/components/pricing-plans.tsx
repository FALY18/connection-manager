"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Plus, Clock, HardDrive, Smartphone } from "lucide-react"
import { usePlans } from "../hooks/usePlans"
import type { Plan, CreatePlanPayload } from "../types/plan"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PricingPlans() {
	const { plans, loading, error, createPlan, updatePlan, deletePlan } = usePlans()
	const [editingId, setEditingId] = useState<string | null>(null)
	const [formData, setFormData] = useState<CreatePlanPayload>({ 
		name: "", 
		duration_minutes: 60, 
		data_limit_gb: 1, 
		max_devices: 1, 
		price: 1000 
	})
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [formMode, setFormMode] = useState<"create" | "edit">("create")

	const openCreateDialog = () => {
		setFormMode("create")
		setFormData({ name: "", duration_minutes: 60, data_limit_gb: 1, max_devices: 1, price: 1000 })
		setIsDialogOpen(true)
	}

	const openEditDialog = (plan: Plan) => {
		setFormMode("edit")
		setEditingId(plan.id)
		setFormData({ 
			name: plan.name,
			duration_minutes: plan.duration_minutes,
			data_limit_gb: plan.data_limit_gb,
			max_devices: plan.maxDevices,
			price: plan.price
		})
		setIsDialogOpen(true)
	}

	const handleSubmit = async () => {
		if (!formData.name.trim()) return

		try {
			if (formMode === "create") {
				await createPlan(formData)
			} else if (formMode === "edit" && editingId) {
				await updatePlan(editingId, formData)
			}
			setIsDialogOpen(false)
			setEditingId(null)
		} catch (error) {
			console.error("Erreur:", error)
		}
	}

	if (loading) return <p className="text-center p-8 text-muted-foreground">Chargement...</p>
	if (error) return <p className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</p>

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Plans Tarifaires</h2>
				<Button onClick={openCreateDialog} size="sm">
					<Plus className="w-4 h-4 mr-2" /> Nouveau
				</Button>
			</div>

			{/* FORMULAIRE UNIQUE */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{formMode === "create" ? "Créer un plan" : "Modifier le plan"}</DialogTitle>
					</DialogHeader>
					
					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Label>Nom</Label>
							<Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
						</div>
						
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>Durée (min)</Label>
								<Input type="number" value={formData.duration_minutes} 
									onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} />
							</div>
							<div className="space-y-2">
								<Label>Quota (Go)</Label>
								<Input type="number" step="0.1" value={formData.data_limit_gb} 
									onChange={e => setFormData({...formData, data_limit_gb: Number(e.target.value)})} />
							</div>
						</div>
						
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>Appareils</Label>
								<Input type="number" value={formData.max_devices} 
									onChange={e => setFormData({...formData, max_devices: Number(e.target.value)})} />
							</div>
							<div className="space-y-2">
								<Label>Prix (Ar)</Label>
								<Input type="number" value={formData.price} 
									onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
							</div>
						</div>
					</div>
					
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
						<Button onClick={handleSubmit} disabled={!formData.name.trim()}>
							{formMode === "create" ? "Créer" : "Modifier"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* CARTES DES PLANS */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{plans.map(plan => (
					<Card key={plan.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
						<div className={`absolute top-0 left-0 right-0 h-1 ${
							plan.price < 2000 ? 'bg-green-400' : plan.price < 5000 ? 'bg-blue-400' : 
							plan.price < 10000 ? 'bg-purple-400' : plan.price < 20000 ? 'bg-orange-400' : 'bg-red-400'
						}`} />
						
						<CardHeader className="pb-2">
							<div className="flex justify-between items-start">
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm truncate">{plan.name}</h3>
									<p className="text-lg font-bold mt-1">{plan.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-muted-foreground">Ar</span></p>
								</div>
								<div className="flex gap-1">
									<Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)} className="h-7 w-7">
										<Edit2 className="w-3.5 h-3.5" />
									</Button>
									<Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} className="h-7 w-7 text-red-500 hover:text-red-700">
										<Trash2 className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						</CardHeader>
						
						<CardContent className="pt-0 space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<Clock className="w-3.5 h-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">Durée:</span>
								<span className="font-medium">{plan.durationLabel}</span>
							</div>
							
							<div className="flex items-center gap-2 text-sm">
								<HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">Données:</span>
								<span className="font-medium">{plan.dataQuotaLabel}</span>
							</div>
							
							<div className="flex items-center gap-2 text-sm">
								<Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">Appareils:</span>
								<span className="font-medium">{plan.maxDevices}</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{plans.length === 0 && (
				<div className="text-center p-6 border-2 border-dashed rounded-lg">
					<p className="text-muted-foreground">Aucun plan tarifaire</p>
					<Button variant="link" onClick={openCreateDialog} className="mt-2">Créer le premier</Button>
				</div>
			)}
		</div>
	)
}