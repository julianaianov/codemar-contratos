<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FileImportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas de importação de arquivos (sem autenticação por enquanto)
Route::prefix('imports')->group(function () {
    Route::get('/', [FileImportController::class, 'index']);
    Route::post('/', [FileImportController::class, 'store']);
    Route::get('/stats', [FileImportController::class, 'stats']);
    Route::get('/{id}', [FileImportController::class, 'show']);
    Route::delete('/{id}', [FileImportController::class, 'destroy']);
    Route::get('/{id}/contratos', [FileImportController::class, 'contratos']);
});
