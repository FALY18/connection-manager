export interface Connection {
	id: string
	username: string
	plan: string
	ipAddress: string
	dataUsed: number
	dataLimit: number
	timeRemaining: string
	devices: number
	status: "active" | "expiring" | "expired"
	startTime: string
	macAddress: string
	isBlocked?: boolean
}
