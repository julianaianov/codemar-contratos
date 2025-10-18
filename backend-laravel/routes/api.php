<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FileImportController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\Api\TermoContratualController;
use App\Http\Controllers\Api\InstrumentoContratualController;
use App\Http\Controllers\Api\ConformidadeController;

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
    Route::get('/todos-contratos', [FileImportController::class, 'todosContratos']);
    Route::get('/{id}', [FileImportController::class, 'show']);
    Route::delete('/{id}', [FileImportController::class, 'destroy']);
    Route::get('/{id}/contratos', [FileImportController::class, 'contratos']);
    Route::get('/{id}/pdf/download', [FileImportController::class, 'downloadPdf']);
    Route::get('/{id}/pdf/view', [FileImportController::class, 'viewPdf']);
});

// Rotas de contratos
Route::prefix('contratos')->group(function () {
    Route::get('/', [ContratoController::class, 'index']);
    Route::post('/', [ContratoController::class, 'store']);
    Route::get('/stats', [ContratoController::class, 'stats']);
    Route::get('/diretorias', [ContratoController::class, 'diretorias']);
    Route::get('/{id}', [ContratoController::class, 'show']);
    Route::put('/{id}', [ContratoController::class, 'update']);
    Route::delete('/{id}', [ContratoController::class, 'destroy']);
});

// Rotas de termos contratuais
Route::prefix('termos')->group(function () {
    Route::get('/', [TermoContratualController::class, 'index']);
    Route::post('/', [TermoContratualController::class, 'store']);
    Route::get('/{termoContratual}', [TermoContratualController::class, 'show']);
    Route::put('/{termoContratual}', [TermoContratualController::class, 'update']);
    Route::delete('/{termoContratual}', [TermoContratualController::class, 'destroy']);
    Route::patch('/{termoContratual}/status', [TermoContratualController::class, 'updateStatus']);
    Route::get('/tipo/{tipo}', [TermoContratualController::class, 'porTipo']);
    Route::get('/aprovados/listar', [TermoContratualController::class, 'aprovados']);
});

// Rotas de instrumentos contratuais
Route::prefix('instrumentos')->group(function () {
    Route::get('/', [InstrumentoContratualController::class, 'index']);
    Route::post('/', [InstrumentoContratualController::class, 'store']);
    Route::get('/{instrumentoContratual}', [InstrumentoContratualController::class, 'show']);
    Route::put('/{instrumentoContratual}', [InstrumentoContratualController::class, 'update']);
    Route::delete('/{instrumentoContratual}', [InstrumentoContratualController::class, 'destroy']);
    Route::patch('/{instrumentoContratual}/status', [InstrumentoContratualController::class, 'updateStatus']);
    Route::get('/tipo/{tipo}', [InstrumentoContratualController::class, 'porTipo']);
    Route::get('/ativos/listar', [InstrumentoContratualController::class, 'ativos']);
    Route::get('/vigentes/listar', [InstrumentoContratualController::class, 'vigentes']);
    Route::get('/vencidos/listar', [InstrumentoContratualController::class, 'vencidos']);
    Route::get('/proximos-vencimento/listar', [InstrumentoContratualController::class, 'proximosVencimento']);
});

// Rotas de conformidade
Route::prefix('conformidade')->group(function () {
    Route::get('/estatisticas', [ConformidadeController::class, 'estatisticas']);
    Route::get('/contrato/{contratoId}', [ConformidadeController::class, 'contrato']);
    Route::get('/status/{status}', [ConformidadeController::class, 'porStatus']);
    Route::get('/classificacao/{categoria}', [ConformidadeController::class, 'porClassificacao']);
    Route::post('/verificar-aditivo', [ConformidadeController::class, 'verificarAditivo']);
    Route::get('/powerbi', [ConformidadeController::class, 'powerBI']);
});

// Rotas de administração (requer autenticação e permissão de admin)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/reports/imports', [AdminController::class, 'importReports']);
});
