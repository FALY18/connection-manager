export interface AdminUser {
	id: number
	name: string
	email: string
	email_verified_at: string | null
	created_at: string
	updated_at: string
}

export interface AdminLoginResponse {
	token: string
	user: AdminUser
}
