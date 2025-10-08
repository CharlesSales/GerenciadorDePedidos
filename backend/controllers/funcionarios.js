import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'

// Rota para listar funcionarios (filtrada por restaurante do usuário logado)
export async function listarFuncionarios(req, res) {
  try {
    // ✅ VERIFICAR SE TEM TOKEN
    const token = req.headers.authorization?.replace('Bearer ', '');
    let restauranteId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        restauranteId = decoded.restaurante_id;
        console.log(`🏢 Usuário autenticado - Restaurante ID: ${restauranteId}`);
      } catch (tokenError) {
        console.log('⚠️ Token inválido para funcionarios');
        return res.status(401).json({ error: 'Token inválido' });
      }
    } else {
      console.log('📋 Sem token para funcionarios');
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }

    if (!restauranteId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem restaurante associado' });
    }

    const { data, error } = await supabase
      .from('funcionario')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .order('nome', { ascending: true });  

    if (error) return res.status(500).json({ error: error.message });
    
    console.log(`👥 Funcionarios encontrados para restaurante ${restauranteId}:`, data.length);
    res.json(data);
  } catch (err) {
    console.error('Erro ao listar funcionarios:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function cadastrarFuncionario(req, res) {
  const { id, nome } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ id, nome }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'funcionario cadastrado com sucesso!', produto: data[0] });
};
