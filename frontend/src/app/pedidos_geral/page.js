'use client';
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PedidoCard from "@/components/PedidoCard";
import { useAuth } from "@/context/AuthContext";

export default function ListaPedidos() {
  const { user, token, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroData, setFiltroData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 10);
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const statusOrdem = [
    { id: 1, status_pedido: 'Pedido feito' },
    { id: 2, status_pedido: 'preparando' },
    { id: 3, status_pedido: 'pronto' },
    { id: 4, status_pedido: 'a caminho' },
    { id: 5, status_pedido: 'entregue' },
  ];

  useEffect(() => {
    if (authLoading || !user || !token) return;
    const socket = io(API_URL, { auth: { token } });

    socket.on("novoPedido_geral", (pedido) => {
      if (pedido.restaurante_id === user.dados.restaurante.id_restaurante) {
        setPedidos(prev => {
          const jaExiste = prev.some(p => p.id_pedido === pedido.id_pedido);
          return jaExiste ? prev : [pedido, ...prev];
        });
      }
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
        const res = await fetch(`${API_URL}/pedidosGeral/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
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

    return () => socket.disconnect();
  }, [API_URL, user, token, authLoading]);

  async function handleChangepaymentstatus(id) {
    try {
      const response = await fetch(`${API_URL}/pedidosGeral/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
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

  async function handleChangeStatus(id, statusAtual) {
  try {
    // encontra índice do status atual
    const indiceAtual = statusOrdem.findIndex(s => s.status_pedido === statusAtual);
    // define próximo status ou mantém último
    const proximoStatus = indiceAtual < statusOrdem.length - 1
      ? statusOrdem[indiceAtual + 1]
      : statusOrdem[indiceAtual];

    // envia apenas o id do status
    const response = await fetch(`${API_URL}/pedidosGeral/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status_id: proximoStatus.id }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Erro ao atualizar status:', text);
      return;
    }

    const result = await response.json();

    // atualiza localmente
    setPedidos(prev =>
      prev.map(p =>
        p.id_pedido === id ? { ...p, status: proximoStatus.status_pedido } : p
      )
    );

  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}





  const formatarData = (dataHora) => {
    if (!dataHora) return "Sem data";
    const data = new Date(dataHora);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleString("pt-br", {
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

  if (loading || authLoading) return <p>Carregando pedidos...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div>
      <h1>Pedidos de {user.dados.restaurante.nome_restaurante}</h1>

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
        <div style={{ display: "flex", justifyContent: "center", gap: "1px" }}>
          {/* Coluna esquerda */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {pedidosFiltrados.filter((_, index) => index % 2 === 0).map(pedido => (
              <PedidoCard
                key={pedido.id_pedido}
                pedido={pedido}
                formatarData={formatarData}
                handleChangepaymentstatus={handleChangepaymentstatus}
                handleChangeStatus={handleChangeStatus}
              />
            ))}
          </div>

          {/* Coluna direita */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {pedidosFiltrados.filter((_, index) => index % 2 !== 0).map(pedido => (
              <PedidoCard
                key={pedido.id_pedido}
                pedido={pedido}
                formatarData={formatarData}
                handleChangepaymentstatus={handleChangepaymentstatus}
                handleChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
