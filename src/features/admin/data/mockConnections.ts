import { Connection } from "../types/connection"

export const MOCK_CONNECTIONS: Connection[] = [
	{ id: "1", username: "Ahmed Hassan", plan: "Plan 2h30 - 1Go", ipAddress: "192.168.1.45", macAddress: "AA:BB:CC:DD:EE:01", dataUsed: 0.7, dataLimit: 1, timeRemaining: "1h 45m", devices: 1, status: "active", startTime: "14:30", isBlocked: false },
	{ id: "2", username: "Fatima Mohamed", plan: "Plan 1 Journée - 10Go", ipAddress: "192.168.1.52", macAddress: "AA:BB:CC:DD:EE:02", dataUsed: 3.2, dataLimit: 10, timeRemaining: "18h 30m", devices: 2, status: "active", startTime: "09:15", isBlocked: false },
	{ id: "3", username: "Ibrahim Rakoto", plan: "Plan 10h - 3Go", ipAddress: "192.168.1.67", macAddress: "AA:BB:CC:DD:EE:03", dataUsed: 2.9, dataLimit: 3, timeRemaining: "15m", devices: 1, status: "expiring", startTime: "12:00", isBlocked: false },
	{ id: "4", username: "Marie Dupont", plan: "Plan 1 Semaine - 40Go", ipAddress: "192.168.1.88", macAddress: "AA:BB:CC:DD:EE:04", dataUsed: 12.5, dataLimit: 40, timeRemaining: "5d 12h", devices: 3, status: "active", startTime: "08:00", isBlocked: false },
]
