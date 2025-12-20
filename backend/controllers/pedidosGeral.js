import { supabase } from "../supabaseClient.js"
import { io } from "../server.js"   // 👈 importa o socket
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import ZApiService from "../service/zapiService.js";
import MensagemPedidoService from "../service/mensagemPedidoService.js";
import { error } from "console";
import { json } from "stream/consumers";


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
      .select(`
          *,
          funcionario:funcionario (
            id_funcionario,
            nome
          )
        `)
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


export async function cadastrarPedidos(req, res) {
  const { cliente, funcionario, casa, mesa, itens, total, obs, restauranteid } = req.body;

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
        mesa,
        detalhe: obs,
        total,
        restaurante: restauranteid
      }])
      .select();

    if (error) throw error;

    const novoPedido = data[0];

    const { data: restauranteData } = await supabase
      .from("restaurante")
      .select("nome_restaurante, telefone_whatsapp, notificacao_whatsapp")
      .eq("id_restaurante", restauranteid)
      .single();

    // Emite Socket.IO
    try {
      io.emit("novoPedido_geral", novoPedido);
    } catch (err) {
      console.error("Falha no Socket.IO:", err.message);
    }

    // ✅ ENVIAR WHATSAPP PARA O RESTAURANTE (SEM FILTRO)
    if (restauranteData?.telefone_whatsapp && restauranteData?.notificacao_whatsapp) {
      try {
        console.log('📤 Enviando WhatsApp para restaurante:', restauranteData.nome_restaurante);

        const mensagem = MensagemPedidoService.formatarPedidoCompleto(
          novoPedido,
          restauranteData
        );

        const resultadoWhatsApp = await ZApiService.enviarMensagem(
          restauranteData.telefone_whatsapp,
          mensagem
        );

        console.log('✅ WhatsApp enviado com sucesso para:', restauranteData.telefone_whatsapp);
        console.log('📱 Resultado Z-API:', resultadoWhatsApp);

      } catch (whatsappError) {
        console.error('❌ Erro ao enviar WhatsApp:', whatsappError);
        // Não falha o pedido se WhatsApp der erro
      }
    } else {
      console.log('⚠️ WhatsApp não configurado para restaurante:', restauranteData?.nome_restaurante);
      console.log('📱 Telefone:', restauranteData?.telefone_whatsapp);
      console.log('🔔 Notificação ativa:', restauranteData?.notificacao_whatsapp);
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

// aqui termina
export async function cadastrarPedidosCliente(req, res) {
  const { mesa, cliente, casa, itens, total, obs, opcaoRetirada, restauranteid } = req.body;

  const mesaInt = mesa && mesa !== "" ? parseInt(mesa) : null;

  console.log("BODY RECEBIDO COMPLETO:", req.body);

  if (!restauranteid) {
    return res.status(400).json({ error: "ID do restaurante é obrigatório" });
  }

  try {
    const { data, error } = await supabase
      .from("pedidos_geral")
      .insert([{
        pedidos: JSON.stringify(itens),
        nome_cliente: cliente,
        mesa: mesaInt,
        casa,
        detalhe: obs,
        total,
        retirada: opcaoRetirada && opcaoRetirada !== '' && opcaoRetirada !== 'null'
          ? parseInt(opcaoRetirada)
          : null, // ✅ CONVERTER PARA INT OU NULL
        restaurante: parseInt(restauranteid), // ✅ CONVERTER PARA INT

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

export async function cadastrarPedidosQRcode(req, res) {
  const { cliente, itens, obs, total, restauranteid, id_mesa } = req.body;

  if (!cliente, !itens, !total, !restauranteid, !id_mesa) {
    return res.status(404).json({
      msg: "Os campos são obrigatorio"
    })
  }

  const { data: resposta, error: err } = await supabase
    .from("pedidos_geral")
    .insert({
      pedidos: JSON.stringify(itens), // ✅ MANTER COMPATIBILIDADE
      nome_cliente: cliente,
      detalhe: obs || '',
      total: Number(total) || 0,
      restaurante: restauranteid,
      mesa: id_mesa,
      funcionario: 17, // ✅ ID funcionário padrão para pedidos externos
    })

  if (err) {
    res.status(402).json({
      error: err.message
    })
  }

  try {
    console.log('📡 Emitindo Socket.IO...');

    const dadosCompletos = {
      ...pedidoData,
      restaurante: Number(restauranteid),
      endereco_completo: enderecoData, // ✅ ENDEREÇO COMPLETO
      itens_detalhados: itensData,     // ✅ ITENS DETALHADOS
      restaurante: restauranteid,
      tipo: 'delivery' // ✅ IDENTIFICAR TIPO
    };

    io.emit("novo_pedido", dadosCompletos);

    console.log('✅ Socket.IO emitido com sucesso');
  } catch (socketError) {
    console.error("❌ Erro no Socket.IO:", socketError.message);
  }


}
export async function cadastrarPedidosDelivery(req, res) {
  const {
    cliente,
    logradouro,
    numero,
    bairro,
    cidade,
    complemento,
    referencia,
    itens,
    obs,
    total,
    restauranteid,
  } = req.body;

  console.log('📦 Dados recebidos para delivery:', {
    cliente, logradouro, numero, bairro, cidade, complemento,
    referencia, itens: itens?.length, obs, total, restauranteid
  });

  if (!restauranteid) {
    return res.status(400).json({ error: "ID do restaurante é obrigatório" });
  }

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "Itens do pedido são obrigatórios" });
  }

  if (!cliente || !logradouro || !numero || !bairro || !cidade) {
    return res.status(400).json({ error: "Dados de endereço são obrigatórios" });
  }

  try {
    // 1️⃣ SALVAR ENDEREÇO
    console.log('📍 Salvando endereço...');
    const { data: enderecoData, error: enderecoError } = await supabase
      .from("endereco")
      .insert([{
        logradouro: logradouro || '',
        numero: numero || '',
        bairro: bairro || '',
        cidade: cidade || '',
        complemento: complemento || '',
        referencia: referencia || ''
      }])
      .select()
      .single();

    if (enderecoError) {
      console.error('❌ Erro ao salvar endereço:', enderecoError);
      throw enderecoError;
    }

    const enderecoId = enderecoData.id_endereco;
    console.log('✅ Endereço salvo com ID:', enderecoId);

    // 2️⃣ SALVAR PEDIDO PRINCIPAL COM ENDEREÇO VINCULADO
    console.log('📝 Salvando pedido principal...');

    // ✅ CRIAR ENDEREÇO RESUMIDO PARA O CAMPO 'casa'
    const enderecoResumo = `${logradouro}, ${numero} - ${bairro}, ${cidade}`;

    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedidos_geral")
      .insert([{
        pedidos: JSON.stringify(itens), // ✅ MANTER COMPATIBILIDADE
        nome_cliente: cliente,
        detalhe: obs || '',
        total: Number(total) || 0,
        status: 1, // ✅ STATUS INICIAL (ID do status)
        data_hora: new Date().toISOString(),
        restaurante: restauranteid,
        funcionario: 17, // ✅ ID funcionário padrão para pedidos externos
        casa: enderecoResumo, // ✅ ENDEREÇO RESUMIDO NO CAMPO EXISTENTE
        id_endereco: enderecoData.id_endereco,
        pag: 'nao' // ✅ STATUS DE PAGAMENTO INICIAL
      }])
      .select()
      .single();

    if (pedidoError) {
      console.error('❌ Erro ao salvar pedido:', pedidoError);
      throw pedidoError;
    }

    const pedidoId = pedidoData.id_pedido;
    console.log('✅ Pedido salvo com ID:', pedidoId);

    // 3️⃣ SALVAR ITENS DO PEDIDO
    console.log('📦 Salvando itens do pedido...');
    const itensFormatados = itens.map((item) => ({
      id_pedido: pedidoId, // ✅ CAMPO CORRETO
      id_produto: item.produto_id || item.id_produto, // ✅ FLEXIBILIDADE
      quantidade: Number(item.quantidade) || 1,
      preco_unitario: Number(item.preco) || 0,
      observacao: item.observacao || obs || 'sem observacao'
    }));

    console.log('📦 Itens formatados:', itensFormatados);

    const { data: itensData, error: itensError } = await supabase
      .from("pedido_item") // ✅ TABELA CORRETA
      .insert(itensFormatados)
      .select();

    if (itensError) {
      console.error('❌ Erro ao salvar itens:', itensError);
      throw itensError;
    }

    console.log('✅ Itens salvos:', itensData?.length);

    // 4️⃣ BUSCAR DADOS DO RESTAURANTE
    const { data: restauranteData } = await supabase
      .from("restaurante")
      .select("nome_restaurante, telefone_whatsapp, notificacao_whatsapp")
      .eq("id_restaurante", restauranteid)
      .single();

    // 5️⃣ EMITIR SOCKET.IO COM DADOS COMPLETOS
    try {
      console.log('📡 Emitindo Socket.IO...');

      const dadosCompletos = {
        ...pedidoData,
        restaurante: Number(restauranteid),
        endereco_completo: enderecoData, // ✅ ENDEREÇO COMPLETO
        itens_detalhados: itensData,     // ✅ ITENS DETALHADOS
        restaurante_nome: restauranteData?.nome_restaurante,
        tipo: 'delivery' // ✅ IDENTIFICAR TIPO
      };

      io.emit("novo_pedido", dadosCompletos);

      console.log('✅ Socket.IO emitido com sucesso');
    } catch (socketError) {
      console.error("❌ Erro no Socket.IO:", socketError.message);
    }

    // 6️⃣ ENVIAR WHATSAPP PARA O RESTAURANTE
    // if (restauranteData?.telefone_whatsapp && restauranteData?.notificacao_whatsapp) {
    //   try {
    //     console.log('📱 Enviando WhatsApp...');

    //     const itensTexto = itens.map(item => 
    //       `${item.quantidade}x ${item.nome} - R$ ${Number(item.preco).toFixed(2)}`
    //     ).join('\n');

    //     const mensagem = `🚚 *NOVO PEDIDO DELIVERY* #${pedidoId}\n\n` +
    //       `👤 Cliente: ${cliente}\n` +
    //       `📍 Endereço: ${enderecoResumo}\n` +
    //       `${complemento ? `🏠 Complemento: ${complemento}\n` : ''}` +
    //       `${referencia ? `📍 Referência: ${referencia}\n` : ''}` +
    //       `💰 Total: R$ ${Number(total).toFixed(2)}\n\n` +
    //       `📦 Itens:\n${itensTexto}\n\n` +
    //       `${obs ? `📝 Observações: ${obs}\n\n` : ''}` +
    //       `🕐 ${new Date().toLocaleString('pt-BR')}\n\n` +
    //       `⚡ *DELIVERY - ENTREGAR NO ENDEREÇO ACIMA*`;

    // await ZApiService.enviarMensagem(
    //   restauranteData.telefone_whatsapp,
    //   mensagem
    // );

    //     console.log('✅ WhatsApp enviado com sucesso');
    //   } catch (whatsappError) {
    //     console.error('❌ Erro ao enviar WhatsApp:', whatsappError);
    //     // Não falha o pedido se WhatsApp der erro
    //   }
    // }

    // 7️⃣ NOTIFICAÇÃO PUSH
    try {
      const { data: funcionariosRestaurante } = await supabase
        .from("funcionario")
        .select("expo_token, id_funcionario")
        .eq("restaurante", restauranteid)
        .not("expo_token", "is", null);

      const tokens = (funcionariosRestaurante ?? []).map(f => f.expo_token);

      const messages = tokens.map(token => ({
        to: token,
        sound: "default",
        title: "🚚 Novo Pedido Delivery!",
        body: `${cliente} - ${enderecoResumo} - R$ ${Number(total).toFixed(2)}`,
        data: {
          pedidoId: pedidoId,
          tipo: 'delivery',
          endereco: enderecoResumo,
          enderecoId: enderecoId
        }
      }));

      if (messages.length > 0) {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messages)
        });
        console.log('✅ Notificações push enviadas');
      }
    } catch (pushError) {
      console.error("❌ Erro na notificação push:", pushError.message);
    }

    return res.status(200).json({
      message: "Pedido de delivery cadastrado com sucesso!",
      pedido: pedidoData,
      endereco: enderecoData,
      itens: itensData,
      enderecoId: enderecoId // ✅ RETORNAR ID DO ENDEREÇO
    });

  } catch (err) {
    console.error("❌ Erro ao cadastrar pedido delivery:", err);
    return res.status(500).json({
      error: "Erro interno ao cadastrar pedido",
      details: err.message
    });
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

    try {
      io.emit("pagamentoAtualizado", {
        id: Number(id),
        novoStatusPagamento: novoStatus,
        pedido: data[0]
      });
      console.log("✅ Socket.IO pagamento emitido");
    } catch (err) {
      console.error("❌ Erro no Socket.IO:", err.message);
    }

    res.json({ message: "Status de pagamento atualizado com sucesso!", pedido: data[0] })

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
      .from('pedidos_geral') // CORRIGIDO
      .update({ status: status_id }) // se no `pedidos_geral` o campo é `status`
      .eq('id_pedido', id) // id correto
      .select()
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


export async function statusPagamento(req, res) {
  try {
    const { id_pedido } = req.params;

    if (!id_pedido) {
      return res.status(400).json({
        msg: "Não encontramos o id"
      })
    }

    const { data, error } = await supabase
      .from('pedidos_geral')
      .select('pag')
      .eq('id_pedido', id_pedido)

    if (error) {
      return res.status(404).json({
        msg: `Erro ao buscar status de pagamento do pedido ${id_pedido}`
      })
    }

    return res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}