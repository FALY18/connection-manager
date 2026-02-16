/**
 * Tente de récupérer l'adresse IP du client
 * Note: En production, cela devrait être fait côté serveur
 */
export const getClientIP = async (): Promise<string> => {
	try {
		const response = await fetch("https://api.ipify.org?format=json")
		const data = await response.json()
		return data.ip || "0.0.0.0"
	} catch {
		return "0.0.0.0"
	}
}

/**
 * Génère un identifiant unique basé sur le navigateur
 * Note: Ce n'est pas une vraie adresse MAC, mais un identifiant unique
 */
export const getDeviceFingerprint = (): string => {
	if (typeof window === "undefined") return "00:00:00:00:00:00"

	// Utiliser localStorage pour persister l'identifiant
	const stored = localStorage.getItem("device_fingerprint")
	if (stored) return stored

	// Générer un identifiant basé sur les caractéristiques du navigateur
	const fingerprint = [
		navigator.userAgent,
		navigator.language,
		screen.width,
		screen.height,
		new Date().getTimezoneOffset(),
	].join("|")

	// Convertir en format MAC-like
	const hash = Array.from(fingerprint)
		.reduce((acc, char) => acc + char.charCodeAt(0), 0)
		.toString(16)
		.padStart(12, "0")
		.slice(0, 12)

	const macLike = hash.match(/.{2}/g)?.join(":") || "00:00:00:00:00:00"

	localStorage.setItem("device_fingerprint", macLike)
	return macLike
}
