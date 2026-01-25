import { create } from "zustand"

import type { AdminUser } from "@/features/login/types/auth"
import {
	getAdminSession,
	saveAdminSession,
	clearAdminSession,
} from "@/features/login/storage/storage"


interface AdminAuthState {
	user: AdminUser | null
	token: string | null
	loading: boolean
	error: string | null

	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	setSession: (token: string, user: AdminUser) => void
	logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>((set) => {
	const session = typeof window !== "undefined"
		? getAdminSession()
		: null

	return {
		user: session?.user ?? null,
		token: session?.token ?? null,
		loading: false,
		error: null,

		setLoading: (loading) => set({ loading }),
		setError: (error) => set({ error }),

		setSession: (token, user) => {
			saveAdminSession({
				token,
				user,
				timestamp: Date.now(),
			})

			set({ token, user, error: null })
		},

		logout: () => {
			clearAdminSession()
			set({ token: null, user: null })
		},
	}
})
