<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{
    /**
     * GET /api/admin/plans
     */
    public function index()
    {
        return response()->json(
            Plan::orderBy('price')->get()
        );
    }

    /**
     * POST /api/admin/plans
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:100',
            'duration_minutes' => 'required|integer|min:1',
            'data_limit_gb'     => 'required|integer|min:1',
            'max_devices'       => 'required|integer|min:1|max:50',
            'price'             => 'required|integer|min:0',
            'is_active'         => 'boolean',
        ]);

        $plan = Plan::create($data);

        return response()->json($plan, 201);
    }

    /**
     * GET /api/admin/plans/{plan}
     */
    public function show(Plan $plan)
    {
        return response()->json($plan);
    }

    /**
     * PUT /api/admin/plans/{plan}
     */
    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name'             => 'sometimes|string|max:100',
            'duration_minutes' => 'sometimes|integer|min:1',
            'data_limit_gb'     => 'sometimes|integer|min:1',
            'max_devices'       => 'sometimes|integer|min:1|max:50',
            'price'             => 'sometimes|integer|min:0',
            'is_active'         => 'sometimes|boolean',
        ]);

        $plan->update($data);

        return response()->json($plan);
    }

    /**
     * DELETE /api/admin/plans/{plan}
     */
    public function destroy(Plan $plan)
    {
        // Sécurité: ne pas supprimer si des vouchers existent
        if ($plan->vouchers()->exists()) {
            return response()->json([
                'message' => 'Ce plan contient des vouchers actifs.'
            ], 409);
        }

        $plan->delete();

        return response()->json([
            'message' => 'Plan supprimé avec succès.'
        ]);
    }

    /**
     * PATCH /api/admin/plans/{plan}/toggle
     */
    public function toggle(Plan $plan)
    {
        $plan->is_active = ! $plan->is_active;
        $plan->save();

        return response()->json($plan);
    }
}
