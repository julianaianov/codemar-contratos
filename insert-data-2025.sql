-- Inserir dados de exemplo para 2025
-- Primeiro, verificar se já existem dados para 2025
DO $$
BEGIN
    -- Inserir receitas para 2025 se não existirem
    IF NOT EXISTS (SELECT 1 FROM transparencia.receitas WHERE exercicio = 2025 LIMIT 1) THEN
        INSERT INTO transparencia.receitas (exercicio, valor, data, descricao, planoconta_id, instituicao_id, recurso_id)
        VALUES 
            (2025, 1500000.00, '2025-01-01', 'IPTU 2025', 1, 1, 1),
            (2025, 800000.00, '2025-01-01', 'ISSQN 2025', 2, 1, 1),
            (2025, 300000.00, '2025-01-01', 'Taxa de Lixo 2025', 3, 1, 1),
            (2025, 200000.00, '2025-02-01', 'Transferências FPM', 4, 1, 1),
            (2025, 150000.00, '2025-02-01', 'Transferências FPE', 5, 1, 1);
    END IF;

    -- Inserir empenhos para 2025 se não existirem
    IF NOT EXISTS (SELECT 1 FROM transparencia.empenhos WHERE exercicio = 2025 LIMIT 1) THEN
        INSERT INTO transparencia.empenhos (exercicio, numero_empenho, descricao, valor, valor_liquidado, valor_pago, data_emissao, orgao_id)
        VALUES 
            (2025, 'EMP-2025-001', 'Material de Escritório', 50000.00, 45000.00, 40000.00, '2025-01-15', 1),
            (2025, 'EMP-2025-002', 'Serviços de Limpeza', 120000.00, 110000.00, 100000.00, '2025-01-20', 1),
            (2025, 'EMP-2025-003', 'Manutenção de Equipamentos', 80000.00, 75000.00, 70000.00, '2025-02-01', 1),
            (2025, 'EMP-2025-004', 'Combustível', 60000.00, 55000.00, 50000.00, '2025-02-10', 1),
            (2025, 'EMP-2025-005', 'Material de Construção', 200000.00, 180000.00, 160000.00, '2025-02-15', 1);
    END IF;

    -- Inserir receitas_movimentacoes para 2025 se não existirem
    IF NOT EXISTS (SELECT 1 FROM transparencia.receitas_movimentacoes WHERE exercicio = 2025 LIMIT 1) THEN
        INSERT INTO transparencia.receitas_movimentacoes (exercicio, mes, valor, receita_id)
        VALUES 
            (2025, 1, 450000.00, 1),
            (2025, 2, 380000.00, 1),
            (2025, 3, 420000.00, 1),
            (2025, 1, 250000.00, 2),
            (2025, 2, 280000.00, 2),
            (2025, 3, 300000.00, 2),
            (2025, 1, 100000.00, 3),
            (2025, 2, 120000.00, 3),
            (2025, 3, 110000.00, 3);
    END IF;

    RAISE NOTICE 'Dados para 2025 inseridos com sucesso!';
END $$;



