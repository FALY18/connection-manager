import { Button } from "@/components/ui/button"
import { LogOut, Ban, AlertCircle, RefreshCw } from "lucide-react"
import React from "react"

interface ConnectionActionsProps {
	isBlocked?: boolean
	onDisconnect: () => void
	onToggleBlock: () => void
	onReduceData: () => void
	onReduceTime: () => void
}

const ConnectionActions: React.FC<ConnectionActionsProps> = ({
	isBlocked,
	onDisconnect,
	onToggleBlock,
	onReduceData,
	onReduceTime,
}) => (
	<div className="flex flex-wrap gap-2">
		<Button size="sm" variant="outline" onClick={onDisconnect} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
			<LogOut className="w-4 h-4 mr-2" /> Déconnecter
		</Button>
		<Button size="sm" variant="outline" onClick={onToggleBlock} className={isBlocked ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"}>
			<Ban className="w-4 h-4 mr-2" /> {isBlocked ? "Débloquer" : "Bloquer"}
		</Button>
		<Button size="sm" variant="outline" onClick={onReduceData} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950" title="Réduire le quota de données de moitié">
			<AlertCircle className="w-4 h-4 mr-2" /> Réduire Data
		</Button>
		<Button size="sm" variant="outline" onClick={onReduceTime} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950" title="Réduire le temps de moitié">
			<RefreshCw className="w-4 h-4 mr-2" /> Réduire Temps
		</Button>
	</div>
)

export default ConnectionActions
