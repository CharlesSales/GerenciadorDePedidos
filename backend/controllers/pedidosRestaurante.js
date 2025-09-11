import { supabase } from "../supabaseClient.js"

// Rota para listar produtos
export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('data_hora', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total } = req.body;
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario: funcionario, // troque se no banco for "funcionario"
      casa,
      total
    }])
    .select(); // força retorno do registro inserido
  
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(500).json({ error: "Falha ao inserir pedido" });
  }

  res.json({ message: 'Pedido de almoço/petisco salvo!', pedido: data[0] });
};

export async function editarPedidos(req, res) {
  const { id } = req.params

  try {
    // Pega o pedido atual
    const { data: pedidoAtual, error: errorSelect } = await supabase
      .from('pedidos')
      .select('pag')
      .eq('id_pedido', id)
      .single()

    if (errorSelect || !pedidoAtual) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Alterna o status
    const novoStatus = pedidoAtual.pag === 'pago' ? 'não' : 'pago'

    // Atualiza o status no Supabase
    const { data, error } = await supabase
      .from('pedidos')
      .update({ pag: novoStatus })
      .eq('id_pedido', id)
      .select()

    if (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar status' })
    }

    res.json({ message: 'Status atualizado com sucesso!', pedido: data[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro inesperado ao atualizar status' })
  }
}