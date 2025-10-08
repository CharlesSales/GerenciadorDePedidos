import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

export async function listarPedidos(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    let restauranteId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.tipo === "funcionario") {
          // Funcionario: pegar id do restaurante dele
          const { data: funcionario } = await supabase
            .from("funcionario")
            .select("restaurante")
            .eq("id_funcionario", decoded.id)
            .single();

          restauranteId = funcionario?.restaurante;
        } else if (decoded.tipo === "restaurante") {
          // Restaurante: usar próprio id
          restauranteId = decoded.id;
        }
      } catch (err) {
        console.error("Token inválido:", err.message);
        return res.status(401).json({ error: "Token inválido" });
      }
    } else {
      return res.status(401).json({ error: "Token é obrigatório" });
    }

    // Buscar pedidos apenas do restaurante logado
    const { data: pedidos, error } = await supabase
      .from("pedidos_geral")
      .select("*")
      .eq("restaurante", restauranteId)
      .order("data_hora", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(pedidos);
  } catch (err) {
    console.error("Erro inesperado:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export const listarPedidosPorRestaurante = async (id_restaurante) => {
  try {
    // Se estiver usando Sequelize, Mongoose ou algum ORM
    const pedidos = await Pedido.find({ restaurante_id: id_restaurante });
    return pedidos;
  } catch (err) {
    throw new Error("Erro ao listar pedidos do restaurante: " + err.message);
  }
};


/*
export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from("pedidos_geral")
    .select("*")
    .order("data_hora", { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

*/
export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, itens, total, obs, restauranteid } = req.body;

  if (!restauranteid) {
    return res.status(400).json({ error: "ID do restaurante é obrigatório" });
  }

  try {
    const { data, error } = await supabase
      .from("pedidos_geral")
      .insert([{
        pedidos: JSON.stringify(itens),
        nome_cliente: cliente,
        funcionario,
        casa,
        detalhe: obs,
        total,
        restaurante: restauranteid // ✅ adiciona o id do restaurante
      }])
      .select();

    if (error) throw error;

    const novoPedido = data[0];

    // Emite Socket.IO
    try {
      io.emit("novoPedido_geral", novoPedido);
    } catch (err) {
      console.error("Falha no Socket.IO:", err.message);
    }

    // Notificação push
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

