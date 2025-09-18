import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket

export async function listarPedidos(req, res) {
  try {
    const { data, error } = await supabase
      .from("pedidos_geral")
      .select("*")

    if (error) return res.status(500).json({ error: error.message })

    const pedidosAlmoco = data.map(pedido => {
      let itens = [];
      try {
        if (typeof pedido.pedidos === "string" && pedido.pedidos) {
          itens = JSON.parse(pedido.pedidos);
        } else if (Array.isArray(pedido.pedidos)) {
          itens = pedido.pedidos;
        }
      } catch (e) {
        itens = [];
      }
      const itensAlmoco = Array.isArray(itens)
        ? itens.filter(item => item.cozinha === "almoço")
        : [];
      return {
        ...pedido,
        pedidos: itensAlmoco
      }
    }).filter(pedido => pedido.pedidos.length > 0);

    res.json(pedidosAlmoco)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao buscar pedidos de almoço" })
  }
}


export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total } = req.body
  const { data, error } = await supabase
    .from("pedidos")
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario,
      casa,
      total
    }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) {
    return res.status(500).json({ error: "Falha ao inserir pedido" })
  }

  const novoPedido = data[0]

  // 🚀 avisa todos os clientes conectados
  io.emit("novoPedido", novoPedido)

  res.json({ message: "Pedido salvo!", pedido: novoPedido })
}

export async function editarPedidos(req, res) {
  const { id } = req.params

  try {
    const { data: pedidoAtual, error: errorSelect } = await supabase
      .from("pedidos")
      .select("pag")
      .eq("id_pedido", id)
      .single()

    if (errorSelect || !pedidoAtual) {
      return res.status(404).json({ error: "Pedido não encontrado" })
    }

    const novoStatus = pedidoAtual.pag === "pago" ? "nao" : "pago"

    const { data, error } = await supabase
      .from("pedidos")
      .update({ pag: novoStatus })
      .eq("id_pedido", id)
      .select()

    if (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao atualizar status" })
    }

    res.json({ message: "Status atualizado com sucesso!", pedido: data[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro inesperado ao atualizar status" })
  }
}
