'use client';
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PedidoCard from "@/components/PedidoCard";

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroData, setFiltroData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 10);
  });
  

  //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  useEffect(() => {     
    // conecta no socket do backend
    const socket = io(API_URL);

    // quando o backend emitir novo pedido
    socket.on("novoPedido_geral", (pedido) => {
      setPedidos(prev => {
        const jaExiste = prev.some(p => p.id_pedido === pedido.id_pedido);
        return jaExiste ? prev : [pedido, ...prev];
    });
  });

  socket.on("statusAtualizado", ({ id, novoStatus }) => {
    setPedidos(prev =>
      prev.map(p => 
        p.id_pedido === Number(id) ? { ...p, pag: novoStatus } : p
      )
    );
  });
    
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_URL}/pedidosGeral`);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setErro("Não foi possível carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [API_URL]);

  async function handleChangeStatus(id) {
    try {
      const response = await fetch(`${API_URL}/pedidosGeral/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Erro ao atualizar status:', text);
        return;
      }
      const result = await response.json();
      setPedidos(prev =>
        prev.map(p => p.id_pedido === id ? { ...p, pag: result.pedido.pag } : p)
      );
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  }

  const formatarData = (dataHora) => {
    if (!dataHora) return "Sem data";
    const data = new Date(dataHora);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!filtroData) return true;
    if (!pedido.data_hora) return false;
    const pedidoData = new Date(pedido.data_hora).toISOString().slice(0, 10);
    return pedidoData === filtroData;
  });

  if (loading) return <p>Carregando pedidos...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div>
      <h1>Lista de Pedidos</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Filtrar por dia:{" "}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </label>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidosFiltrados.map(pedido => (
          <PedidoCard
            key={pedido.id_pedido}
            pedido={pedido}
            formatarData={formatarData}
            handleChangeStatus={handleChangeStatus}
          />
        ))
      )}
    </div>
  );
}
