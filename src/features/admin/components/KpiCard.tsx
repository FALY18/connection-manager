import { Card, CardContent } from "@/components/ui/card"
import React from "react"

interface KpiCardProps {
	title: string
	value: string | number
	icon: React.ReactNode
	gradient: string
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, gradient }) => (
	<Card className="border-0 bg-card/95 backdrop-blur overflow-hidden">
		<div className={`h-1 ${gradient}`} />
		<CardContent className="pt-6 flex items-center justify-between">
			<div>
				<p className="text-sm text-muted-foreground mb-1">{title}</p>
				<p className="text-3xl font-bold text-foreground">{value}</p>
			</div>
			<div className="p-3 bg-white/10 rounded-lg">{icon}</div>
		</CardContent>
	</Card>
)

export default KpiCard
