import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"
import jwt from "jsonwebtoken";

// Rota para listar produtos
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

    const { data, error } = await supabase
      .from("pedidos_geral")
      .select("*")
      .order("data_hora", { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    const pedidosAcaraje = data.map(pedido => {
      let itens = [];
      try {
        if (typeof pedido.pedidos === "string" && pedido.pedidos.trim()) {
          itens = JSON.parse(pedido.pedidos);
        } else if (Array.isArray(pedido.pedidos)) {
          itens = pedido.pedidos;
        }
      } catch (e) {
        itens = [];
      }
      // Garante que itens seja sempre array
      if (!Array.isArray(itens)) itens = [];
      const itensAcaraje = itens.filter(item => item && item.cozinha === "acaraje");

      const totalAcaraje = itensAcaraje.reduce((acc, item) => {
        return acc + (item.preco * item.quantidade);
      }, 0);
      return {
          ...pedido,
        pedidos: itensAcaraje,
        total: totalAcaraje, // Substitui o total original pelo total de acarajé
        total_original: pedido.total // Mantém o total original se precisar
      }
    }).filter(pedido => Array.isArray(pedido.pedidos) && pedido.pedidos.length > 0);

    res.json(pedidosAcaraje)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao buscar pedidos de almoço" })
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
      .from('pedidos_geral')
      .select('pag')
      .eq('id_pedido', id)
      .single();

    if (errorSelect || !pedidoAtual) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const novoStatus = pedidoAtual.pag === 'pago' ? 'não' : 'pago';

    const { data, error } = await supabase
      .from('pedidos_geral')
      .update({ pag: novoStatus })
      .eq('id_pedido', id)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }

    io.emit("statusAtualizado", { id, novoStatus })

    res.json({ message: 'Status atualizado com sucesso!', pedido: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro inesperado' });
  }
  
};
