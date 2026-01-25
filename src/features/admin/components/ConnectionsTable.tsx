import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Ban } from "lucide-react"
import ConnectionActions from "./ConnectionActions"
import { Connection } from "../types/connection"
import { getStatusColor, getStatusLabel } from "../utils/statusHelpers"

interface ConnectionsTableProps {
	connections: Connection[]
	onDisconnect: (id: string) => void
	onToggleBlock: (id: string) => void
	onReduceData: (id: string) => void
	onReduceTime: (id: string) => void
}

const ConnectionsTable: React.FC<ConnectionsTableProps> = ({ connections, onDisconnect, onToggleBlock, onReduceData, onReduceTime }) => (
	<Card className="border-0 bg-card/95 backdrop-blur">
		<CardHeader>
			<CardTitle>Utilisateurs Connectés</CardTitle>
			<CardDescription>Liste détaillée avec adresses IP et contrôles</CardDescription>
		</CardHeader>
		<CardContent>
			<div className="space-y-4">
				{connections.map((conn) => (
					<div key={conn.id} className={`p-4 border rounded-lg transition-colors ${conn.isBlocked ? "border-red-500/50 bg-red-500/10" : "border-border hover:bg-secondary/50"}`}>
						<div className="flex items-start justify-between mb-3">
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-foreground">{conn.username}</p>
									{conn.isBlocked && <Badge className="bg-red-500/30 text-red-700 border-red-500"><Ban className="w-3 h-3 mr-1" />Bloqué</Badge>}
								</div>
								<p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
									<Clock className="w-4 h-4" /> Connecté depuis {conn.startTime}
								</p>
							</div>
							<Badge className={getStatusColor(conn.status)}>{getStatusLabel(conn.status)}</Badge>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-sm">
							<div><p className="text-xs text-muted-foreground mb-1">Plan</p><p className="font-medium text-foreground text-xs">{conn.plan}</p></div>
							<div><p className="text-xs text-muted-foreground mb-1">Adresse IP</p><p className="font-mono text-xs font-medium text-foreground">{conn.ipAddress}</p></div>
							<div><p className="text-xs text-muted-foreground mb-1">MAC</p><p className="font-mono text-xs font-medium text-foreground">{conn.macAddress}</p></div>
							<div><p className="text-xs text-muted-foreground mb-1">Temps Restant</p><p className="font-medium text-foreground">{conn.timeRemaining}</p></div>
							<div><p className="text-xs text-muted-foreground mb-1">Données</p><p className="font-medium text-foreground">{conn.dataUsed.toFixed(2)}/{conn.dataLimit} Go</p></div>
						</div>

						<ConnectionActions
							isBlocked={conn.isBlocked}
							onDisconnect={() => onDisconnect(conn.id)}
							onToggleBlock={() => onToggleBlock(conn.id)}
							onReduceData={() => onReduceData(conn.id)}
							onReduceTime={() => onReduceTime(conn.id)}
						/>
					</div>
				))}
			</div>
		</CardContent>
	</Card>
)

export default ConnectionsTable
