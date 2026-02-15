
export type VoucherStatus = "unused" | "used" | "expired"

export interface VoucherApi {
	id: string
	code: string
	plan_id: string
	status: "unused" | "used"
	used_at?: string | null
	expires_at?: string | null
	created_at: string
}

export interface VoucherUI {
	id: string
	code: string
	planId: string
	planName: string
	status: VoucherStatus
	createdAt: string
	usedAt?: string
}
