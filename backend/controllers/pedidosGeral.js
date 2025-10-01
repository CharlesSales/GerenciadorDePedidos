import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket
import fetch from "node-fetch";

export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from("pedidos_geral")
    .select("*")
    .order("data_hora", { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}


export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total, obs } = req.body;

  try {
    const { data, error } = await supabase
      .from("pedidos_geral")
      .insert([{
        pedidos: JSON.stringify(itens),
        nome_cliente: cliente,
        funcionario,
        casa,
        detalhe: obs,
        total
      }])
      .select();

    if (error) throw error;

    const novoPedido = data[0];

    // Emite Socket.IO, mas captura erro
    try {
      io.emit("novoPedido_geral", novoPedido);
    } catch (err) {
      console.error("Falha no Socket.IO:", err.message);
    }

    // Notificação push – captura erro sem quebrar
    try {
      const { data: admins } = await supabase
        .from("usuarios")
        .select("expo_token")
        .not("expo_token", "is", null);

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
    } catch (err) {
      console.error("Falha na notificação push:", err.message);
    }

    // Retorna JSON ao frontend
    return res.status(200).json({ message: "Pedido salvo com sucesso!", pedido: novoPedido });

  } catch (err) {
    console.error("Erro ao cadastrar pedido:", err.message);
    return res.status(500).json({ error: "Erro interno ao cadastrar pedido" });
  }
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

