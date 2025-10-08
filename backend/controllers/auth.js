import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'

// ✅ LOGIN DE FUNCIONÁRIO
export async function loginFuncionario(req, res) {
  try {
    const { usuario, senha } = req.body;
    
    console.log('🔐 LOGIN FUNCIONÁRIO:', { usuario, senha: '***' });

    if (!usuario || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuário e senha são obrigatórios' 
      });
    }

    // ✅ BUSCAR FUNCIONÁRIO
    // Buscar funcionário
    const { data: funcionario, error: funcError } = await supabase
    .from('funcionario')
    .select('*')
    .eq('usuario', usuario)
    .eq('senha', senha)
    .single();

    if (funcError || !funcionario) {
    return res.status(401).json({ success: false, error: 'Usuário ou senha inválidos' });
    }

    // Buscar restaurante
    const { data: restaurante, error: restError } = await supabase
    .from('restaurante')
    .select('*')
    .eq('id_restaurante', funcionario.restaurante)
    .single();

    if (restError) {
    console.log('⚠️ Restaurante não encontrado para o funcionário');
    }



    // ✅ BUSCAR CARGO
    let cargoInfo = null;
    if (funcionario.cargo) {
      const { data: cargo } = await supabase
        .from('cargo')
        .select('id, nome_cargo')
        .eq('id', funcionario.cargo)
        .single();
      cargoInfo = cargo;
    }

    // ✅ VERIFICAR SE É ADMINISTRADOR
    const isAdmin = cargoInfo?.nome_cargo?.toLowerCase().includes('administrador') || 
                   cargoInfo?.id === 1;

    // ✅ DADOS DO USUÁRIO
      const userData = {
        id: funcionario.id_funcionario,
        tipo: 'funcionario',
        isAdmin: funcionario.cargo === 1, // exemplo
        dados: {
            id_funcionario: funcionario.id_funcionario,
            nome: funcionario.nome,
            usuario: funcionario.usuario,
            cargo: funcionario.cargo,
            restaurante: restaurante || null
      }
    };


    console.log('✅ Funcionário logado:', userData.dados.nome, 'Restaurante:', funcionario.restaurante);

    // ✅ GERAR TOKEN JWT
    const token = jwt.sign(
      { 
        id: funcionario.id_funcionario, 
        tipo: 'funcionario',
        isAdmin: isAdmin,
        restaurante: funcionario.restaurante
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token: token,
      user: userData
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// ✅ LOGIN DE RESTAURANTE
export async function loginRestaurante(req, res) {
  try {
    const { usuario, senha } = req.body;
    
    console.log('🔐 LOGIN RESTAURANTE:', { usuario, senha: '***' });
    
    if (!usuario || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuário e senha são obrigatórios' 
      });
    }

    // ✅ BUSCAR RESTAURANTE
    const { data: restaurante, error } = await supabase
      .from('restaurante')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .single();

    if (error || !restaurante) {
      console.log('❌ Restaurante não encontrado');
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário ou senha inválidos' 
      });
    }

    console.log('✅ Restaurante logado:', restaurante.nome_restaurante);

    // ✅ DADOS DO USUÁRIO
    const userData = {
      id: restaurante.id_restaurante,
      tipo: 'restaurante',
      isAdmin: true,
      dados: {
        id_restaurante: restaurante.id_restaurante,
        nome_restaurante: restaurante.nome_restaurante,
        nome: restaurante.nome_restaurante,
        usuario: restaurante.usuario
      }
    };

    // ✅ GERAR TOKEN JWT
    const token = jwt.sign(
      { 
        id: restaurante.id_restaurante,
        tipo: 'restaurante',
        restaurante: restaurante.id_restaurante
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: userData
    });

  } catch (err) {
    console.error('❌ Erro no login de restaurante:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}