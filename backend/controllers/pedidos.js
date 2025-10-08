import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'

// ✅ FUNÇÃO PARA VERIFICAR AUTENTICAÇÃO E OBTER RESTAURANTE
const obterRestauranteDoToken = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Token de autorização não fornecido');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  let restauranteId = null;

  if (decoded.tipo === 'funcionario') {
    // ✅ BUSCAR RESTAURANTE DO FUNCIONÁRIO
    const { data: funcionario, error } = await supabase
      .from('funcionario')
      .select('restaurante')
      .eq('id_funcionario', decoded.id)
      .single();
    
    if (error) throw new Error('Funcionário não encontrado');
    restauranteId = funcionario.restaurante;
  } else if (decoded.tipo === 'restaurante') {
    // ✅ USAR ID DO PRÓPRIO RESTAURANTE
    restauranteId = decoded.id;
  } else {
    throw new Error('Tipo de usuário não suportado');
  }

  console.log('🏪 Restaurante identificado:', restauranteId, 'para usuário tipo:', decoded.tipo);
  return { userId: decoded.id, userType: decoded.tipo, restauranteId };
};

// ✅ LISTAR PEDIDOS FILTRADOS POR RESTAURANTE
export async function listarPedidos(req, res) {
  try {
    console.log('📋 === LISTANDO PEDIDOS ===');
    
    // ✅ OBTER RESTAURANTE DO TOKEN
    const { restauranteId } = await obterRestauranteDoToken(req);
    
    console.log('🏪 Filtrando pedidos do restaurante:', restauranteId);

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id_pedido,
        data_pedido,
        status,
        observacoes,
        mesa,
        total,
        restaurante,
        cliente:cliente(nome, telefone),
        funcionario:funcionario(nome),
        pedido_produtos(
          quantidade,
          preco_unitario,
          produto:produtos(nome, descricao)
        )
      `)
      .eq('restaurante', restauranteId) // ✅ FILTRAR POR RESTAURANTE
      .order('data_pedido', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar pedidos' 
      });
    }

    console.log(`✅ ${pedidos?.length || 0} pedidos encontrados para restaurante ${restauranteId}`);

    res.json({
      success: true,
      pedidos: pedidos || [],
      restaurante_id: restauranteId,
      total_pedidos: pedidos?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro na listagem de pedidos:', error);
    
    if (error.message.includes('Token') || error.message.includes('não encontrado')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Acesso não autorizado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// ✅ BUSCAR PEDIDO POR ID (TAMBÉM FILTRADO POR RESTAURANTE)
export async function buscarPedidoPorId(req, res) {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando pedido ID:', id);

    // ✅ OBTER RESTAURANTE DO TOKEN
    const { restauranteId } = await obterRestauranteDoToken(req);
    
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:cliente(nome, telefone, cpf),
        funcionario:funcionario(nome),
        pedido_produtos(
          quantidade,
          preco_unitario,
          produto:produtos(nome, descricao, preco)
        )
      `)
      .eq('id_pedido', id)
      .eq('restaurante', restauranteId) // ✅ FILTRAR POR RESTAURANTE
      .single();

    if (error || !pedido) {
      console.log('❌ Pedido não encontrado ou não pertence ao restaurante');
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    console.log('✅ Pedido encontrado:', pedido.id_pedido);

    res.json({
      success: true,
      pedido: pedido
    });

  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    
    if (error.message.includes('Token') || error.message.includes('não encontrado')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Acesso não autorizado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// ✅ CRIAR PEDIDO (AUTOMATICAMENTE ASSOCIA AO RESTAURANTE DO USUÁRIO)
export async function criarPedido(req, res) {
  const { cliente, funcionario, casa, itens, obs, total, restaurante } = req.body;

  if (!cliente || !funcionario || !casa || !itens || !restaurante) {
    return res.status(400).json({ error: "Campos obrigatórios não informados" });
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        cliente,
        funcionario_id: funcionario,
        casa,
        obs,
        total,
        restaurante_id: restaurante, // ✅ aqui salvando o id do restaurante
        itens
      }]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Pedido salvo com sucesso!", pedido: data[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
// ✅ ATUALIZAR STATUS DO PEDIDO
export async function atualizarStatusPedido(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 Atualizando status do pedido:', id, 'para:', status);

    // ✅ OBTER RESTAURANTE DO TOKEN
    const { restauranteId } = await obterRestauranteDoToken(req);

    const statusValidos = ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status inválido' 
      });
    }

    // ✅ ATUALIZAR APENAS SE PERTENCER AO RESTAURANTE
    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id_pedido', id)
      .eq('restaurante', restauranteId) // ✅ FILTRAR POR RESTAURANTE
      .select()
      .single();

    if (error || !pedidoAtualizado) {
      console.log('❌ Pedido não encontrado ou não pertence ao restaurante');
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    console.log('✅ Status do pedido atualizado:', pedidoAtualizado.id_pedido);

    res.json({
      success: true,
      message: 'Status atualizado com sucesso!',
      pedido: pedidoAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    
    if (error.message.includes('Token') || error.message.includes('não encontrado')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Acesso não autorizado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// ✅ RELATÓRIO DE PEDIDOS (FILTRADO POR RESTAURANTE)
export async function relatorioVendas(req, res) {
  try {
    const { data_inicio, data_fim } = req.query;
    console.log('📊 Gerando relatório de vendas...');

    // ✅ OBTER RESTAURANTE DO TOKEN
    const { restauranteId } = await obterRestauranteDoToken(req);

    let query = supabase
      .from('pedidos')
      .select(`
        id_pedido,
        data_pedido,
        status,
        total,
        mesa,
        cliente:cliente(nome)
      `)
      .eq('restaurante', restauranteId) // ✅ FILTRAR POR RESTAURANTE
      .order('data_pedido', { ascending: false });

    if (data_inicio) {
      query = query.gte('data_pedido', data_inicio);
    }
    
    if (data_fim) {
      query = query.lte('data_pedido', data_fim);
    }

    const { data: pedidos, error } = await query;

    if (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao gerar relatório' 
      });
    }

    // ✅ CALCULAR ESTATÍSTICAS
    const totalVendas = pedidos?.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0) || 0;
    const pedidosPorStatus = pedidos?.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {}) || {};

    console.log(`✅ Relatório gerado: ${pedidos?.length || 0} pedidos, Total: R$ ${totalVendas.toFixed(2)}`);

    res.json({
      success: true,
      restaurante_id: restauranteId,
      periodo: {
        data_inicio: data_inicio || 'Início',
        data_fim: data_fim || 'Hoje'
      },
      resumo: {
        total_pedidos: pedidos?.length || 0,
        total_vendas: totalVendas,
        pedidos_por_status: pedidosPorStatus
      },
      pedidos: pedidos || []
    });

  } catch (error) {
    console.error('❌ Erro no relatório:', error);
    
    if (error.message.includes('Token') || error.message.includes('não encontrado')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Acesso não autorizado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}