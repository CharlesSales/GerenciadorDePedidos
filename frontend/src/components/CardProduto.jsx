'use client';
import React from 'react';

export default function CardProduto({ produto, quantidade, onAdd, onRemove, onClear }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      width: '220px',
      textAlign: 'center',
      margin: '10px'
    }}>
      <img
        src={produto.imagem}
        alt={produto.nome}
        style={{ width: '100%', borderRadius: '8px' }}
      />
      <h3>{produto.nome}</h3>
      <p>R$ {(produto.valor * quantidade).toFixed(2)}</p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => onRemove(produto)}>-</button>
        <span>{quantidade}</span>
        <button onClick={() => onAdd(produto)}>+</button>
      </div>

      <button
        onClick={() => onClear(produto)}
        style={{
          marginTop: '10px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px'
        }}
      >
        Remover
      </button>
    </div>
  );
}
