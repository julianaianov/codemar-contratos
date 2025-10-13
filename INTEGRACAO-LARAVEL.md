# Integração com Laravel/MySQL - Sistema de Contratos CODEMAR

## Visão Geral

Este documento descreve como integrar o sistema de gestão de contratos com Laravel/MySQL, substituindo os dados simulados por dados reais do banco de dados.

## Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Tabela de órgãos
CREATE TABLE orgaos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    sigla VARCHAR(50),
    situacao ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de unidades gestoras
CREATE TABLE unidades_gestoras (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    orgao_id BIGINT NOT NULL,
    situacao ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orgao_id) REFERENCES orgaos(id)
);

-- Tabela de fornecedores
CREATE TABLE fornecedores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    situacao ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de categorias de contratos
CREATE TABLE categorias_contratos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    situacao ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela principal de contratos
CREATE TABLE contratos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(50) NOT NULL UNIQUE,
    objeto TEXT NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    valor_restante DECIMAL(15,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    situacao ENUM('ativo', 'vencido', 'suspenso', 'encerrado') DEFAULT 'ativo',
    fornecedor_id BIGINT NOT NULL,
    orgao_id BIGINT NOT NULL,
    unidade_gestora_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    modalidade VARCHAR(100),
    processo_licitatorio VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    FOREIGN KEY (orgao_id) REFERENCES orgaos(id),
    FOREIGN KEY (unidade_gestora_id) REFERENCES unidades_gestoras(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias_contratos(id)
);

-- Tabela de cronograma de contratos
CREATE TABLE cronograma_contratos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contrato_id BIGINT NOT NULL,
    mes TINYINT NOT NULL,
    ano YEAR NOT NULL,
    valor_previsto DECIMAL(15,2) NOT NULL,
    valor_executado DECIMAL(15,2) DEFAULT 0,
    percentual_execucao DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN valor_previsto > 0 THEN (valor_executado / valor_previsto) * 100 
            ELSE 0 
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    UNIQUE KEY unique_contrato_mes_ano (contrato_id, mes, ano)
);
```

## Configuração do Laravel

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env` do Laravel:

```env
# Configurações do banco de dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=codemar_contratos
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

# Configurações da API
API_TOKEN=seu_token_jwt_aqui
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

### 2. Modelos Laravel

Crie os modelos correspondentes:

```php
// app/Models/Orgao.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Orgao extends Model
{
    protected $fillable = [
        'codigo', 'nome', 'sigla', 'situacao'
    ];

    public function unidadesGestoras(): HasMany
    {
        return $this->hasMany(UnidadeGestora::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}

// app/Models/UnidadeGestora.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnidadeGestora extends Model
{
    protected $fillable = [
        'codigo', 'nome', 'orgao_id', 'situacao'
    ];

    public function orgao(): BelongsTo
    {
        return $this->belongsTo(Orgao::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}

// app/Models/Fornecedor.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fornecedor extends Model
{
    protected $fillable = [
        'cnpj', 'razao_social', 'nome_fantasia', 'endereco', 
        'telefone', 'email', 'situacao'
    ];

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}

// app/Models/CategoriaContrato.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaContrato extends Model
{
    protected $fillable = [
        'nome', 'descricao', 'cor', 'situacao'
    ];

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}

// app/Models/Contrato.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contrato extends Model
{
    protected $fillable = [
        'numero', 'objeto', 'valor_total', 'valor_pago', 'data_inicio',
        'data_fim', 'data_vencimento', 'situacao', 'fornecedor_id',
        'orgao_id', 'unidade_gestora_id', 'categoria_id', 'modalidade',
        'processo_licitatorio', 'observacoes'
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'data_vencimento' => 'date',
        'valor_total' => 'decimal:2',
        'valor_pago' => 'decimal:2'
    ];

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    public function orgao(): BelongsTo
    {
        return $this->belongsTo(Orgao::class);
    }

    public function unidadeGestora(): BelongsTo
    {
        return $this->belongsTo(UnidadeGestora::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaContrato::class);
    }

    public function cronograma(): HasMany
    {
        return $this->hasMany(CronogramaContrato::class);
    }
}

// app/Models/CronogramaContrato.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CronogramaContrato extends Model
{
    protected $fillable = [
        'contrato_id', 'mes', 'ano', 'valor_previsto', 'valor_executado'
    ];

    protected $casts = [
        'valor_previsto' => 'decimal:2',
        'valor_executado' => 'decimal:2'
    ];

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }
}
```

### 3. Controllers da API

```php
// app/Http/Controllers/Api/ContratoController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Orgao;
use App\Models\UnidadeGestora;
use App\Models\Fornecedor;
use App\Models\CategoriaContrato;
use App\Models\CronogramaContrato;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContratoController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $filters = $request->all();
        
        $query = Contrato::with(['fornecedor', 'orgao', 'unidadeGestora', 'categoria']);
        
        // Aplicar filtros
        if (isset($filters['orgao_id'])) {
            $query->where('orgao_id', $filters['orgao_id']);
        }
        
        if (isset($filters['unidade_gestora_id'])) {
            $query->where('unidade_gestora_id', $filters['unidade_gestora_id']);
        }
        
        if (isset($filters['fornecedor_id'])) {
            $query->where('fornecedor_id', $filters['fornecedor_id']);
        }
        
        if (isset($filters['contrato_id'])) {
            $query->where('id', $filters['contrato_id']);
        }

        $contratos = $query->get();
        
        // Calcular métricas
        $totalContratos = $contratos->count();
        $contratosAtivos = $contratos->where('situacao', 'ativo')->count();
        $valorTotalContratado = $contratos->sum('valor_total');
        $valorTotalPago = $contratos->sum('valor_pago');
        $valorRestante = $valorTotalContratado - $valorTotalPago;
        
        // Calcular contratos vencendo
        $hoje = now();
        $trintaDias = $hoje->addDays(30);
        $sessentaDias = $hoje->addDays(60);
        $noventaDias = $hoje->addDays(90);
        $centoEOitentaDias = $hoje->addDays(180);
        
        $vencendo30Dias = $contratos->where('data_vencimento', '<=', $trintaDias)->count();
        $vencendo30_60Dias = $contratos->whereBetween('data_vencimento', [$trintaDias, $sessentaDias])->count();
        $vencendo60_90Dias = $contratos->whereBetween('data_vencimento', [$sessentaDias, $noventaDias])->count();
        $vencendo90_180Dias = $contratos->whereBetween('data_vencimento', [$noventaDias, $centoEOitentaDias])->count();
        $vencendoMais180Dias = $contratos->where('data_vencimento', '>', $centoEOitentaDias)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_contratos' => $totalContratos,
                'contratos_ativos' => $contratosAtivos,
                'contratos_vencidos' => $contratos->where('situacao', 'vencido')->count(),
                'valor_total_contratado' => $valorTotalContratado,
                'valor_total_pago' => $valorTotalPago,
                'valor_restante' => $valorRestante,
                'contratos_vencendo_30_dias' => $vencendo30Dias,
                'contratos_vencendo_30_60_dias' => $vencendo30_60Dias,
                'contratos_vencendo_60_90_dias' => $vencendo60_90Dias,
                'contratos_vencendo_90_180_dias' => $vencendo90_180Dias,
                'contratos_vencendo_mais_180_dias' => $vencendoMais180Dias,
            ],
            'message' => 'Dados do dashboard carregados com sucesso'
        ]);
    }

    public function orgaos(): JsonResponse
    {
        $orgaos = Orgao::where('situacao', 'ativo')->get();
        
        return response()->json([
            'success' => true,
            'data' => $orgaos,
            'message' => 'Órgãos carregados com sucesso'
        ]);
    }

    public function unidadesGestoras(Request $request): JsonResponse
    {
        $query = UnidadeGestora::with('orgao')->where('situacao', 'ativo');
        
        if ($request->has('orgao_id')) {
            $query->where('orgao_id', $request->orgao_id);
        }
        
        $unidades = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $unidades,
            'message' => 'Unidades gestoras carregadas com sucesso'
        ]);
    }

    public function fornecedores(): JsonResponse
    {
        $fornecedores = Fornecedor::where('situacao', 'ativo')->get();
        
        return response()->json([
            'success' => true,
            'data' => $fornecedores,
            'message' => 'Fornecedores carregados com sucesso'
        ]);
    }

    public function contratos(): JsonResponse
    {
        $contratos = Contrato::with(['fornecedor', 'orgao', 'unidadeGestora', 'categoria'])
            ->where('situacao', 'ativo')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $contratos,
            'message' => 'Contratos carregados com sucesso'
        ]);
    }

    public function cronograma(): JsonResponse
    {
        $cronograma = CronogramaContrato::with('contrato')
            ->whereBetween('ano', [2023, 2027])
            ->orderBy('ano')
            ->orderBy('mes')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $cronograma,
            'message' => 'Dados do cronograma carregados com sucesso'
        ]);
    }

    public function categorias(): JsonResponse
    {
        $categorias = CategoriaContrato::withCount('contratos')
            ->withSum('contratos', 'valor_total')
            ->where('situacao', 'ativo')
            ->get()
            ->map(function ($categoria) {
                return [
                    'categoria' => $categoria->nome,
                    'quantidade' => $categoria->contratos_count,
                    'valor_total' => $categoria->contratos_sum_valor_total,
                    'percentual' => 0, // Calcular percentual
                    'cor' => $categoria->cor
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $categorias,
            'message' => 'Dados das categorias carregados com sucesso'
        ]);
    }

    public function porAno(): JsonResponse
    {
        $contratosPorAno = Contrato::selectRaw('
                YEAR(data_inicio) as ano,
                COUNT(*) as quantidade,
                SUM(valor_total) as valor_total,
                SUM(valor_pago) as valor_pago
            ')
            ->groupBy('ano')
            ->orderBy('ano', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $contratosPorAno,
            'message' => 'Dados por ano carregados com sucesso'
        ]);
    }
}
```

### 4. Rotas da API

```php
// routes/api.php
<?php

use App\Http\Controllers\Api\ContratoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('contratos')->group(function () {
        Route::post('/dashboard', [ContratoController::class, 'dashboard']);
        Route::post('/metricas', [ContratoController::class, 'dashboard']); // Mesmo endpoint
        Route::get('/orgaos', [ContratoController::class, 'orgaos']);
        Route::get('/unidades-gestoras', [ContratoController::class, 'unidadesGestoras']);
        Route::get('/fornecedores', [ContratoController::class, 'fornecedores']);
        Route::get('/contratos', [ContratoController::class, 'contratos']);
        Route::get('/cronograma', [ContratoController::class, 'cronograma']);
        Route::get('/categorias', [ContratoController::class, 'categorias']);
        Route::get('/por-ano', [ContratoController::class, 'porAno']);
    });
});
```

## Configuração do Next.js

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env.local` do Next.js:

```env
LARAVEL_API_URL=http://localhost:8000/api
LARAVEL_API_TOKEN=seu_token_jwt_aqui
```

### 2. Atualização das Rotas da API

Substitua o conteúdo das rotas em `src/app/api/contratos/` para fazer requisições reais para o Laravel:

```typescript
// Exemplo para src/app/api/contratos/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    
    const response = await fetch(`${process.env.LARAVEL_API_URL}/contratos/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
      },
      body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao conectar com a API',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
```

## Migrações do Laravel

Execute as migrações para criar as tabelas:

```bash
php artisan make:migration create_orgaos_table
php artisan make:migration create_unidades_gestoras_table
php artisan make:migration create_fornecedores_table
php artisan make:migration create_categorias_contratos_table
php artisan make:migration create_contratos_table
php artisan make:migration create_cronograma_contratos_table
```

## Seeders para Dados de Teste

Crie seeders para popular o banco com dados de exemplo:

```bash
php artisan make:seeder OrgaoSeeder
php artisan make:seeder FornecedorSeeder
php artisan make:seeder ContratoSeeder
```

## Autenticação

Para autenticação, implemente JWT ou Sanctum no Laravel e configure o middleware de autenticação nas rotas da API.

## CORS

Configure o CORS no Laravel para permitir requisições do Next.js:

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

## Monitoramento e Logs

Configure logs para monitorar as requisições:

```php
// app/Http/Middleware/LogApiRequests.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogApiRequests
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('API Request', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $next($request);
    }
}
```

## Considerações de Performance

1. **Índices do Banco**: Adicione índices nas colunas mais consultadas
2. **Cache**: Implemente cache Redis para consultas frequentes
3. **Paginação**: Use paginação para listas grandes
4. **Eager Loading**: Use `with()` para evitar N+1 queries

## Segurança

1. **Validação**: Valide todos os inputs
2. **Sanitização**: Sanitize dados antes de salvar
3. **Rate Limiting**: Implemente rate limiting nas APIs
4. **HTTPS**: Use HTTPS em produção
5. **Autenticação**: Implemente autenticação robusta

Este sistema está pronto para ser integrado com Laravel/MySQL, mantendo a mesma interface e funcionalidades, mas com dados reais do banco de dados.




