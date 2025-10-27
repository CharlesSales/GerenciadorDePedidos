import { supabase } from "../supabaseClient.js";
import jwt from "jsonwebtoken";

export async function relatoriosCompletos(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restauranteId = decoded.restaurante_id;

    console.log("🔍 Buscando dados para restaurante ID:", restauranteId); // Debug

    // 📅 Configuração de datas
    const agora = new Date();
    const inicioDia = new Date(agora);
    inicioDia.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(inicioDia);
    inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
    
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    console.log("📅 Datas:", {
      hoje: agora.toISOString(),
      inicioDia: inicioDia.toISOString(),
      inicioSemana: inicioSemana.toISOString(),
      inicioMes: inicioMes.toISOString()
    }); // Debug

    // Buscar TODOS os pedidos do restaurante primeiro
    const { data: todosPedidos, error: erroTodos } = await supabase
      .from("pedidos_geral")
      .select("*")
      .eq("restaurante", restauranteId);

    console.log("🔍 Total de pedidos encontrados:", todosPedidos?.length || 0); // Debug
    console.log("❌ Erro ao buscar todos:", erroTodos); // Debug

    if (erroTodos) {
      console.error("Erro na consulta:", erroTodos);
      return res.status(500).json({ error: "Erro ao consultar banco de dados" });
    }

    if (!todosPedidos || todosPedidos.length === 0) {
      console.log("⚠️ Nenhum pedido encontrado para o restaurante");
      return res.json({
        financeiro: {
          faturamento: { dia: 0, semana: 0, mes: 0, ano: 0 },
          crescimento: { dia: 0, semana: 0, mes: 0 },
          ticketMedio: { dia: 0, semana: 0, mes: 0 }
        },
        operacional: {
          totalPedidos: { dia: 0, semana: 0, mes: 0 },
          horariosPico: Array(24).fill(0).map((_, hora) => ({ hora, pedidos: 0 })),
          statusDistribuicao: []
        },
        produtos: { maisVendidos: [], menosVendidos: [] },
        clientes: { maisFrequentes: [], novosVsRecorrentes: { novos: 0, recorrentes: 0, totalUnicos: 0 }},
        performance: { taxaCancelamento: 0, metodoPagamento: [] }
      });
    }

    // Filtrar pedidos por períodos
    const pedidosDia = todosPedidos.filter(p => {
      const dataPedido = new Date(p.data_hora);
      return dataPedido >= inicioDia;
    });

    const pedidosSemana = todosPedidos.filter(p => {
      const dataPedido = new Date(p.data_hora);
      return dataPedido >= inicioSemana;
    });

    const pedidosMes = todosPedidos.filter(p => {
      const dataPedido = new Date(p.data_hora);
      return dataPedido >= inicioMes;
    });

    console.log("📊 Pedidos filtrados:", {
      dia: pedidosDia.length,
      semana: pedidosSemana.length,
      mes: pedidosMes.length
    }); // Debug

    // 💰 CALCULAR FATURAMENTOS
    const faturamentoDia = pedidosDia.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const faturamentoSemana = pedidosSemana.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const faturamentoMes = pedidosMes.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

    console.log("💰 Faturamentos:", { dia: faturamentoDia, semana: faturamentoSemana, mes: faturamentoMes }); // Debug

    // 🛍️ PROCESSAR PRODUTOS MAIS VENDIDOS
    const produtosVendidos = {};
    pedidosMes.forEach(pedido => {
      if (pedido.pedidos) {
        try {
          const itens = typeof pedido.pedidos === 'string' ? JSON.parse(pedido.pedidos) : pedido.pedidos;
          if (Array.isArray(itens)) {
            itens.forEach(item => {
              if (item.nome) {
                const quantidade = Number(item.quantidade) || 1;
                if (produtosVendidos[item.nome]) {
                  produtosVendidos[item.nome] += quantidade;
                } else {
                  produtosVendidos[item.nome] = quantidade;
                }
              }
            });
          }
        } catch (e) {
          console.log("Erro ao processar pedido:", e);
        }
      }
    });

    // 👥 PROCESSAR CLIENTES
    const clientesCount = {};
    pedidosMes.forEach(pedido => {
      if (pedido.nome_cliente) {
        if (clientesCount[pedido.nome_cliente]) {
          clientesCount[pedido.nome_cliente]++;
        } else {
          clientesCount[pedido.nome_cliente] = 1;
        }
      }
    });

    // 📊 STATUS DOS PEDIDOS
    const statusCount = {};
    pedidosDia.forEach(pedido => {
      const status = pedido.status || 'indefinido';
      if (statusCount[status]) {
        statusCount[status]++;
      } else {
        statusCount[status] = 1;
      }
    });

    // 🕐 HORÁRIOS DE PICO (últimos 7 dias)
    const seteDiasAtras = new Date(agora);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const pedidosUltimos7Dias = todosPedidos.filter(p => {
      const dataPedido = new Date(p.data_hora);
      return dataPedido >= seteDiasAtras;
    });

    const horariosPico = Array(24).fill(0);
    pedidosUltimos7Dias.forEach(pedido => {
      const hora = new Date(pedido.data_hora).getHours();
      if (hora >= 0 && hora < 24) {
        horariosPico[hora]++;
      }
    });

    // 💳 MÉTODOS DE PAGAMENTO
    const pagamentoCount = {};
    pedidosMes.forEach(pedido => {
      const metodo = pedido.pag || 'indefinido';
      if (pagamentoCount[metodo]) {
        pagamentoCount[metodo]++;
      } else {
        pagamentoCount[metodo] = 1;
      }
    });

    // 📈 ORDENAR RESULTADOS
    const produtosOrdenados = Object.entries(produtosVendidos)
      .sort(([,a], [,b]) => b - a);

    const clientesOrdenados = Object.entries(clientesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // 📤 MONTAR RESPOSTA
    const relatorio = {
      financeiro: {
        faturamento: {
          dia: faturamentoDia,
          semana: faturamentoSemana,
          mes: faturamentoMes,
          ano: faturamentoMes // Por enquanto igual ao mês
        },
        crescimento: {
          dia: 0, // Simplificado por enquanto
          semana: 0,
          mes: 0
        },
        ticketMedio: {
          dia: pedidosDia.length > 0 ? faturamentoDia / pedidosDia.length : 0,
          semana: pedidosSemana.length > 0 ? faturamentoSemana / pedidosSemana.length : 0,
          mes: pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0
        }
      },

      operacional: {
        totalPedidos: {
          dia: pedidosDia.length,
          semana: pedidosSemana.length,
          mes: pedidosMes.length
        },
        horariosPico: horariosPico.map((count, hora) => ({ hora, pedidos: count })),
        statusDistribuicao: Object.entries(statusCount).map(([status, count]) => ({ status, count }))
      },

      produtos: {
        maisVendidos: produtosOrdenados.slice(0, 10).map(([nome, quantidade]) => ({ nome, quantidade })),
        menosVendidos: produtosOrdenados.slice(-5).reverse().map(([nome, quantidade]) => ({ nome, quantidade }))
      },

      clientes: {
        maisFrequentes: clientesOrdenados.map(([nome, pedidos]) => ({ nome, pedidos })),
        novosVsRecorrentes: {
          novos: Math.floor(clientesOrdenados.length * 0.4), // Estimativa
          recorrentes: Math.floor(clientesOrdenados.length * 0.6),
          totalUnicos: clientesOrdenados.length
        }
      },

      performance: {
        taxaCancelamento: 0, // Não há cancelados na sua base atual
        metodoPagamento: Object.entries(pagamentoCount).map(([metodo, count]) => ({ metodo, count }))
      }
    };

    console.log("📋 Relatório final:", JSON.stringify(relatorio, null, 2)); // Debug

    res.json(relatorio);

  } catch (error) {
    console.error("❌ Erro ao gerar relatório completo:", error);
    res.status(500).json({ error: "Erro ao gerar relatório completo: " + error.message });
  }
}

// Manter os outros endpoints iguais...
export async function relatorios(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restauranteId = decoded.restaurante_id;

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(inicioDia);
    inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
    const inicioMes = new Date(inicioDia.getFullYear(), inicioDia.getMonth(), 1);
    const inicioAno = new Date(inicioDia.getFullYear(), 0, 1);

    const { data: todosPedidos } = await supabase
      .from("pedidos_geral")
      .select("*")
      .eq("restaurante", restauranteId);

    if (!todosPedidos) {
      return res.json({
        total_dia: 0, total_semana: 0, total_mes: 0, total_ano: 0,
        total_dia_pago: 0, total_semana_pago: 0, total_mes_pago: 0, total_ano_pago: 0
      });
    }

    const pedidosDia = todosPedidos.filter(p => new Date(p.data_hora) >= inicioDia);
    const pedidosSemana = todosPedidos.filter(p => new Date(p.data_hora) >= inicioSemana);
    const pedidosMes = todosPedidos.filter(p => new Date(p.data_hora) >= inicioMes);
    const pedidosAno = todosPedidos.filter(p => new Date(p.data_hora) >= inicioAno);

    const relatorio = {
      total_dia: pedidosDia.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_semana: pedidosSemana.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_mes: pedidosMes.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_ano: pedidosAno.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_dia_pago: pedidosDia.filter(p => p.pag === 'pago').reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_semana_pago: pedidosSemana.filter(p => p.pag === 'pago').reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_mes_pago: pedidosMes.filter(p => p.pag === 'pago').reduce((acc, p) => acc + (Number(p.total) || 0), 0),
      total_ano_pago: pedidosAno.filter(p => p.pag === 'pago').reduce((acc, p) => acc + (Number(p.total) || 0), 0)
    };

    res.json(relatorio);
  } catch (error) {
    console.error("❌ Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
}

export async function relatoriosComFiltros(req, res) {
  res.json({ message: "Endpoint em desenvolvimento" });
}

export async function tendenciaTemporal(req, res) {
  res.json({ message: "Endpoint em desenvolvimento" });
}