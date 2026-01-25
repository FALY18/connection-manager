"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { base_url } from "../../../constants/urls"
import { LOGIN_ERRORS } from "../constants/messages"
import type { AdminLoginResponse } from "../types/auth"

/**
 * Hook pour gérer le login admin
 */
export const useAdminLogin = () => {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	const login = async (email: string, password: string) => {
		setLoading(true)
		setError("")

		try {
			const res: AdminLoginResponse = await fetch(`${base_url}/admin/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			}).then((r) => r.json())

			if (!res.token) {
				setError(LOGIN_ERRORS.invalidCredentials)
				setLoading(false)
				return
			}

			// Stocker le token dans localStorage
			localStorage.setItem("adminSession", JSON.stringify({ email: res.email, token: res.token, timestamp: Date.now() }))
			router.push("/admin")
		} catch (err) {
			console.error(err)
			setError(LOGIN_ERRORS.serverError)
		} finally {
			setLoading(false)
		}
	}

	return { login, loading, error }
}
