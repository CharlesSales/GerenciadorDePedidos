'use client';
import React from 'react';

export default function CardProduto({ produto, quantidade, onAdd, onRemove, onClear }) {
  return (
    <div style={{
      border: '1px solid #f1f1f1',
      borderRadius: '12px',
      padding: '12px',
      width: '220px',
      textAlign: 'center',
      margin: '10px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      transition: 'transform 0.2s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {/* Imagem do produto */}
      <img
        src={produto.imagem}
        alt={produto.nome}
        style={{
          width: '100%',
          height: '140px',
          objectFit: 'cover',
          borderRadius: '12px'
        }}
      />

      {/* Nome */}
      <h3 style={{ margin: '10px 0 4px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
        {produto.nome}
      </h3>

      {/* Preço */}
      <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#E53935', marginBottom: '8px' }}>
        R$ {(produto.preco * quantidade).toFixed(2)}
      </p>

      {/* Controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '8px'
      }}>
        <button
          onClick={() => onRemove(produto)}
          style={{
            background: '#f1f1f1',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >-</button>

        <span style={{ fontWeight: '600', fontSize: '16px' }}>{quantidade}</span>

        <button
          onClick={() => onAdd(produto)}
          style={{
            background: '#E53935',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >+</button>
      </div>

      {/* Remover */}
      <button
        onClick={() => onClear(produto)}
        style={{
          marginTop: '12px',
          backgroundColor: '#B71C1C',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Remover
      </button>
    </div>
  );
}
