'use client';
import { useEffect, useState } from "react";

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch("https://gerenciadordepedidos.onrender.com/pedidos")
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.error("Erro ao carregar pedidos:", err));
  }, []);

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

  return (
    <div>
      <h1>Lista de Pedidos</h1>
      {pedidos.map((pedido) => (
        <div key={pedido.id_pedido} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "6px" }}>
          <p><strong>ID:</strong> {pedido.id_pedido}</p>
          <p><strong>Cliente:</strong> {pedido.nome_cliente}</p>
          <p><strong>Data:</strong> {formatarData(pedido.data_hora)}</p>
          <p><strong>casa:</strong> {pedido.casa}</p>
          <p><strong>Total:</strong> R$ {Number(pedido.total).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
