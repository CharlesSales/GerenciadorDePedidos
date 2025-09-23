import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket
import fetch from "node-fetch"; // ou axios

export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from("pedidos_geral")
    .select("*")
    .order("data_hora", { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total } = req.body;
  const { data, error } = await supabase
    .from("pedidos_geral")
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario,
      casa,
      total
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  const novoPedido = data[0];

  // 🚀 Notifica todos os clientes conectados via Socket.IO
  io.emit("novoPedido_geral", novoPedido);

  // 🔔 Notificação push via Expo para admins
  const { data: admins } = await supabase
    .from("usuarios")
    .select("expo_token")
    .not("expo_token", "is", null); // pega todos que têm token

  const messages = admins.map(a => ({
    to: a.expo_token,
    sound: "default",
    title: "Novo pedido!",
    body: `Pedido de ${cliente} no valor de R$ ${total}`,
    data: { pedidoId: novoPedido.id_pedido }
  }));

  if (messages.length > 0) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages)
    });
  }

  res.json({ message: "Pedido salvo e notificação enviada!", pedido: novoPedido });
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

    io.emit("statusAtualizado", { id, novoStatus })

    res.json({ message: "Status atualizado com sucesso!", pedido: data[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro inesperado ao atualizar status" })
  }
}

