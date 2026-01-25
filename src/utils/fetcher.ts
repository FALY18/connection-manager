/**
 * Generic HTTP client wrapper
 * Centralise la gestion des erreurs réseau et du parsing JSON
 */
export const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const response = await fetch(url, options)

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`)
	}

	return response.json()
}
