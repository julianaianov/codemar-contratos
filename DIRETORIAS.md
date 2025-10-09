# Diretorias do Sistema CODEMAR Contratos

## Lista de Diretorias

O sistema suporta as seguintes diretorias para emissão e recebimento de contratos:

1. **Presidência**
2. **Diretoria de Administração** ✨ (Nova)
3. **Diretoria Jurídica**
4. **Diretoria de Assuntos Imobiliários**
5. **Diretoria de Operações**
6. **Diretoria de Tecnologia da Informação e Inovação**
7. **Diretoria de Governança em Licitações e Contratações**

## Onde as Diretorias são Utilizadas

### Frontend

#### Páginas de Importação
As diretorias estão disponíveis em todas as páginas de importação de contratos:

- **`/importacao/xml`** - Importação de arquivos XML
- **`/importacao/excel`** - Importação de planilhas Excel
- **`/importacao/csv`** - Importação de arquivos CSV
- **`/importacao/pdf`** - Importação de documentos PDF

**Localização no código:**
- `src/app/importacao/xml/page.tsx`
- `src/app/importacao/excel/page.tsx`
- `src/app/importacao/csv/page.tsx`
- `src/app/importacao/pdf/page.tsx`

#### Filtros de Consulta
As diretorias aparecem como opção de filtro na consulta de contratos:

- **Componente:** `FilterPanel`
- **Localização:** `src/components/contratos/FilterPanel.tsx`
- **Uso:** Permite filtrar contratos por diretoria responsável

#### Cadastro de Contratos
As diretorias estão disponíveis no formulário de cadastro manual de contratos:

- **Página:** `/cadastros/contratos`
- **Localização:** `src/app/cadastros/contratos/page.tsx`
- **Campo:** Select "Diretoria Responsável"

### Backend

#### API Endpoint
O backend fornece um endpoint para listar todas as diretorias:

```
GET /api/contratos/diretorias
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    "Presidência",
    "Diretoria de Administração",
    "Diretoria Jurídica",
    "Diretoria de Assuntos Imobiliários",
    "Diretoria de Operações",
    "Diretoria de Tecnologia da Informação e Inovação",
    "Diretoria de Governança em Licitações e Contratações"
  ]
}
```

**Localização:** `backend-laravel/app/Http/Controllers/ContratoController.php`

## Como Adicionar uma Nova Diretoria

Para adicionar uma nova diretoria ao sistema, siga estes passos:

### 1. Backend
Edite o arquivo `backend-laravel/app/Http/Controllers/ContratoController.php`:

```php
public function diretorias()
{
    $diretorias = [
        'Presidência',
        'Diretoria de Administração',
        'Diretoria Jurídica',
        // ... outras diretorias
        'Nova Diretoria', // Adicione aqui
    ];

    return response()->json([
        'success' => true,
        'data' => $diretorias,
    ]);
}
```

### 2. Frontend - Páginas de Importação
Edite os seguintes arquivos e adicione a nova diretoria no array `diretorias`:

- `src/app/importacao/xml/page.tsx`
- `src/app/importacao/excel/page.tsx`
- `src/app/importacao/csv/page.tsx`
- `src/app/importacao/pdf/page.tsx`

```typescript
const diretorias = [
  'Presidência',
  'Diretoria de Administração',
  // ... outras diretorias
  'Nova Diretoria', // Adicione aqui
];
```

### 3. Frontend - Componente de Filtros
Edite o arquivo `src/components/contratos/FilterPanel.tsx`:

```typescript
const [diretoriaOptions] = useState<SelectOption[]>([
  { value: 'Presidência', label: 'Presidência' },
  { value: 'Diretoria de Administração', label: 'Diretoria de Administração' },
  // ... outras diretorias
  { value: 'Nova Diretoria', label: 'Nova Diretoria' }, // Adicione aqui
]);
```

### 4. Frontend - Cadastro de Contratos
Edite o arquivo `src/app/cadastros/contratos/page.tsx`:

```tsx
<select>
  <option value="">Selecione uma diretoria</option>
  <option value="Presidência">Presidência</option>
  <option value="Diretoria de Administração">Diretoria de Administração</option>
  {/* ... outras diretorias */}
  <option value="Nova Diretoria">Nova Diretoria</option> {/* Adicione aqui */}
</select>
```

### 5. Limpar Cache
Após as alterações, limpe o cache:

```bash
cd backend-laravel
php artisan config:clear
php artisan cache:clear
```

## Funcionalidades por Diretoria

Cada diretoria pode:

1. **Emitir Contratos**
   - Importar contratos via XML, Excel, CSV ou PDF
   - Cadastrar contratos manualmente
   - Vincular documentos aos contratos

2. **Receber Contratos**
   - Visualizar contratos recebidos
   - Filtrar por diretoria responsável
   - Gerar relatórios específicos

3. **Gerenciar Contratos**
   - Editar informações de contratos
   - Acompanhar status e prazos
   - Exportar dados para análise

## Considerações Técnicas

### Padronização
- Todas as diretorias seguem o mesmo formato de nomenclatura
- A ordem alfabética é mantida (exceto Presidência, que fica no topo)
- Os valores são case-sensitive

### Validação
- O campo de diretoria é obrigatório em importações
- A validação é feita tanto no frontend quanto no backend
- Diretorias inválidas são rejeitadas na importação

### Banco de Dados
- As diretorias são armazenadas como strings no banco de dados
- Campo: `secretaria` ou `diretoria` (dependendo da tabela)
- Não há tabela separada de diretorias (lista hardcoded por simplicidade)

## Histórico de Mudanças

### 2025-01-09
- ✨ Adicionada **Diretoria de Administração**
- 📝 Atualizada documentação do sistema
- ✅ Incluída em todos os filtros e formulários

### 2025-01-08
- 🎉 Sistema inicial com 6 diretorias

## Suporte

Para dúvidas ou problemas relacionados às diretorias, entre em contato com a equipe de desenvolvimento ou consulte a documentação técnica do sistema.
