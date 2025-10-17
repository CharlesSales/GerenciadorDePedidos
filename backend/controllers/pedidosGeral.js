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
        restaurante: restauranteid
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

    // Notificação push para todos funcionários do restaurante, exceto quem fez o pedido
    try {
      // Busca todos funcionários do restaurante com expo_token
      const { data: funcionariosRestaurante } = await supabase
        .from("funcionario")
        .select("expo_token, id_funcionario")
        .eq("restaurante", restauranteid)
        .not("expo_token", "is", null);

      // Filtra para não notificar quem fez o pedido
    const tokens = (funcionariosRestaurante ?? [])
    .filter(f => f.id_funcionario !== novoPedido.funcionario)
    .map(f => f.expo_token);

      // Busca todos pedidos pendentes do restaurante
      const { data: pedidosPendentes } = await supabase
        .from("pedidos_geral")
        .select("nome_cliente, pedidos, detalhe")
        .eq("restaurante", restauranteid)
        .eq("status", "pendente")
        .order("data_hora", { ascending: true });

      // Monta mensagem com lista de pedidos
      const pedidosMsg = pedidosPendentes?.map(p =>
        `#${p.nome_cliente}: ${p.pedidos} ${p.detalhe ? " (" + p.detalhe + ")" : ""}`
      ).join("\n");

      const messages = tokens.map(token => ({
        to: token,
        sound: "default",
        title: "Novo pedido!",
        body: pedidosMsg || "Nenhum pedido pendente.",
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

export const atualizarStatusPedido = async (req, res) => {
  const { id } = req.params;
  const { status_id } = req.body;

  try {
    // Verifica se o status existe
    const { data: statusExiste, error: statusError } = await supabase
      .from('status')
      .select('id')
      .eq('id', status_id)
      .single();

    if (statusError || !statusExiste) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    // Atualiza o status do pedido
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status_id })
      .eq('id', id)
      .select(`
        id,
        cliente_id,
        status_pedidos (nome)
      `)
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Status do pedido atualizado com sucesso!',
      pedido: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar o status do pedido.' });
  }
};

// Listar todos os status disponíveis
export const listarStatusPedidos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('status')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar status de pedidos.' });
  }
};
