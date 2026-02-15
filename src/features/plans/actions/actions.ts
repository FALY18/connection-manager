import { base_url } from "@/constants/urls"
import getAuthHeaders from "@/lib/getAuthHeader"
import type {
	ApiPlan,
	Plan,
	CreatePlanPayload,
	UpdatePlanPayload,
} from "../types/plan"

import { mapApiPlanToPlan } from "../lib/plan-mapper"

const isDev = process.env.NODE_ENV === "development"


// ---------- GET ----------
export const fetchPlansAction = async (): Promise<Plan[]> => {
	const response = await fetch(`${base_url}/admin/plans`, {
		credentials: "include",
		headers: getAuthHeaders(),
	})

	const data = (await response.json()) as ApiPlan[]

	if (isDev) {
		console.group("📦 fetchPlansAction")
		console.log("Status:", response.status)
		console.log("Data:", data)
		console.groupEnd()
	}

	if (!response.ok) throw new Error("Chargement des plans impossible")

	return data.map(mapApiPlanToPlan)
}

// ---------- CREATE ----------
export const createPlanAction = async (
	payload: CreatePlanPayload
): Promise<void> => {
	const response = await fetch(`${base_url}/admin/plans`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
		body: JSON.stringify(payload),
	})

	if (isDev) {
		console.group("➕ createPlanAction")
		console.log("Payload:", payload)
		console.log("Status:", response.status)
		console.groupEnd()
	}

	if (!response.ok) throw new Error("Création du plan échouée")
}

// ---------- UPDATE ----------
export const updatePlanAction = async (
	planId: string,
	payload: UpdatePlanPayload
): Promise<void> => {
	const response = await fetch(`${base_url}/admin/plans/${planId}`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
		body: JSON.stringify(payload),
	})

	if (isDev) {
		console.group("✏️ updatePlanAction")
		console.log("Payload:", payload)
		console.log("Status:", response.status)
		console.groupEnd()
	}

	if (!response.ok) throw new Error("Mise à jour échouée")
}

// ---------- DELETE ----------
export const deletePlanAction = async (planId: string): Promise<void> => {
	const response = await fetch(`${base_url}/admin/plans/${planId}`, {
		method: "DELETE",
		credentials: "include",
		headers: getAuthHeaders(),
	})

	if (isDev) {
		console.group("🗑 deletePlanAction")
		console.log("PlanId:", planId)
		console.log("Status:", response.status)
		console.groupEnd()
	}

	if (!response.ok) throw new Error("Suppression échouée")
}
