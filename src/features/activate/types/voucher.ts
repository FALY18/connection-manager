export interface VoucherSession {
	id: string
	session_id: string
	voucher_code: string
	plan_id: string
	expires_at: string
	duration_minutes: number
}

export interface ActivateVoucherResponse {
	message: string
	session: VoucherSession
}
