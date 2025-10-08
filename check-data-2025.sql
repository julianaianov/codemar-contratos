-- Verificar dados para 2025
SELECT 'Receitas 2025' as tabela, COUNT(*) as total FROM transparencia.receitas WHERE exercicio = 2025
UNION ALL
SELECT 'Empenhos 2025' as tabela, COUNT(*) as total FROM transparencia.empenhos WHERE exercicio = 2025
UNION ALL
SELECT 'Receitas Movimentacoes 2025' as tabela, COUNT(*) as total FROM transparencia.receitas_movimentacoes WHERE exercicio = 2025;

-- Verificar dados para 2024 (para comparação)
SELECT 'Receitas 2024' as tabela, COUNT(*) as total FROM transparencia.receitas WHERE exercicio = 2024
UNION ALL
SELECT 'Empenhos 2024' as tabela, COUNT(*) as total FROM transparencia.empenhos WHERE exercicio = 2024
UNION ALL
SELECT 'Receitas Movimentacoes 2024' as tabela, COUNT(*) as total FROM transparencia.receitas_movimentacoes WHERE exercicio = 2024;



