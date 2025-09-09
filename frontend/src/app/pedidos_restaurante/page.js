'use client';
import { useEffect, useState } from "react";

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroData, setFiltroData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_URL}/pedidos`);
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

  // Filtra pedidos pelo dia selecionado
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (!filtroData) return true; // sem filtro, mostra todos
    if (!pedido.data_hora) return false;
    const pedidoData = new Date(pedido.data_hora).toISOString().slice(0, 10); // YYYY-MM-DD
    return pedidoData === filtroData;
  });

  if (loading) return <p>Carregando pedidos...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div>
      <h1>Lista de Pedidos</h1>

      {/* Input de filtro por data */}
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
        pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.id_pedido}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <p><strong>ID:</strong> {pedido.id_pedido}</p>
            <p><strong>Cliente:</strong> {pedido.nome_cliente}</p>
            <p><strong>Data:</strong> {formatarData(pedido.data_hora)}</p>
            <p><strong>Casa:</strong> {pedido.casa}</p>
            <p><strong>Total:</strong> R$ {Number(pedido.total || 0).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}
