# Conformidade com Lei 14.133/2021 - Sistema de Aditivos

## Visão Geral

O sistema foi atualizado para estar em total conformidade com a **Lei 14.133/2021** (Nova Lei de Licitações e Contratos Administrativos), que estabelece os percentuais máximos permitidos para aditivos contratuais.

## Percentuais Máximos Conforme Lei 14.133/2021

### 1. Reforma de Edifício ou Equipamento
- **Percentual Máximo**: 50%
- **Aplicação**: Contratos de reforma, manutenção, instalação de equipamentos
- **Palavras-chave**: reforma, reformas, equipamento, equipamentos, edifício, edifícios, instalação, instalações, manutenção, manutenções

### 2. Obras, Serviços ou Compras
- **Percentual Máximo**: 25%
- **Aplicação**: Contratos de obras, serviços, compras, fornecimentos
- **Palavras-chave**: obra, obras, construção, construções, ampliação, ampliações, restauração, restaurações, demolição, demolições, serviço, serviços, compra, compras, fornecimento, fornecimentos

### 3. Sociedade Mista
- **Percentual Máximo**: 25%
- **Aplicação**: Contratos com sociedades mistas
- **Palavras-chave**: sociedade, mista

### 4. Demais Contratos
- **Percentual Máximo**: 25%
- **Aplicação**: Contratos que não se enquadram nas categorias acima

## Funcionalidades Implementadas

### 1. Classificação Automática de Contratos
```typescript
// Função que classifica automaticamente o contrato
const classificacao = getClassificacaoContrato(tipoContrato, objetoContrato);

// Retorna:
{
  categoria: 'REFORMA_EQUIPAMENTO' | 'OBRAS_SERVICOS_COMPRAS' | 'SOCIEDADE_MISTA' | 'DEFAULT',
  limite: 50 | 25,
  descricao: 'Descrição da classificação'
}
```

### 2. Validação em Tempo Real
- **Frontend**: Validação durante digitação no modal de aditivo
- **Backend**: Validação na API antes de salvar
- **Alertas Visuais**: Indicadores de proximidade do limite

### 3. Análise de Conformidade
- **Status**: CONFORME, ATENÇÃO, INCONFORME
- **Margem de Segurança**: 80% do limite legal
- **Recomendações**: Sugestões baseadas no status

### 4. Relatórios Power BI
- **Dados Estruturados**: Conformidade por contrato
- **Estatísticas**: Percentuais de conformidade
- **Filtros**: Por classificação, status, diretoria

## APIs Implementadas

### 1. Análise de Conformidade Individual
```
GET /api/contratos/{id}/conformidade
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contrato": { ... },
    "classificacao": {
      "categoria": "SOCIEDADE_MISTA",
      "limite_legal": 25,
      "descricao": "Sociedade Mista",
      "base_legal": "Lei 14.133/2021"
    },
    "conformidade": {
      "percentual_aditivo": 15.5,
      "dentro_limite_legal": true,
      "status": "CONFORME",
      "percentual_restante": 9.5,
      "valor_restante": 95000
    },
    "recomendacoes": [ ... ],
    "historico_conformidade": [ ... ]
  }
}
```

### 2. Dados Power BI com Conformidade
```
GET /api/contratos/powerbi
```

**Campos Adicionais:**
```json
{
  "classificacao_contrato": "SOCIEDADE_MISTA",
  "limite_legal": 25,
  "descricao_classificacao": "Sociedade Mista",
  "dentro_limite_legal": true,
  "percentual_restante": 9.5,
  "valor_restante": 95000,
  "status_conformidade": "CONFORME"
}
```

## Componentes Atualizados

### 1. ContratoTermsCard
- **Classificação**: Exibe a classificação do contrato
- **Status Visual**: Indicadores de conformidade
- **Alertas**: Avisos de proximidade do limite

### 2. AddTermoModal
- **Validação**: Verificação em tempo real
- **Classificação**: Mostra limite específico do contrato
- **Alertas**: Avisos de ultrapassagem

### 3. ConformidadeContrato
- **Análise Completa**: Status detalhado de conformidade
- **Recomendações**: Sugestões baseadas no status
- **Histórico**: Evolução da conformidade ao longo do tempo

## Exemplos de Uso

### 1. Contrato de Sociedade Mista
```typescript
// Contrato com tipo "Sociedade Mista"
const contrato = {
  tipo_contrato: "Sociedade Mista",
  objeto: "Prestação de serviços de TI",
  valor_contrato: 1000000
};

// Classificação automática
const classificacao = getClassificacaoContrato(contrato.tipo_contrato, contrato.objeto);
// Resultado: { categoria: "SOCIEDADE_MISTA", limite: 25, descricao: "Sociedade Mista" }

// Validação de aditivo
const aditivo = 200000; // 20% do valor original
const dentroLimite = isAditivoDentroLimite(1000000, 200000, "Sociedade Mista", "Prestação de serviços de TI");
// Resultado: true (dentro do limite de 25%)
```

### 2. Contrato de Reforma
```typescript
// Contrato de reforma
const contrato = {
  tipo_contrato: "Reforma",
  objeto: "Reforma do edifício administrativo",
  valor_contrato: 2000000
};

// Classificação automática
const classificacao = getClassificacaoContrato(contrato.tipo_contrato, contrato.objeto);
// Resultado: { categoria: "REFORMA_EQUIPAMENTO", limite: 50, descricao: "Reforma de Edifício ou Equipamento" }

// Validação de aditivo
const aditivo = 800000; // 40% do valor original
const dentroLimite = isAditivoDentroLimite(2000000, 800000, "Reforma", "Reforma do edifício administrativo");
// Resultado: true (dentro do limite de 50%)
```

## Power BI - Dashboards Recomendados

### 1. Dashboard de Conformidade Geral
- **Gráfico de Pizza**: Status de conformidade (Conforme/Atentação/Inconforme)
- **Gráfico de Barras**: Percentual de conformidade por diretoria
- **Tabela**: Contratos inconformes com detalhes

### 2. Dashboard de Análise por Classificação
- **Gráfico de Barras**: Valor total por classificação de contrato
- **Gráfico de Linha**: Evolução dos percentuais de aditivo
- **Mapa de Calor**: Conformidade por diretoria e classificação

### 3. Dashboard de Alertas
- **Cards**: Contratos próximos do limite
- **Lista**: Recomendações por contrato
- **Gráfico**: Tendência de conformidade

## Medidas DAX para Power BI

### 1. Percentual de Conformidade
```dax
% Conformidade = 
DIVIDE(
    COUNTROWS(FILTER(Contratos, Contratos[status_conformidade] = "CONFORME")),
    COUNTROWS(Contratos),
    0
) * 100
```

### 2. Valor Total Inconforme
```dax
Valor Inconforme = 
SUMX(
    FILTER(Contratos, Contratos[status_conformidade] = "INCONFORME"),
    Contratos[valor_atual]
)
```

### 3. Média de Aditivo por Classificação
```dax
Média Aditivo por Classificação = 
AVERAGEX(
    VALUES(Contratos[classificacao_contrato]),
    CALCULATE(AVERAGE(Contratos[percentual_aditivo]))
)
```

## Monitoramento e Alertas

### 1. Alertas Automáticos
- **Inconformidade**: Contratos acima do limite legal
- **Atenção**: Contratos próximos do limite (80%)
- **Recomendações**: Sugestões baseadas no status

### 2. Relatórios Periódicos
- **Semanal**: Contratos com novos aditivos
- **Mensal**: Análise de conformidade geral
- **Trimestral**: Tendências e recomendações

### 3. Auditoria
- **Logs**: Todas as alterações de status
- **Histórico**: Evolução da conformidade
- **Rastreabilidade**: Quem aprovou cada termo

## Benefícios da Implementação

### 1. Conformidade Legal
- **100% Conforme**: Lei 14.133/2021
- **Validação Automática**: Previne inconformidades
- **Auditoria**: Rastreabilidade completa

### 2. Gestão Eficiente
- **Alertas Proativos**: Evita ultrapassagens
- **Recomendações**: Orientações baseadas em dados
- **Relatórios**: Visibilidade completa

### 3. Transparência
- **Dados Públicos**: Conformidade visível
- **Relatórios Power BI**: Análises detalhadas
- **Histórico**: Evolução transparente

## Próximos Passos

### 1. Implementação
1. Executar script SQL no banco
2. Testar validações
3. Configurar Power BI
4. Treinar usuários

### 2. Monitoramento
1. Configurar alertas
2. Criar relatórios
3. Estabelecer rotinas
4. Revisar periodicamente

### 3. Melhorias
1. Integração com outros sistemas
2. Notificações automáticas
3. Workflow de aprovação
4. Dashboard executivo

## Suporte

Para dúvidas sobre conformidade legal:
- **Base Legal**: Lei 14.133/2021
- **Documentação**: Sistema completo
- **Suporte Técnico**: Equipe de desenvolvimento
- **Jurídico**: Consultoria especializada
