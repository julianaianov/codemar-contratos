<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dashboard com estatísticas gerais
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('is_active', true)->count(),
                    'admins' => User::where('role', 'admin')->count(),
                ],
                'imports' => [
                    'total' => FileImport::count(),
                    'successful' => FileImport::where('status', 'completed')->count(),
                    'failed' => FileImport::where('status', 'failed')->count(),
                    'processing' => FileImport::where('status', 'processing')->count(),
                ],
                'contracts' => [
                    'total' => ContratoImportado::count(),
                    'processed' => ContratoImportado::where('processado', true)->count(),
                ],
                'storage' => [
                    'pdf_files' => FileImport::where('file_type', 'pdf')->count(),
                    'total_size' => $this->calculateStorageSize(),
                ],
                'recent_activity' => $this->getRecentActivity(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar dashboard',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar usuários
     */
    public function users(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // Filtros
            if ($request->has('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            if ($request->has('active') && $request->active !== 'all') {
                $query->where('is_active', $request->active === 'true');
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('cpf', 'like', "%{$search}%");
                });
            }

            $users = $query->orderBy('created_at', 'desc')
                          ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar usuários',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Criar usuário
     */
    public function createUser(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6',
                'role' => 'required|in:admin,user',
                'cpf' => 'nullable|string|unique:users',
                'department' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'cpf' => $request->cpf,
                'department' => $request->department,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuário criado com sucesso',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar usuário',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Atualizar usuário
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'password' => 'sometimes|string|min:6',
                'role' => 'sometimes|in:admin,user',
                'cpf' => 'sometimes|string|unique:users,cpf,' . $id,
                'department' => 'sometimes|string|max:255',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updateData = $request->only(['name', 'email', 'role', 'cpf', 'department', 'is_active']);

            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Usuário atualizado com sucesso',
                'data' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar usuário',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deletar usuário
     */
    public function deleteUser(int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Não permitir deletar o próprio usuário
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível deletar seu próprio usuário',
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuário deletado com sucesso',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar usuário',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Relatórios de importação
     */
    public function importReports(Request $request): JsonResponse
    {
        try {
            $query = FileImport::with('contratos');

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('file_type') && $request->file_type !== 'all') {
                $query->where('file_type', $request->file_type);
            }

            $imports = $query->orderBy('created_at', 'desc')->paginate(20);

            // Estatísticas por tipo de arquivo
            $statsByType = FileImport::select('file_type', DB::raw('count(*) as total'))
                                   ->groupBy('file_type')
                                   ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'imports' => $imports,
                    'stats_by_type' => $statsByType,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatórios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calcular tamanho do armazenamento
     */
    private function calculateStorageSize(): string
    {
        $size = 0;
        $imports = FileImport::all();

        foreach ($imports as $import) {
            $filePath = storage_path('app/' . $import->file_path);
            if (file_exists($filePath)) {
                $size += filesize($filePath);
            }
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    /**
     * Obter atividade recente
     */
    private function getRecentActivity(): array
    {
        $recentImports = FileImport::with('contratos')
                                 ->orderBy('created_at', 'desc')
                                 ->limit(5)
                                 ->get()
                                 ->map(function ($import) {
                                     return [
                                         'type' => 'import',
                                         'description' => "Importação de {$import->file_type}: {$import->original_filename}",
                                         'status' => $import->status,
                                         'date' => $import->created_at,
                                         'records' => $import->total_records,
                                     ];
                                 });

        $recentUsers = User::orderBy('created_at', 'desc')
                          ->limit(3)
                          ->get()
                          ->map(function ($user) {
                              return [
                                  'type' => 'user',
                                  'description' => "Novo usuário: {$user->name} ({$user->role})",
                                  'date' => $user->created_at,
                              ];
                          });

        return $recentImports->concat($recentUsers)->sortByDesc('date')->take(8)->values()->toArray();
    }
}