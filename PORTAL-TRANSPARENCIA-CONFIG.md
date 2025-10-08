# Como o Portal da Transparência se Conecta com o Banco Real

## Configuração do Portal da Transparência

### 1. Conexão com Banco PostgreSQL
O portal da transparência usa uma conexão específica chamada `portal` que aponta para o banco do e-cidade:

```php
// config/database.php
'portal' => [
    'driver' => 'pgsql',
    'host' => env('DB_PORTAL_HOST', '127.0.0.1'),
    'port' => env('DB_PORTAL_PORT', '5432'),
    'database' => env('DB_PORTAL_DATABASE', 'forge'),
    'username' => env('DB_PORTAL_USERNAME', 'forge'),
    'password' => env('DB_PORTAL_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'public',
    'sslmode' => 'prefer',
    'schema' => 'transparencia',  // ← CHAVE: Schema específico
],
```

### 2. Como Usa a Conexão
```php
// app/Facades/ECidade/Revenues.php
DB::connection('portal')->table('transparencia.receitas')
DB::connection('portal')->table('transparencia.empenhos')
```

### 3. Variáveis de Ambiente Necessárias
```bash
# Para o portal da transparência funcionar
DB_PORTAL_HOST=host_do_banco_real
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=nome_do_banco
DB_PORTAL_USERNAME=usuario
DB_PORTAL_PASSWORD=senha
```

## Configuração para o Dashboard

### 1. Replicar a Mesma Estrutura
Nosso dashboard já está configurado corretamente:

```typescript
// src/app/api/ecidade/database/route.ts
const pool = new Pool({
  host: process.env.DB_PORTAL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORTAL_PORT || '5432'),
  database: process.env.DB_PORTAL_DATABASE || 'ecidade',
  user: process.env.DB_PORTAL_USERNAME || 'postgres',
  password: process.env.DB_PORTAL_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
```

### 2. Schema Correto
O portal usa o schema `transparencia`, que é exatamente o que nosso dashboard está usando:

```sql
-- Tabelas que o portal acessa:
transparencia.receitas
transparencia.empenhos
transparencia.instituicoes
transparencia.receitas_movimentacoes
```

### 3. Configuração para Produção (Vercel)

#### Opção A: Mesmo Banco do Portal
Se o portal da transparência está rodando em produção, use as mesmas credenciais:

```bash
DB_PORTAL_HOST=mesmo_host_do_portal
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=mesmo_banco_do_portal
DB_PORTAL_USERNAME=mesmo_usuario_do_portal
DB_PORTAL_PASSWORD=mesma_senha_do_portal
NODE_ENV=production
```

#### Opção B: Banco Separado com Mesma Estrutura
Se precisar de um banco separado, replique a estrutura:

```sql
-- Criar schema transparencia
CREATE SCHEMA IF NOT EXISTS transparencia;

-- Copiar estrutura das tabelas
-- (usar dump do banco original)
```

### 4. Verificar Conectividade

#### Teste de Conexão
```bash
# Testar conexão com o banco
psql -h DB_PORTAL_HOST -p 5432 -U DB_PORTAL_USERNAME -d DB_PORTAL_DATABASE

# Verificar se o schema existe
\dn

# Verificar se as tabelas existem
\dt transparencia.*
```

#### Verificar Dados
```sql
-- Verificar se há dados
SELECT COUNT(*) FROM transparencia.receitas;
SELECT COUNT(*) FROM transparencia.empenhos;
SELECT COUNT(*) FROM transparencia.instituicoes;
```

### 5. Diferenças entre Localhost e Produção

#### Localhost (Desenvolvimento)
- Banco local (Docker)
- Dados de teste
- SSL desabilitado

#### Produção (Vercel)
- Banco remoto
- Dados reais
- SSL obrigatório
- Firewall configurado

### 6. Solução Imediata

Para fazer o dashboard funcionar no Vercel:

1. **Obter credenciais do banco real** (mesmo do portal da transparência)
2. **Configurar variáveis de ambiente no Vercel**
3. **Testar conexão**
4. **Verificar se há dados para 2025**

### 7. Comando para Verificar Dados
```sql
-- Verificar exercícios disponíveis
SELECT DISTINCT exercicio FROM transparencia.receitas ORDER BY exercicio DESC;
SELECT DISTINCT exercicio FROM transparencia.empenhos ORDER BY exercicio DESC;
```

## Conclusão

O portal da transparência funciona porque:
1. ✅ Tem acesso ao banco real do e-cidade
2. ✅ Usa o schema `transparencia`
3. ✅ Tem credenciais corretas configuradas
4. ✅ Acessa dados reais de produção

Nosso dashboard precisa das **mesmas credenciais** para funcionar!



