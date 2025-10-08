# Configuração do Vercel para Dashboard e-Cidade

## Problema Identificado
Os dados não aparecem no Vercel porque as variáveis de ambiente estão configuradas para `localhost`, mas no Vercel precisam apontar para o banco de dados real.

## Variáveis de Ambiente Necessárias no Vercel

### 1. Acesse o Dashboard do Vercel
- Vá para o projeto no Vercel
- Clique em "Settings" > "Environment Variables"

### 2. Configure as seguintes variáveis:

```
DB_PORTAL_HOST=seu_host_do_banco
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=ecidade
DB_PORTAL_USERNAME=seu_usuario
DB_PORTAL_PASSWORD=sua_senha
NODE_ENV=production
```

### 3. Exemplo de configuração para banco PostgreSQL:
```
DB_PORTAL_HOST=db.xxxxx.supabase.co
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=postgres
DB_PORTAL_USERNAME=postgres
DB_PORTAL_PASSWORD=sua_senha_aqui
NODE_ENV=production
```

## Verificações Necessárias

### 1. Verificar se o banco está acessível
- O banco deve estar acessível publicamente
- Firewall deve permitir conexões do Vercel
- SSL deve estar configurado corretamente

### 2. Verificar se as tabelas existem
- `transparencia.receitas`
- `transparencia.empenhos`
- `transparencia.instituicoes`
- `transparencia.receitas_movimentacoes`

### 3. Verificar se há dados para 2025
- O dashboard está configurado para 2025
- Verificar se existem dados para este exercício

## Solução Temporária
Se não houver dados para 2025, você pode:
1. Alterar o ano padrão no código
2. Inserir dados de exemplo para 2025
3. Usar dados de 2024 como fallback

## Comandos para Verificar
```bash
# Verificar conexão com banco
psql -h seu_host -p 5432 -U seu_usuario -d ecidade

# Verificar dados
SELECT COUNT(*) FROM transparencia.receitas WHERE exercicio = 2025;
SELECT COUNT(*) FROM transparencia.empenhos WHERE exercicio = 2025;
```



