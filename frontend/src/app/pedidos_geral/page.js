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
  // ✅ ADICIONAR ESTADO PARA FILTRO DE PERÍODO
  const [filtroPeriodo, setFiltroPeriodo] = useState('dia');

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

  // ✅ APLICAR FILTROS COMBINADOS
  const pedidosFiltrados = (() => {
    let resultado = pedidos;

    // Primeiro aplicar filtro por período
    resultado = filtrarPorPeriodo(resultado, filtroPeriodo);

    // Depois aplicar filtro por data específica (se não for "todos")
    if (filtroPeriodo !== 'todos' && filtroData) {
      resultado = resultado.filter(pedido => {
        if (!pedido.data_hora) return false;
        return new Date(pedido.data_hora).toISOString().slice(0, 10) === filtroData;
      });
    }

    return resultado;
  })();

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
      {/* ✅ PASSAR TODAS AS PROPS NECESSÁRIAS */}
      <HeaderPedidos 
        user={user} 
        filtroData={filtroData} 
        setFiltroData={setFiltroData}
        filtroPeriodo={filtroPeriodo}
        setFiltroPeriodo={setFiltroPeriodo}
      />
      
      <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '24px', fontWeight: 'bold' }}>
        Pedidos do Dia - {filtroPeriodo.toUpperCase()} ({pedidosFiltrados.length} pedidos)
      </h2>
      
      {pedidosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
          Nenhum pedido encontrado para este período.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {pedidosFiltrados.map(pedido => (
            <PedidoCard
              key={pedido.id_pedido}
              pedido={pedido}
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