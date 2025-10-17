'use client';
import React, { useState, useEffect, useRef  } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PedidoCard({ pedido, formatarData, handleChangeStatus, handleChangepaymentstatus }) {
  const [open, setOpen] = useState(false);
  const [pago, setPago] = useState(pedido.pag === "pago"); // estado local da cor
  const menuRef = useRef(null);
  const token = useAuth()

  const corFundo = pedido.pag === pago ? "#d4edda" : "#f8d7da";
  const corTexto = pedido.pag === pago ? "#155724" : "#721c24";

  const itens = typeof pedido.pedidos === "string" && pedido.pedidos.trim()
    ? JSON.parse(pedido.pedidos)
    : Array.isArray(pedido.pedidos)
      ? pedido.pedidos
      : [];

  const nomes = itens.map(i => `\n${i.nome} (${i.quantidade}x)`).join("");


  const detalhe_cliente = `${pedido.nome_cliente} - ${pedido.casa}`

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setOpen(!open);

  const handleClickAlterarStatus = async (id) => {
    // executa a função que vem das props
    await handleChangepaymentstatus(id);
    // alterna a cor do card (como se alterasse o status de pagamento)
    setPago(prev => !prev);
  };


  return (
    <div
      ref={menuRef}
      style={{
        position: "relative",
        border: `1px solid ${corTexto}`,
        backgroundColor: corFundo,
        color: corTexto,
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        width: "95%",        // ocupa 80% da largura da coluna
        marginLeft: "25px",  // centraliza horizontalmente
        marginRight: "25px"  // centraliza horizontalmente
      }}
    >
      {/* Botão do menu */}
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

      {open && (
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
            onClick={() => handleChangepaymentstatus(pedido.id_pedido)}
          >
            Alterar status
          </li>
          <li
            style={{ padding: "5px 10px", cursor: "pointer" }}
            onClick={() => handleChangeStatus(pedido.id_pedido, pedido.status)}
          >
            Avançar Status
          </li>
        </ul>
      )}

      <p><strong>Numero do pedido:</strong> {pedido.id_pedido}</p>
      <p style={{ whiteSpace: 'pre-line' }}><strong>Pedido:</strong> {nomes}</p>
      {/* <p><strong>Funcionario:</strong> {pedido.funcionario}</p> */}
      <p><strong>Cliente:</strong> {detalhe_cliente}</p>
      <p><strong>Data:</strong> {formatarData(pedido.data_hora)}</p>
      {/* <p><strong>Casa:</strong> {pedido.casa}</p> */}
      <p><strong>Detalhe:</strong> {pedido.detalhe}</p>
      <p><strong>Status:</strong> {pedido.status}</p>
      <p><strong>Total:</strong> R$ {Number(pedido.total || 0).toFixed(2)}</p>
      {/* <p><strong>Status de pagamento:</strong> {pedido.pag}</p> */}
    </div>
  );
}
