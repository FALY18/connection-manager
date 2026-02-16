import { VoucherApi } from "../types/types"
import { Plan } from "@/features/plans/types/plan"
import { base_url } from "@/constants/urls"
import getAuthHeaders from "@/lib/getAuthHeader"

/* ---------------------------- */
/* Utils */
/* ---------------------------- */

const json = async <T>(response: Response): Promise<T> => {
	const data = await response.json().catch(() => null)

	if (!response.ok) {
		console.error("API ERROR:", {
			url: response.url,
			status: response.status,
			data,
		})
		throw new Error(data?.message ?? "Erreur API")
	}

	return data as T
}

const apiFetch = (url: string, options: RequestInit = {}) => {
	return fetch(url, {
		...options,
		credentials: "include",
		headers: {
			...getAuthHeaders(),
			...(options.headers ?? {}),
		},
	})
}

/* ---------------------------- */
/* API */
/* ---------------------------- */

export const voucherApi = {
	/* -------- Plans -------- */

	getPlans: (): Promise<Plan[]> =>
		apiFetch(`${base_url}/admin/plans`, {
			method: "GET",
		}).then((r) => json<Plan[]>(r)),

	/* -------- Vouchers -------- */

	getVouchers: (): Promise<VoucherApi[]> =>
		apiFetch(`${base_url}/vouchers`, {
			method: "GET",
		}).then((r) => json<VoucherApi[]>(r)),

	generate: (plan_id: string, quantity: number) =>
		apiFetch(`${base_url}/vouchers/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ plan_id, quantity }),
		}).then((r) => json<{ success: boolean; data: VoucherApi[] }>(r)),

	activate: (code: string) =>
		apiFetch(`${base_url}/vouchers/activate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		}).then(
			(r) =>
				json<{
					message: string
					session: {
						id: string
						session_id: string
						voucher_code: string
						plan_id: string
						expires_at: string
						duration_minutes: number
					}
				}>(r),
		),
}
