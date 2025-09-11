'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';

// components/ProdutoBotao.jsx
export default function ProdutoBotao({ estaNoCarrinho, onAdicionar, onRemover }) {
  return estaNoCarrinho ? (
    <button
      onClick={onRemover}
      style={{
        marginTop: '10px',
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
      }}
    >
      Remover do carrinho
    </button>
  ) : (
    <button
      onClick={onAdicionar}
      style={{
        marginTop: '10px',
        padding: '6px 12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
      }}
    >
      Adicionar ao carrinho
    </button>
  );
}
