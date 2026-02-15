// Helper function to get auth headers
export default function getAuthHeaders() {
	const headers: Record<string, string> = { Accept: "application/json" }
	
	try {
		const session = localStorage.getItem("adminSession")
		if (session) {
			const { token } = JSON.parse(session)
			if (token) {
				headers["Authorization"] = `Bearer ${token}`
			}
		}
	} catch (err) {
		console.error("Error parsing admin session:", err)
	}
	
	return headers
}