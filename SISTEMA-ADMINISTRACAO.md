# Sistema de Administração - CODEMAR Contratos

## Visão Geral

O sistema de administração foi implementado para permitir o gerenciamento completo do sistema de contratos, incluindo usuários, importações e configurações gerais.

## Funcionalidades Implementadas

### 1. Backend (Laravel)

#### Modelo User Atualizado
- **Novos campos adicionados:**
  - `role`: ENUM('admin', 'user') - Define o tipo de usuário
  - `is_active`: BOOLEAN - Status ativo/inativo do usuário
  - `cpf`: STRING - CPF do usuário (único)
  - `department`: STRING - Departamento do usuário
  - `last_login_at`: TIMESTAMP - Último acesso

#### Middleware de Administração
- **AdminMiddleware**: Verifica se o usuário autenticado tem permissão de administrador
- **Aplicação**: Protege rotas administrativas com middleware `auth:sanctum` e `admin`

#### Controller de Administração
- **AdminController**: Gerencia todas as operações administrativas
  - `dashboard()`: Estatísticas gerais do sistema
  - `users()`: Listagem de usuários com filtros
  - `createUser()`: Criação de novos usuários
  - `updateUser()`: Atualização de usuários existentes
  - `deleteUser()`: Exclusão de usuários
  - `importReports()`: Relatórios de importação

#### Rotas de Administração
```php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/reports/imports', [AdminController::class, 'importReports']);
});
```

### 2. Frontend (Next.js)

#### Páginas Administrativas

##### Dashboard Principal (`/admin`)
- **Estatísticas em tempo real:**
  - Total de usuários (ativos, administradores)
  - Importações (total, sucesso, falhas, processando)
  - Contratos (total, processados)
  - Armazenamento (tamanho, arquivos PDF)

- **Acesso rápido a:**
  - Gerenciamento de usuários
  - Relatórios detalhados
  - Configurações do sistema

##### Gerenciamento de Usuários (`/admin/usuarios`)
- **Funcionalidades:**
  - Listagem com filtros (tipo, status, busca)
  - Criação de novos usuários
  - Edição de usuários existentes
  - Exclusão de usuários
  - Visualização de estatísticas

- **Filtros disponíveis:**
  - Busca por nome, email ou CPF
  - Filtro por tipo (admin/user)
  - Filtro por status (ativo/inativo)

##### Relatórios (`/admin/relatorios`)
- **Relatórios de importação:**
  - Listagem detalhada de todas as importações
  - Filtros por data e tipo de arquivo
  - Taxa de sucesso por importação
  - Estatísticas por tipo de arquivo

- **Funcionalidades:**
  - Exportação para CSV
  - Visualização de progresso
  - Análise de performance

##### Configurações (`/admin/configuracoes`)
- **Status do sistema:**
  - Banco de dados
  - Armazenamento
  - Serviço OCR
  - Processamento PDF

- **Configurações:**
  - Tamanho máximo de arquivo
  - Tipos de arquivo permitidos
  - Habilitar/desabilitar OCR
  - Processamento automático
  - Backup automático

## Usuários Padrão

### Administrador
- **Email:** admin@codemar.com.br
- **Senha:** admin123
- **Permissões:** Acesso total ao sistema

### Usuário Teste
- **Email:** usuario@codemar.com.br
- **Senha:** usuario123
- **Permissões:** Acesso limitado (sem área administrativa)

## Segurança

### Autenticação
- Todas as rotas administrativas requerem autenticação via Sanctum
- Verificação adicional de permissão de administrador
- Middleware personalizado para controle de acesso

### Validação
- Validação rigorosa de dados de entrada
- Sanitização de inputs
- Proteção contra ataques de injeção

## Navegação

### Sidebar
- Link "Administração" adicionado à navegação principal
- Ícone de escudo para identificação visual
- Acesso restrito a usuários com permissão

### Breadcrumbs
- Navegação hierárquica em todas as páginas administrativas
- Links de retorno ao dashboard principal

## Monitoramento

### Dashboard
- Métricas em tempo real
- Indicadores visuais de status
- Alertas de problemas no sistema

### Logs
- Registro de atividades administrativas
- Monitoramento de acessos
- Auditoria de alterações

## Próximos Passos

### Funcionalidades Futuras
1. **Sistema de Notificações**
   - Alertas de sistema
   - Notificações de importação
   - Avisos de manutenção

2. **Backup e Restore**
   - Backup automático de dados
   - Restauração de dados
   - Versionamento de configurações

3. **Auditoria Avançada**
   - Log detalhado de ações
   - Relatórios de auditoria
   - Rastreamento de mudanças

4. **Integração com Sistemas Externos**
   - APIs de terceiros
   - Sincronização de dados
   - Webhooks

## Documentação Técnica

### Arquivos Principais
- `backend-laravel/app/Http/Controllers/Api/AdminController.php`
- `backend-laravel/app/Http/Middleware/AdminMiddleware.php`
- `backend-laravel/app/Models/User.php`
- `src/app/admin/page.tsx`
- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/relatorios/page.tsx`
- `src/app/admin/configuracoes/page.tsx`

### Migrações
- `2025_10_09_164302_add_admin_fields_to_users_table.php`

### Seeders
- `AdminUserSeeder.php`

## Suporte

Para suporte técnico ou dúvidas sobre o sistema administrativo, entre em contato:
- **Email:** admin@codemar.com.br
- **Documentação:** Este arquivo e comentários no código
- **Logs:** Verificar logs do Laravel para diagnóstico de problemas
