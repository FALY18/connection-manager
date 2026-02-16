export interface VoucherSession {
	id: string
	session_id: string
	voucher_code: string
	plan: {
		id: string
		name: string
		duration_minutes: number
	}
	ip: string
	mac: string
	started_at: string
	expires_at: string
	status: string
}

export interface ActivateVoucherResponse {
	success: boolean
	message: string
	session: VoucherSession
	session_id: string
	ttl: number
	expires_in_minutes: number
}
