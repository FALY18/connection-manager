export interface ApiPlan {
	id: string
	name: string
	duration_minutes: number
	data_limit_gb: string
	max_devices: number
	price: number
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CreatePlanPayload {
	name: string
	duration_minutes: number
	data_limit_gb: number
	max_devices: number
	price: number
}

export interface UpdatePlanPayload {
	name?: string
	price?: number
	max_devices?: number
	is_active?: boolean
}

export interface Plan {
	id: string
	name: string
	durationLabel: string
	dataQuotaLabel: string
	duration_minutes: number
	data_limit_gb: number
	maxDevices: number
	price: number
	isActive: boolean
}
