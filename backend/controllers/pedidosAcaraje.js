import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"

// Rota para listar produtos
export async function listarPedidos(req, res) {
  try {
    const { data, error } = await supabase
      .from("pedidos_geral")
      .select("*")

    if (error) return res.status(500).json({ error: error.message })

    const pedidosAcaraje = data.map(pedido => {
      let itens = []

      try {
        if (typeof pedido.pedidos === "string" && pedido.pedidos.trim()) {
          itens = JSON.parse(pedido.pedidos)
        } else if (Array.isArray(pedido.pedidos)) {
          itens = pedido.pedidos
        }
      } catch (e) {
        itens = []
      }
      if (!Array.isArray(itens)) itens = []
      const itensAcaraje = itens.filter(item => item && item.cozinha === "acaraje")

      return {
        ...pedido,
        pedidos: itensAcaraje
      }
    }).filter(pedido => Array.isArray(pedido.pedidos) && pedido.pedidos.length > 0)

    res.json(pedidosAcaraje)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao buscar pedidos de acarajé" })
  }
}


export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total } = req.body;
  const { data, error } = await supabase
    .from('pedidos_acaraje')
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario: funcionario, // troque se no banco for "funcionario"
      casa,
      total
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'funcionario cadastrado com sucesso!', produto: data[0] });

  const novoPedido = data[0]

  // 🚀 avisa todos os clientes conectados
  io.emit("novoPedido_acaraje", novoPedido)

  res.json({ message: "Pedido salvo!", pedido: novoPedido })
};

export async function editarPedidos(req, res) {
  const { id } = req.params;

  try {
    const { data: pedidoAtual, error: errorSelect } = await supabase
      .from('pedidos_acaraje')
      .select('pag')
      .eq('id_pedido', id)
      .single();

    if (errorSelect || !pedidoAtual) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const novoStatus = pedidoAtual.pag === 'pago' ? 'não' : 'pago';

    const { data, error } = await supabase
      .from('pedidos_acaraje')
      .update({ pag: novoStatus })
      .eq('id_pedido', id)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }

    res.json({ message: 'Status atualizado com sucesso!', pedido: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro inesperado' });
  }
  
};
