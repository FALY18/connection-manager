import type { ApiPlan, Plan } from "../types/plan"

const minutesToLabel = (minutes: number) => {
	if (minutes < 60) return `${minutes} min`
	if (minutes < 1440) return `${Math.floor(minutes / 60)} h`
	return `${Math.floor(minutes / 1440)} jour(s)`
}

export const mapApiPlanToPlan = (api: ApiPlan): Plan => ({
	id: api.id,
	name: api.name,
	durationLabel: minutesToLabel(api.duration_minutes),
	duration_minutes: api.duration_minutes,
	dataQuotaLabel: `${api.data_limit_gb} Go`,
	data_limit_gb: parseFloat(api.data_limit_gb),
	maxDevices: api.max_devices,
	price: api.price,
	isActive: api.is_active,
})
