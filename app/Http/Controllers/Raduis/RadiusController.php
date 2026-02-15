<?php

namespace App\Http\Controllers\Raduis;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Session;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redis;

class RadiusController extends Controller
{
	public function authenticate(Request $request)
	{
		$request->validate([
			'username' => 'required|string',
			'password' => 'required|string',
			'mac' => 'required|string',
			'ip' => 'required|ip',
		]);

		// Vérifier voucher ou user
		$voucher = \App\Models\Voucher::with('plan')
			->where('code', $request->password)
			->where('status', 'unused')
			->first();

		if (!$voucher) {
			return response()->json(['accept' => false], 401);
		}

		return response()->json([
			'accept' => true,
			'session_timeout' => $voucher->plan->duration_minutes * 60,
			'idle_timeout' => 300,
		]);
	}

	public function startSession(Request $request)
	{
		$request->validate([
			'username' => 'required|string',
			'mac' => 'required|string',
			'ip' => 'required|ip',
			'voucher_code' => 'required|string'
		]);

		$voucher = \App\Models\Voucher::with('plan')->where('code', $request->voucher_code)->first();

		if (!$voucher || !$voucher->plan) {
			return response()->json(['success' => false, 'message' => 'Voucher invalide'], 404);
		}

		$sessionId = (string) Str::uuid();
		$durationSeconds = $voucher->plan->duration_minutes * 60;
		$expiresAt = now()->addSeconds($durationSeconds);

		$session = Session::create([
			'id' => $sessionId,
			'voucher_id' => $voucher->id,
			'username' => $request->username,
			'ip_address' => $request->ip,
			'mac_address' => $request->mac,
			'status' => 'active',
			'started_at' => now(),
		]);

		// Redis
		Redis::setex("session:{$sessionId}", $durationSeconds, json_encode([
			'id' => $sessionId,
			'voucher_code' => $voucher->code,
			'ip' => $request->ip,
			'mac' => $request->mac,
			'status' => 'active',
			'expires_at' => $expiresAt->toIso8601String()
		]));

		return response()->json(['success' => true, 'session_id' => $sessionId]);
	}

	public function stopSession(Request $request)
	{
		$request->validate([
			'session_id' => 'required|string'
		]);

		$session = Session::find($request->session_id);
		if ($session) {
			$session->update([
				'status' => 'expired',
				'ended_at' => now()
			]);

			Redis::del("session:{$session->id}");
		}

		return response()->json(['success' => true]);
	}

	public function interimSession(Request $request)
	{
		// Update usage stats if needed
		return response()->json(['success' => true]);
	}
}
