'use client';
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import HeaderPedidos from "@/components/ListaPedidos";
import PedidoCard from "@/components/PedidoCard";

export default function PedidosPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroData, setFiltroData] = useState(() => new Date().toISOString().slice(0, 10));
  const [filtroPeriodo, setFiltroPeriodo] = useState('dia');
  const [filtroPagamento, setFiltroPagamento] = useState('todos');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const statusOrdem = [
    { id: 1, status_pedido: 'Pedido feito' },
    { id: 2, status_pedido: 'preparando' },
    { id: 3, status_pedido: 'pronto' },
    { id: 4, status_pedido: 'a caminho' },
    { id: 5, status_pedido: 'entregue' },
  ];

  const formatarData = (dataHora) => {
    if (!dataHora) return "Sem data";
    const data = new Date(dataHora);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleString("pt-br", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pedido feito': return '#FFE4B5';
      case 'preparando': return '#FFB6C1';
      case 'pronto': return '#98FB98';
      case 'a caminho': return '#87CEEB';
      case 'entregue': return '#D3D3D3';
      default: return '#F0F0F0';
    }
  };

  const gerarNumeroPedido = (pedido, pedidosDoDia) => {
    const pedidosDoMesmoDia = pedidosDoDia.filter(p => {
      if (!p.data_hora || !pedido.data_hora) return false;
      return new Date(p.data_hora).toISOString().slice(0, 10) === new Date(pedido.data_hora).toISOString().slice(0, 10);
    });
    pedidosDoMesmoDia.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
    const posicao = pedidosDoMesmoDia.findIndex(p => p.id_pedido === pedido.id_pedido);
    return String(posicao + 1).padStart(3, '0');
  };

  // ✅ FUNÇÃO PARA FILTRAR POR PERÍODO
  const filtrarPorPeriodo = (pedidos, periodo) => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    switch (periodo) {
      case 'dia':
        return pedidos.filter(pedido => {
          if (!pedido.data_hora) return false;
          const dataPedido = new Date(pedido.data_hora);
          return dataPedido >= inicioHoje;
        });

      case 'semana':
        const inicioSemana = new Date(inicioHoje);
        inicioSemana.setDate(inicioHoje.getDate() - inicioHoje.getDay());
        return pedidos.filter(pedido => {
          if (!pedido.data_hora) return false;
          const dataPedido = new Date(pedido.data_hora);
          return dataPedido >= inicioSemana;
        });

      case 'mes':
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return pedidos.filter(pedido => {
          if (!pedido.data_hora) return false;
          const dataPedido = new Date(pedido.data_hora);
          return dataPedido >= inicioMes;
        });

      case 'todos':
        return pedidos;

      default:
        return pedidos;
    }
  };

  // ✅ APLICAR FILTROS COMBINADOS (PERÍODO + DATA + PAGAMENTO)
  const pedidosFiltrados = (() => {
    let resultado = pedidos;

    // 1. Primeiro aplicar filtro por período
    resultado = filtrarPorPeriodo(resultado, filtroPeriodo);

    // 2. Depois aplicar filtro por data específica (se não for "todos")
    if (filtroPagamento !== 'todos') {
      resultado = resultado.filter(pedido => {
        if (!pedido) return false;
        return pedido.pag === filtroPagamento;
      });
    }

    // 3. FILTRO DE PAGAMENTO (STRING)
    if (filtroPagamento !== 'todos') {
      resultado = resultado.filter(pedido => {
        return pedido.pag === filtroPagamento;
      });
    }


    return resultado;
  })();



  // ✅ FUNÇÃO PARA CONTAR PEDIDOS POR STATUS DE PAGAMENTO
  const contarPorPagamento = () => {
    const todos = pedidos.length;
    const pagos = pedidos.filter(p => p?.pag === 'pago').length;
    const pendentes = pedidos.filter(p => p?.pag !== 'pago').length;

    return { todos, pagos, pendentes };
  };


  const { todos, pagos, pendentes } = contarPorPagamento();

  useEffect(() => {
    if (authLoading || !user || !token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    // 1️⃣ Função para buscar pedidos iniciais
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_URL}/pedidosGeral/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        setErro("Não foi possível carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();

    // 2️⃣ Ouvinte para pedidos de FUNCIONÁRIOS (Interno)
    socket.on("novoPedido_geral", (pedido) => {
      console.log("🛎️ Pedido Interno recebido:", pedido);

      const idRestauranteUser = Number(user?.dados?.restaurante?.id_restaurante);
      const idRestaurantePedido = Number(pedido.restaurante);

      if (idRestaurantePedido !== idRestauranteUser) return;

      setPedidos(prev => {
        if (prev.some(p => p.id_pedido === pedido.id_pedido)) return prev;
        return [pedido, ...prev];
      });
    });

    // 3️⃣ Ouvinte para pedidos de DELIVERY (Externo)
    socket.on("novo_pedido", (dadosSocket) => {
      console.log("🛵 Pedido Delivery recebido:", dadosSocket);

      const idRestauranteUser = Number(user?.dados?.restaurante?.id_restaurante);
      const idRestaurantePedido = Number(dadosSocket.restaurante);

      if (idRestaurantePedido !== idRestauranteUser) {
        console.log(`❌ Ignorado: ID Pedido (${idRestaurantePedido}) != ID User (${idRestauranteUser})`);
        return;
      }

      setPedidos(prev => {
        if (prev.some(p => p.id_pedido === dadosSocket.id_pedido)) return prev;
        return [dadosSocket, ...prev];
      });
    });

    socket.on("statusAtualizado", ({ id, novoStatus }) => {
      setPedidos(prev =>
        prev.map(p =>
          p.id_pedido === Number(id)
            ? { ...p, status: novoStatus }
            : p
        )
      );
    });

    return () => {
      socket.off("novoPedido_geral");
      socket.off("novo_pedido");
      socket.off("statusAtualizado");
      socket.disconnect();
    };

  }, [API_URL, user, token]);

  async function handleChangepaymentstatus(id) {
    try {
      const response = await fetch(`${API_URL}/pedidosGeral/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error('Erro ao atualizar status:', await response.text());
        return;
      }
      const result = await response.json();
      setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, pag: result.pedido.pag } : p));
    } catch (err) { console.error('Erro inesperado:', err); }
  }

  async function handleChangeStatus(id, statusAtual) {
    try {
      const indiceAtual = statusOrdem.findIndex(s => s.status_pedido === statusAtual);
      const proximoStatus = indiceAtual < statusOrdem.length - 1
        ? statusOrdem[indiceAtual + 1]
        : statusOrdem[indiceAtual];

      const response = await fetch(`${API_URL}/pedidosGeral/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status_id: proximoStatus.id })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Erro ao atualizar status:', text);
        return;
      }

      setPedidos(prev =>
        prev.map(p =>
          p.id_pedido === id ? { ...p, status: proximoStatus.status_pedido } : p
        )
      );

    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  }

  if (loading || authLoading) return <p>Carregando pedidos...</p>;
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* ✅ HEADER COM TODOS OS FILTROS */}
      <HeaderPedidos
        user={user}
        filtroData={filtroData}
        setFiltroData={setFiltroData}
        filtroPeriodo={filtroPeriodo}
        setFiltroPeriodo={setFiltroPeriodo}
        filtroPagamento={filtroPagamento}
        setFiltroPagamento={setFiltroPagamento}
      />

      {/* ✅ TÍTULO COM ESTATÍSTICAS */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Pedidos - {filtroPeriodo.toUpperCase()}
          {filtroPagamento !== 'todos' && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              backgroundColor: filtroPagamento === 'pago' ? '#28a745' : '#ffc107',
              color: filtroPagamento === 'pago' ? '#fff' : '#000'
            }}>
              {filtroPagamento === 'pago' ? '✅ PAGOS' : '⏳ PENDENTES'}
            </span>
          )}
        </h2>

        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}>
            <span style={{ fontWeight: 'bold' }}>📋 Total:</span>
            <span style={{ color: '#6c757d' }}>{pedidosFiltrados.length}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}>
            <span style={{ fontWeight: 'bold' }}>✅ Pagos:</span>
            <span style={{ color: '#28a745' }}>{pagos}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}>
            <span style={{ fontWeight: 'bold' }}>⏳ Pendentes:</span>
            <span style={{ color: '#ffc107' }}>{pendentes}</span>
          </div>
        </div>
      </div>

      {/* ✅ LISTA DE PEDIDOS */}
      {pedidosFiltrados.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '60px 20px',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {filtroPagamento === 'pago' ? '✅' : filtroPagamento === 'pendente' ? '⏳' : '📋'}
          </div>
          <h3 style={{ color: '#666', marginBottom: '8px' }}>
            Nenhum pedido encontrado
          </h3>
          <p style={{ color: '#999', margin: 0 }}>
            {filtroPagamento !== 'todos'
              ? `Não há pedidos ${filtroPagamento}s para este período.`
              : 'Não há pedidos para este período.'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {pedidosFiltrados.map(pedido => (
            <PedidoCard
              key={pedido.id_pedido}
              pedido={pedido}
              funcionario={pedido}
              numeroPedido={gerarNumeroPedido(pedido, pedidos)}
              handleChangeStatus={handleChangeStatus}
              handleChangepaymentstatus={handleChangepaymentstatus}
              getStatusColor={getStatusColor}
              formatarData={formatarData}
            />
          ))}
        </div>
      )}
    </div>
  );
}