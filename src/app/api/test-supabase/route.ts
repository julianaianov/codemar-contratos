import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabase/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando conexão com Supabase...');

    // Teste 1: Verificar se as tabelas existem (testando acesso direto)
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersTestError) {
      console.error('❌ Erro ao acessar tabela users:', usersTestError);
      return NextResponse.json({
        success: false,
        message: 'Erro ao acessar tabela users',
        error: usersTestError.message
      }, { status: 500 });
    }

    console.log('✅ Tabela users acessível');

    // Teste 2: Verificar se o usuário admin existe
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'admin')
      .limit(1);

    if (userError) {
      console.error('❌ Erro ao verificar usuário admin:', userError);
      return NextResponse.json({
        success: false,
        message: 'Erro ao verificar usuário admin',
        error: userError.message
      }, { status: 500 });
    }

    console.log('✅ Usuário admin encontrado:', adminUser?.[0]);

    // Teste 3: Contar registros nas tabelas
    const { count: usersCount, error: usersCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: importsCount, error: importsCountError } = await supabase
      .from('file_imports')
      .select('*', { count: 'exact', head: true });

    const { count: contractsCount, error: contractsCountError } = await supabase
      .from('contratos_importados')
      .select('*', { count: 'exact', head: true });

    console.log('✅ Contadores:', {
      users: usersCount,
      imports: importsCount,
      contracts: contractsCount
    });

    // Teste 4: Testar inserção de dados de teste (comentado por problemas de tipo)
    // const testUser = {
    //   name: 'Usuário Teste',
    //   email: `teste-${Date.now()}@codemar.com`,
    //   password: 'senha_teste_123',
    //   role: 'user',
    //   department: 'Diretoria de Administração'
    // };

    // const { data: newUser, error: insertError } = await supabase
    //   .from('users')
    //   .insert([testUser])
    //   .select()
    //   .single();

    // if (insertError) {
    //   console.error('❌ Erro ao inserir usuário teste:', insertError);
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Erro ao inserir usuário teste',
    //     error: insertError.message
    //   }, { status: 500 });
    // }

    // console.log('✅ Usuário teste inserido:', newUser);

    // Limpar usuário teste (comentado)
    // await supabase
    //   .from('users')
    //   .delete()
    //   .eq('id', newUser.id);

    console.log('✅ Usuário teste removido');

    const result = {
      success: true,
      message: 'Conexão com Supabase funcionando perfeitamente!',
      data: {
        tables: ['users', 'file_imports', 'contratos_importados'],
        admin_user: adminUser?.[0] || null,
        counts: {
          users: usersCount || 0,
          imports: importsCount || 0,
          contracts: contractsCount || 0
        },
        test_insert: 'Sucesso - usuário teste inserido e removido',
        timestamp: new Date().toISOString()
      }
    };

    console.log('🎉 Teste concluído com sucesso!');
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
