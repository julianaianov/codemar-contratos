#!/bin/bash

echo "🔍 Verificando se há dados reais do e-cidade..."

# Verificar se há dados reais no banco e-cidade
echo "📊 Verificando dados reais no banco e-cidade..."

# Verificar se há dados de receitas reais
RECEITAS_COUNT=$(docker exec -it ecidade-postgres psql -U postgres -d ecidade -c "SELECT COUNT(*) FROM transparencia.receitas;" 2>/dev/null | grep -o '[0-9]*' | tail -1)

if [ "$RECEITAS_COUNT" -gt 0 ]; then
    echo "✅ Encontrados $RECEITAS_COUNT receitas no banco"
else
    echo "❌ Nenhuma receita encontrada no banco"
fi

# Verificar se há dados de empenhos reais
EMPENHOS_COUNT=$(docker exec -it ecidade-postgres psql -U postgres -d ecidade -c "SELECT COUNT(*) FROM transparencia.empenhos;" 2>/dev/null | grep -o '[0-9]*' | tail -1)

if [ "$EMPENHOS_COUNT" -gt 0 ]; then
    echo "✅ Encontrados $EMPENHOS_COUNT empenhos no banco"
else
    echo "❌ Nenhum empenho encontrado no banco"
fi

# Verificar se há dados de movimentações reais
MOVIMENTACOES_COUNT=$(docker exec -it ecidade-postgres psql -U postgres -d ecidade -c "SELECT COUNT(*) FROM transparencia.receitas_movimentacoes;" 2>/dev/null | grep -o '[0-9]*' | tail -1)

if [ "$MOVIMENTACOES_COUNT" -gt 0 ]; then
    echo "✅ Encontradas $MOVIMENTACOES_COUNT movimentações no banco"
else
    echo "❌ Nenhuma movimentação encontrada no banco"
fi

echo ""
echo "🔧 SOLUÇÕES POSSÍVEIS:"
echo "1. Conectar ao banco de dados real do e-cidade"
echo "2. Importar dados reais do e-cidade"
echo "3. Usar dados de produção do e-cidade"
echo ""
echo "💡 Para usar dados reais, você precisa:"
echo "   - Ter acesso ao banco de dados do e-cidade em produção"
echo "   - Ou importar um dump com dados reais"
echo "   - Ou conectar ao sistema e-cidade original"
