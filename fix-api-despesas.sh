#!/bin/bash

echo "🔧 Testando e corrigindo API de despesas..."

# Testar consulta diretamente no banco
echo "📊 Testando consulta no banco:"
docker exec ecidade-postgres psql -U postgres -d ecidade -c "
SELECT 
  'TESTE DIRETO NO BANCO:' as status,
  COALESCE(SUM(e.valor), 0) as total_despesas_empenhadas,
  COALESCE(SUM(e.valor_pago), 0) as total_despesas_pagas 
FROM transparencia.empenhos e 
WHERE e.exercicio = 2024;
"

echo ""
echo "🔍 Testando API Next.js:"
curl -s "http://localhost:3000/api/ecidade/database?path=dashboard/metrics" | jq '.total_despesas_empenhadas, .total_despesas_pagas'

echo ""
echo "📈 Testando gráfico de despesas:"
curl -s "http://localhost:3000/api/ecidade/database?path=despesas-chart" | jq '.[0:2]'

echo ""
echo "✅ Comparação concluída!"
