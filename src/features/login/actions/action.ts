import { base_url } from "@/constants/urls"
import type { AdminLoginResponse } from "../types/auth"

interface LoginPayload {
	email: string
	password: string
}

export const loginAction = async (
	payload: LoginPayload
): Promise<AdminLoginResponse> => {
	const response = await fetch(`${base_url}/admin/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		throw new Error("LOGIN_FAILED")
	}

	return response.json()
}
