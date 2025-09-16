import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket

export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from("pedidos_geral")
    .select("*")
    .order("data_hora", { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total } = req.body
  const { data, error } = await supabase
    .from("pedidos_geral")
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
  io.emit("novoPedido_geral", novoPedido)

  res.json({ message: "Pedido salvo!", pedido: novoPedido })
}

export async function editarPedidos(req, res) {
  const { id } = req.params

  try {
    const { data: pedidoAtual, error: errorSelect } = await supabase
      .from("pedidos_geral")
      .select("pag")
      .eq("id_pedido", id)
      .single()

    if (errorSelect || !pedidoAtual) {
      return res.status(404).json({ error: "Pedido não encontrado" })
    }

    const novoStatus = pedidoAtual.pag === "pago" ? "nao" : "pago"

    const { data, error } = await supabase
      .from("pedidos_geral")
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