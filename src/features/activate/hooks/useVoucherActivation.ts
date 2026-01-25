"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { activateVoucher } from "../actions/voucher.actions"
import { VOUCHER_MESSAGES } from "../constants/messages"
import type { VoucherSession } from "../types/voucher"

type Status = "idle" | "loading" | "success" | "error"

export const useVoucherActivation = () => {
	const router = useRouter()

	const [status, setStatus] = useState<Status>("idle")
	const [message, setMessage] = useState("")
	const [session, setSession] = useState<VoucherSession | null>(null)

	/**
	 * Orchestration métier côté client
	 */
	const activate = async (code: string, username: string) => {
		if (!code || !username) return

		setStatus("loading")
		setMessage("")

		try {
			const response = await activateVoucher(code)

			setSession(response.session)
			setStatus("success")
			setMessage(VOUCHER_MESSAGES.success)

			/**
			 * Persist session localement (ex: captive portal)
			 */
			localStorage.setItem(
				"userSession",
				JSON.stringify({
					username,
					...response.session,
				}),
			)

			/**
			 * Navigation Next.js
			 */
			setTimeout(() => {
				router.push("/user/session")
			}, 1200)
		} catch (error) {
			console.error(error)
			setStatus("error")
			setMessage(VOUCHER_MESSAGES.serverError)
		}
	}

	return {
		activate,
		status,
		message,
		session,
		isLoading: status === "loading",
	}
}
