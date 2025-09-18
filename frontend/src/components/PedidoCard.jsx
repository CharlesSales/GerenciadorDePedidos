// components/PedidoCard.jsx
'use client';
import React, { useState } from "react";

export default function PedidoCard({ pedido, formatarData, handleChangeStatus }) {
  const [openMenu, setOpenMenu] = useState(false);

  const corFundo = pedido.pag === "pago" ? "#d4edda" : "#f8d7da";
  const corTexto = pedido.pag === "pago" ? "#155724" : "#721c24";

  const itens = typeof pedido.pedidos === "string" && pedido.pedidos.trim()
    ? JSON.parse(pedido.pedidos)
    : Array.isArray(pedido.pedidos)
      ? pedido.pedidos
      : []; // fallback
  const nomes = itens.map(i => `${i.nome} (${i.quantidade}x)`).join(", ");

  const toggleMenu = () => setOpenMenu(!openMenu);

  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${corTexto}`,
        backgroundColor: corFundo,
        color: corTexto,
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
      }}
    >
      {/* Botão do menu no canto superior direito */}
      <button
        onClick={toggleMenu}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer"
        }}
      >
        ☰
      </button>

      {openMenu && (
        <ul
          style={{
            position: "absolute",
            top: "40px",
            right: "10px",
            listStyle: "none",
            margin: 0,
            padding: "10px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            minWidth: "150px",
            zIndex: 10
          }}
        >
          <li
            style={{ padding: "5px 10px", cursor: "pointer" }}
            onClick={() => handleChangeStatus(pedido.id_pedido)}
          >
            Alterar status
          </li>
        </ul>
      )}

      <p><strong>ID:</strong> {pedido.id_pedido}</p>
      <p><strong>Cliente:</strong> {pedido.nome_cliente}</p>
      <p><strong>Data:</strong> {formatarData(pedido.data_hora)}</p>
      <p><strong>Casa:</strong> {pedido.casa}</p>
      <p><strong>Pedido:</strong> {nomes}</p>
      <p><strong>Total:</strong> R$ {Number(pedido.total || 0).toFixed(2)}</p>
      <p><strong>Status de pagamento:</strong> {pedido.pag}</p>
    </div>
  );
}
