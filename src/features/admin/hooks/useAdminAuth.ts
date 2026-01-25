"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Hook pour vérifier la session admin et rediriger vers login si non connecté
 */
export const useAdminAuth = () => {
	const router = useRouter()
	const [isAuthorized, setIsAuthorized] = useState(false)

	useEffect(() => {
		const session = localStorage.getItem("adminSession")
		if (!session) router.push("/login")
		else setIsAuthorized(true)
	}, [router])

	return isAuthorized
}
