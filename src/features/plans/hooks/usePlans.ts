"use client"

import { useEffect, useState } from "react"
import type { Plan, CreatePlanPayload, UpdatePlanPayload } from "../types/plan"
import {
	fetchPlansAction,
	createPlanAction,
	updatePlanAction,
	deletePlanAction,
} from "../actions/actions"

export const usePlans = () => {
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const loadPlans = async () => {
		try {
			setLoading(true)
			setPlans(await fetchPlansAction())
		} catch (err) {
			setError((err as Error).message)
		} finally {
			setLoading(false)
		}
	}

	const createPlan = async (payload: CreatePlanPayload) => {
		await createPlanAction(payload)
		await loadPlans()
	}

	const updatePlan = async (id: string, payload: UpdatePlanPayload) => {
		await updatePlanAction(id, payload)
		await loadPlans()
	}

	const deletePlan = async (id: string) => {
		await deletePlanAction(id)
		await loadPlans()
	}

	useEffect(() => {
		loadPlans()
	}, [])

	return {
		plans,
		loading,
		error,
		createPlan,
		updatePlan,
		deletePlan,
		refresh: loadPlans,
	}
}
