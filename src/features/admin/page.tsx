"use client"

import { useState } from "react"
import { useAdminAuth } from "./hooks/useAdminAuth"
import { useConnections } from "@/hooks/useConnections"
import KpiCard from "./components/KpiCard"
import ConnectionsTable from "./components/ConnectionsTable"
import { Wifi, Users, Download, Smartphone, LogOut } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import PricingPlans from "@/features/plans/components/pricing-plans"
import VoucherManager from "@/components/voucher-manager"

export default function AdminDashboard() {
	const isAuthorized = useAdminAuth()
	const { connections, disconnect, toggleBlock, reduceDataLimit, reduceTimeLimit } = useConnections()
	const [activeTab, setActiveTab] = useState("connections")

	if (!isAuthorized) return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800" />

	const activeConnections = connections.filter((c) => c.status === "active").length
	const totalDataUsed = connections.reduce((sum, c) => sum + c.dataUsed, 0)
	const totalDataLimit = connections.reduce((sum, c) => sum + c.dataLimit, 0)

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800">
			<header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
							<Wifi className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-white">Admin HotSpot</h1>
							<p className="text-sm text-white/80">Gestion complète du système</p>
						</div>
					</div>
					<Button onClick={() => { localStorage.removeItem("adminSession"); location.href = "/login" }} variant="outline" className="text-white border-white/20 hover:bg-white/10 bg-transparent">
						<LogOut className="w-4 h-4 mr-2" /> Déconnexion
					</Button>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 bg-slate-900/50 border border-slate-700/50">
						<TabsTrigger value="connections" className="text-white">Connexions Actives</TabsTrigger>
						<TabsTrigger value="vouchers" className="text-white">Gestion Vouchers</TabsTrigger>
						<TabsTrigger value="pricing" className="text-white">Tarifs</TabsTrigger>
					</TabsList>

					<TabsContent value="connections" className="space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<KpiCard title="Connexions Actives" value={activeConnections} icon={<Wifi className="w-6 h-6 text-green-600" />} gradient="bg-gradient-to-r from-green-400 to-emerald-500" />
							<KpiCard title="Utilisateurs Total" value={connections.length} icon={<Users className="w-6 h-6 text-blue-600" />} gradient="bg-gradient-to-r from-blue-400 to-blue-500" />
							<KpiCard title="Données Utilisées" value={`${totalDataUsed.toFixed(1)} Go`} icon={<Download className="w-6 h-6 text-purple-600" />} gradient="bg-gradient-to-r from-purple-400 to-purple-500" />
							<KpiCard title="Utilisation Moyenne" value={`${((totalDataUsed / totalDataLimit) * 100).toFixed(0)} %`} icon={<Smartphone className="w-6 h-6 text-pink-600" />} gradient="bg-gradient-to-r from-pink-400 to-pink-500" />
						</div>

						<ConnectionsTable
							connections={connections}
							onDisconnect={disconnect}
							onToggleBlock={toggleBlock}
							onReduceData={reduceDataLimit}
							onReduceTime={reduceTimeLimit}
						/>
					</TabsContent>

					<TabsContent value="vouchers" className="space-y-8">
						<VoucherManager />
					</TabsContent>

					<TabsContent value="pricing" className="space-y-8">
						<PricingPlans isClientView={false} />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	)
}
