import jwt from 'jsonwebtoken'
import { supabase } from '../supabaseClient.js'

export const authenticateToken = async (req, res, next) => {
  console.log('🔐 Middleware de autenticação iniciado');
  console.log('📡 Headers da requisição:', req.headers.authorization ? 'Token presente' : 'Token ausente');
  
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso requerido' })
  }

  try {
    // ✅ VERIFICAR SE JWT_SECRET ESTÁ CONFIGURADO
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET não configurado no .env');
      return res.status(500).json({ error: 'Configuração de autenticação inválida' });
    }

    console.log('🔓 Decodificando token...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token decodificado:', { 
      id: decoded.id, 
      tipo: decoded.tipo, 
      exp: new Date(decoded.exp * 1000).toLocaleString() 
    });
    
    // ✅ VERIFICAR SE O USUÁRIO AINDA EXISTE
    console.log('🔍 Verificando usuário no banco de dados...');
    
    const tabela = decoded.tipo === 'funcionario' ? 'funcionario' : 'restaurante';
    const campoId = decoded.tipo === 'funcionario' ? 'id_funcionario' : 'id_restaurante';
    
    console.log(`📋 Consultando tabela: ${tabela}, campo: ${campoId}, valor: ${decoded.id}`);
    
    const { data: usuario, error } = await supabase
      .from(tabela)
      .select('*')
      .eq(campoId, decoded.id)
      .single();

    if (error) {
      console.error('❌ Erro ao consultar usuário:', error);
      return res.status(403).json({ error: 'Erro ao verificar usuário' });
    }

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário encontrado:', {
      id: usuario[campoId],
      nome: usuario.nome || usuario.nome_restaurante,
      tipo: decoded.tipo
    });

    // ✅ ADICIONAR INFORMAÇÕES EXTRAS PARA FUNCIONÁRIOS
    if (decoded.tipo === 'funcionario') {
      console.log('👨‍💼 Funcionário - Restaurante ID:', usuario.restaurante);
    }

    req.user = {
      id: decoded.id,
      tipo: decoded.tipo,
      dados: usuario
    }
    
    console.log('✅ Autenticação bem-sucedida');
    next()
  } catch (err) {
    console.error('❌ Erro na autenticação:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token malformado' });
    } else {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
  }
}

// Middleware para verificar se é administrador do restaurante
export const requireRestauranteAdmin = (req, res, next) => {
  console.log('🔒 Verificando permissão de admin do restaurante');
  if (req.user.tipo !== 'restaurante') {
    console.log('❌ Acesso negado - não é admin do restaurante');
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }
  console.log('✅ Admin do restaurante autorizado');
  next()
}

// Middleware para verificar se é funcionário ou admin
export const requireFuncionarioOrAdmin = (req, res, next) => {
  console.log('🔒 Verificando permissão de funcionário ou admin');
  if (!['funcionario', 'restaurante'].includes(req.user.tipo)) {
    console.log('❌ Acesso negado - não é funcionário nem admin');
    return res.status(403).json({ error: 'Acesso negado.' })
  }
  console.log('✅ Funcionário ou admin autorizado');
  next()
}