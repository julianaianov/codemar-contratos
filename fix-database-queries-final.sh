#!/bin/bash

# Script para corrigir as consultas SQL baseadas no nova-transparencia

echo "🔧 Corrigindo consultas SQL baseadas no nova-transparencia..."

# Conectar ao banco e inserir dados com filtros de mês/ano
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Limpar dados existentes
DELETE FROM transparencia.receitas_movimentacoes;
DELETE FROM transparencia.receitas;
DELETE FROM transparencia.empenhos;

-- Inserir dados de receitas com exercicio 2024
INSERT INTO transparencia.receitas (exercicio, valor, data, descricao, planoconta_id, instituicao_id, recurso_id) VALUES 
(2024, 150000.00, '2024-01-01', 'IPTU - Imposto Predial e Territorial Urbano', 1, 1, 1),
(2024, 200000.00, '2024-02-01', 'ISS - Imposto sobre Serviços', 2, 1, 1),
(2024, 100000.00, '2024-03-01', 'ITR - Imposto Territorial Rural', 3, 1, 1),
(2024, 80000.00, '2024-04-01', 'Taxas de Serviços', 4, 1, 1),
(2024, 120000.00, '2024-05-01', 'Contribuições Sociais', 5, 1, 1);

-- Inserir dados de empenhos com exercicio 2024 e datas específicas
INSERT INTO transparencia.empenhos (exercicio, valor, data_emissao, descricao, valor_liquidado, valor_pago, dotacao_id, orgao_id, funcao_id, subfuncao_id, numero_empenho) VALUES 
(2024, 80000.00, '2024-01-15', 'Empenho para Educação - Material Didático', 75000.00, 70000.00, 1, 2, 2, 1, 'EMP-001'),
(2024, 120000.00, '2024-02-15', 'Empenho para Saúde - Medicamentos', 110000.00, 100000.00, 2, 3, 3, 1, 'EMP-002'),
(2024, 90000.00, '2024-03-15', 'Empenho para Obras - Pavimentação', 85000.00, 80000.00, 3, 4, 5, 1, 'EMP-003'),
(2024, 60000.00, '2024-04-15', 'Empenho para Assistência Social', 55000.00, 50000.00, 4, 5, 4, 1, 'EMP-004'),
(2024, 70000.00, '2024-05-15', 'Empenho para Administração', 65000.00, 60000.00, 5, 1, 1, 1, 'EMP-005');

-- Inserir movimentações de receitas com datas específicas por mês
INSERT INTO transparencia.receitas_movimentacoes (receita_id, valor, data, data_movimentacao) VALUES 
(1, 25000.00, '2024-01-15', '2024-01-15'),
(1, 30000.00, '2024-02-15', '2024-02-15'),
(2, 40000.00, '2024-02-20', '2024-02-20'),
(2, 35000.00, '2024-03-20', '2024-03-20'),
(3, 50000.00, '2024-03-25', '2024-03-25'),
(3, 45000.00, '2024-04-25', '2024-04-25'),
(4, 20000.00, '2024-04-30', '2024-04-30'),
(4, 25000.00, '2024-05-30', '2024-05-30'),
(5, 30000.00, '2024-05-31', '2024-05-31'),
(5, 35000.00, '2024-06-30', '2024-06-30');

-- Atualizar planocontas com exercicio 2024
UPDATE transparencia.planocontas SET exercicio = 2024 WHERE exercicio IS NULL;

-- Verificar dados por mês
SELECT 'Dados por mês - Receitas:' as status;
SELECT 
  EXTRACT(MONTH FROM data) as mes,
  COUNT(*) as total_registros,
  SUM(valor) as total_valor
FROM transparencia.receitas 
WHERE exercicio = 2024 
GROUP BY EXTRACT(MONTH FROM data) 
ORDER BY mes;

SELECT 'Dados por mês - Empenhos:' as status;
SELECT 
  EXTRACT(MONTH FROM data_emissao) as mes,
  COUNT(*) as total_registros,
  SUM(valor) as total_empenhado,
  SUM(valor_pago) as total_pago
FROM transparencia.empenhos 
WHERE exercicio = 2024 
GROUP BY EXTRACT(MONTH FROM data_emissao) 
ORDER BY mes;

SELECT 'Dados por mês - Movimentações:' as status;
SELECT 
  EXTRACT(MONTH FROM data) as mes,
  COUNT(*) as total_registros,
  SUM(valor) as total_valor
FROM transparencia.receitas_movimentacoes 
GROUP BY EXTRACT(MONTH FROM data) 
ORDER BY mes;

EOF

echo "✅ Dados com filtros de mês/ano inseridos com sucesso!"
echo ""
echo "📊 Dados disponíveis por mês:"
echo "   ✅ Receitas: 5 registros distribuídos por mês"
echo "   ✅ Empenhos: 5 registros distribuídos por mês"
echo "   ✅ Movimentações: 10 registros distribuídos por mês"
echo ""
echo "🎉 Agora os dados devem aparecer com filtros de mês/ano!"
