import { useEffect, useMemo, useState } from "react"
import { voucherApi } from "../actions/voucher_actions"
import { VoucherApi, VoucherUI } from "../types/types"
import { Plan } from "@/features/plans/types/plan"

export const useVouchers = () => {
	const [plans, setPlans] = useState<Plan[]>([])
	const [rawVouchers, setRawVouchers] = useState<VoucherApi[]>([])
	const [loading, setLoading] = useState(true)

	const load = async () => {
		setLoading(true)
		const [p, v] = await Promise.all([
			voucherApi.getPlans(),
			voucherApi.getVouchers(),
		])
		setPlans(p)
		setRawVouchers(v)
		setLoading(false)
	}

	useEffect(() => { load() }, [])

	const vouchers: VoucherUI[] = useMemo(() => {
		return rawVouchers.map((v) => {
			const plan = plans.find(p => p.id === v.plan_id)
			const expired = v.expires_at && new Date(v.expires_at) < new Date()

			return {
				id: v.id,
				code: v.code,
				planId: v.plan_id,
				planName: plan?.name ?? "—",
				status: expired ? "expired" : v.status,
				createdAt: new Date(v.created_at).toLocaleString("fr-FR"),
				usedAt: v.used_at ?? undefined,
			}
		})
	}, [rawVouchers, plans])

	const generate = async (planId: string, quantity: number) => {
		await voucherApi.generate(planId, quantity)
		load()
	}

	const activate = async (code: string) => {
		await voucherApi.activate(code)
		load()
	}

	return {
		plans,
		vouchers,
		loading,
		generate,
		activate,
	}
}
