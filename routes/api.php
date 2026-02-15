<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\Auth\AuthController;
use App\Http\Controllers\Admin\Auth\VoucherController;
use App\Http\Controllers\Client\SessionController;
use App\Http\Controllers\Admin\Auth\RealtimeController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Raduis\RadiusController;


/*
|--------------------------------------------------------------------------
| AUTH ADMIN
|--------------------------------------------------------------------------
*/
Route::post('/admin/login', [AuthController::class, 'login']);

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN SESSIONS
    |--------------------------------------------------------------------------
    */
    Route::get('/sessions', [SessionController::class, 'list']);
    Route::delete('/sessions/{id}', [SessionController::class, 'disconnect']);
});


/*
|--------------------------------------------------------------------------
| VOUCHERS (PUBLIC PORTAL)
|--------------------------------------------------------------------------
*/
Route::post('/vouchers/generate', [VoucherController::class, 'generate']);
Route::post('/vouchers/activate', [VoucherController::class, 'activate']);
Route::get('/vouchers', [VoucherController::class, 'index']);
Route::get('/users/{user}/vouchers', [VoucherController::class, 'userVouchers']);


/*
|--------------------------------------------------------------------------
| RADIUS API (SECURED BY API KEY)
|--------------------------------------------------------------------------
*/
Route::middleware('radius.auth')->group(function () {
    Route::get('/radius/session/{sessionId}', [SessionController::class, 'validateSession']);
});


/*
|--------------------------------------------------------------------------
| REALTIME DASHBOARD (OPTIONNELLEMENT PROTÉGÉ)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get(
    '/stream/sessions',
    [RealtimeController::class, 'stream']
);

//manage plans
Route::middleware('auth:sanctum')
    ->prefix('admin')
    ->group(function () {
        Route::get('/plans', [PlanController::class, 'index']);
        Route::post('/plans', [PlanController::class, 'store']);
        Route::get('/plans/{plan}', [PlanController::class, 'show']);
        Route::put('/plans/{plan}', [PlanController::class, 'update']);
        Route::delete('/plans/{plan}', [PlanController::class, 'destroy']);
        Route::patch('/plans/{plan}/toggle', [PlanController::class, 'toggle']);
    });


    Route::delete('/admin/sessions/{id}', [SessionController::class, 'destroy']);


Route::prefix('radius')->group(function() {
    Route::post('auth', [RadiusController::class, 'authenticate']);
    Route::post('accounting/start', [RadiusController::class, 'startSession']);
    Route::post('accounting/stop', [RadiusController::class, 'stopSession']);
    Route::post('accounting/interim', [RadiusController::class, 'interimSession']);
});
