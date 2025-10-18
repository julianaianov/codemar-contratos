# Sistema de Termos e Instrumentos Contratuais - Laravel

## 📋 Visão Geral

Sistema completo de gestão de termos e instrumentos contratuais implementado no Laravel, com conformidade à Lei 14.133/2021 e integração com o sistema de contratos existente.

## 🏗️ Estrutura Implementada

### 1. Migrações Criadas

- **`termos_contratuais`**: Tabela para gerenciar termos contratuais (aditivos, apostilamentos, rescisões, etc.)
- **`instrumentos_contratuais`**: Tabela para gerenciar instrumentos (convênios, parcerias, etc.)
- **`empenhos`**: Tabela para gerenciar empenhos
- **Campos adicionais em `contratos_importados`**: Campos para controle de conformidade

### 2. Modelos Eloquent

#### TermoContratual
- Relacionamento com ContratoImportado
- Constantes para tipos e status
- Métodos para validação e cálculos
- Eventos para atualização automática de métricas

#### InstrumentoContratual
- Relacionamento com ContratoImportado
- Constantes para tipos e status
- Métodos para verificação de vigência
- Cálculos de duração e dias restantes

#### Empenho
- Gestão de empenhos
- Verificação de vencimento
- Cálculos de duração

#### ContratoImportado (Atualizado)
- Novos relacionamentos com termos e instrumentos
- Métodos para conformidade com Lei 14.133/2021
- Classificação automática de contratos
- Cálculos de limites legais

### 3. Controllers da API

#### TermoContratualController
- CRUD completo para termos
- Validação de limites legais
- Atualização de status
- Filtros por tipo e status

#### InstrumentoContratualController
- CRUD completo para instrumentos
- Gestão de vigência
- Filtros por tipo, status e vencimento

#### ConformidadeController
- Análise de conformidade individual
- Estatísticas gerais
- Filtros por status e classificação
- Verificação de aditivos

### 4. Rotas da API

#### Termos Contratuais
```
GET    /api/termos                    # Listar termos
POST   /api/termos                    # Criar termo
GET    /api/termos/{id}               # Exibir termo
PUT    /api/termos/{id}               # Atualizar termo
DELETE /api/termos/{id}               # Excluir termo
PATCH  /api/termos/{id}/status        # Atualizar status
GET    /api/termos/tipo/{tipo}        # Filtrar por tipo
GET    /api/termos/aprovados/listar   # Listar aprovados
```

#### Instrumentos Contratuais
```
GET    /api/instrumentos                           # Listar instrumentos
POST   /api/instrumentos                           # Criar instrumento
GET    /api/instrumentos/{id}                      # Exibir instrumento
PUT    /api/instrumentos/{id}                      # Atualizar instrumento
DELETE /api/instrumentos/{id}                      # Excluir instrumento
PATCH  /api/instrumentos/{id}/status               # Atualizar status
GET    /api/instrumentos/tipo/{tipo}               # Filtrar por tipo
GET    /api/instrumentos/ativos/listar             # Listar ativos
GET    /api/instrumentos/vigentes/listar           # Listar vigentes
GET    /api/instrumentos/vencidos/listar           # Listar vencidos
GET    /api/instrumentos/proximos-vencimento/listar # Próximos vencimentos
```

#### Conformidade
```
GET    /api/conformidade/estatisticas              # Estatísticas gerais
GET    /api/conformidade/contrato/{id}             # Análise individual
GET    /api/conformidade/status/{status}           # Filtrar por status
GET    /api/conformidade/classificacao/{categoria} # Filtrar por classificação
POST   /api/conformidade/verificar-aditivo         # Verificar aditivo
```

## 🏛️ Conformidade com Lei 14.133/2021

### Limites de Aditivo por Categoria

1. **Reforma de Edifício ou Equipamento**: 50%
   - Palavras-chave: reforma, equipamento, edifício, instalação, manutenção

2. **Obras, Serviços ou Compras**: 25%
   - Palavras-chave: obra, construção, ampliação, serviço, compra, fornecimento

3. **Sociedade Mista**: 25%
   - Palavras-chave: sociedade, mista

4. **Demais Contratos**: 25% (padrão)

### Status de Conformidade

- **CONFORME**: Dentro dos limites legais
- **ATENÇÃO**: Próximo do limite (80% do limite legal)
- **INCONFORME**: Acima do limite legal

## 🔧 Funcionalidades Principais

### 1. Gestão de Termos
- Criação de aditivos, apostilamentos, rescisões e reconhecimentos de dívida
- Validação automática de limites legais
- Controle de status (pendente, aprovado, rejeitado, etc.)
- Vinculação com empenhos

### 2. Gestão de Instrumentos
- Criação de convênios, parcerias, comodatos, etc.
- Controle de vigência
- Gestão de status (ativo, suspenso, encerrado, cancelado)
- Alertas de vencimento

### 3. Análise de Conformidade
- Classificação automática de contratos
- Cálculo de limites legais
- Análise individual e estatísticas gerais
- Recomendações baseadas no status

### 4. Integração com Contratos
- Atualização automática de métricas
- Relacionamentos bidirecionais
- Histórico de alterações
- Cálculos em tempo real

## 📊 Métricas e Relatórios

### Métricas por Contrato
- Valor original vs. valor atual
- Percentual total de aditivos
- Quantidade de termos por tipo
- Status de conformidade

### Estatísticas Gerais
- Total de contratos por status de conformidade
- Distribuição por classificação
- Valores totais por categoria
- Percentual médio de aditivos

## 🚀 Como Usar

### 1. Criar um Termo Contratual
```bash
POST /api/termos
{
    "contrato_id": 1,
    "tipo": "aditivo",
    "numero": "001/2025",
    "data_vigencia": "2025-01-01",
    "valor_aditivo": 10000.00,
    "descricao": "Aditivo para ampliação do escopo",
    "justificativa": "Necessidade de ampliar o escopo do contrato",
    "criado_por": "João Silva"
}
```

### 2. Verificar Conformidade
```bash
GET /api/conformidade/contrato/1
```

### 3. Obter Estatísticas
```bash
GET /api/conformidade/estatisticas
```

## 🔍 Validações Implementadas

### Termos Contratuais
- Número único por contrato
- Validação de limites legais para aditivos
- Verificação de datas
- Validação de valores

### Instrumentos Contratuais
- Número único por contrato
- Validação de datas (início <= fim)
- Validação de valores positivos
- Verificação de vigência

## 📈 Benefícios

1. **Conformidade Legal**: Garantia de cumprimento da Lei 14.133/2021
2. **Controle Automático**: Validações em tempo real
3. **Visibilidade**: Análise completa de conformidade
4. **Integração**: Sistema unificado com contratos existentes
5. **Relatórios**: Estatísticas e métricas detalhadas
6. **Auditoria**: Histórico completo de alterações

## 🛠️ Próximos Passos

1. **Interface Frontend**: Integração com o dashboard Next.js
2. **Notificações**: Alertas de vencimento e conformidade
3. **Relatórios**: Geração de relatórios em PDF/Excel
4. **Workflow**: Aprovação de termos
5. **Auditoria**: Log detalhado de alterações

## 📝 Notas Técnicas

- Sistema totalmente integrado com o Laravel existente
- Migrações executadas com sucesso
- Relacionamentos Eloquent configurados
- Validações robustas implementadas
- API RESTful completa
- Documentação detalhada

O sistema está pronto para uso e pode ser integrado com o frontend Next.js existente! 🚀
