'use client';
import React from "react";

export default function PedidoCard({ pedido, numeroPedido, handleChangeStatus, handleChangepaymentstatus, getStatusColor, formatarData }) {
  const itens = typeof pedido.pedidos === "string" && pedido.pedidos.trim()
    ? JSON.parse(pedido.pedidos)
    : Array.isArray(pedido.pedidos)
      ? pedido.pedidos
      : [];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      {/* Header do pedido */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
            Pedido #{numeroPedido}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {formatarData(pedido.data_hora)}
          </p>
        </div>
        <div style={{
          backgroundColor: getStatusColor(pedido.status),
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {pedido.status}
        </div>
      </div>

      {/* Informações do cliente */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>{pedido.nome_cliente}</p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Casa: {pedido.casa}</p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Mesa: {pedido.mesa}</p>
        {pedido.detalhe && (
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Obs: {pedido.detalhe}</p>
        )}
      </div>

      {/* Lista de itens */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
          Itens do Pedido:
        </h4>
        {itens.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < itens.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', color: '#e11616ff', fontSize: '14px' }}>{item.quantidade}x</span>
              <span style={{ marginLeft: '10px', color: '#e11616ff', fontSize: '14px' }}>{item.nome}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total e ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Total: R$ {Number(pedido.total || 0).toFixed(2)}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleChangepaymentstatus(pedido.id_pedido)}
            style={{
              backgroundColor: pedido.pag === 'pago' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {pedido.pag === 'pago' ? 'Pago' : 'Pendente'}
          </button>
          <button
            onClick={() => handleChangeStatus(pedido.id_pedido, pedido.status)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Avançar
          </button>
        </div>
      </div>
    </div>
  );
}
