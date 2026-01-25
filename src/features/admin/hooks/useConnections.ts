"use client"

import { useState, useEffect } from "react"
import { Connection } from "../types/connection"
import { MOCK_CONNECTIONS } from "../data/mockConnections"

/**
 * Hook pour gérer la liste des connexions et leurs actions
 */
export const useConnections = () => {
	const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS)

	// Simule la progression des données
	useEffect(() => {
		const interval = setInterval(() => {
			setConnections((prev) =>
				prev.map((c) => ({ ...c, dataUsed: Math.min(c.dataUsed + Math.random() * 0.05, c.dataLimit) })),
			)
		}, 5000)
		return () => clearInterval(interval)
	}, [])

	const disconnect = (id: string) => setConnections(connections.filter((c) => c.id !== id))
	const toggleBlock = (id: string) =>
		setConnections(connections.map((c) => (c.id === id ? { ...c, isBlocked: !c.isBlocked } : c)))
	const reduceDataLimit = (id: string) =>
		setConnections(connections.map((c) => (c.id === id ? { ...c, dataLimit: Math.max(c.dataLimit * 0.5, 0.1) } : c)))
	const reduceTimeLimit = (id: string) =>
		setConnections(
			connections.map((c) => {
				if (c.id === id) {
					const timeMatch = c.timeRemaining.match(/(\d+)h/)
					const currentHours = timeMatch ? Number.parseInt(timeMatch[1]) : 0
					return { ...c, timeRemaining: `${Math.max(currentHours / 2, 1)}h` }
				}
				return c
			}),
		)

	return { connections, disconnect, toggleBlock, reduceDataLimit, reduceTimeLimit }
}
