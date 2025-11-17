'use client';
import React from 'react';

export default function CardProduto({ produto, quantidade, onAdd, onRemove, onClear }) {
  // ✅ VERIFICAR SE PRODUTO EXISTE
  if (!produto) {
    return <div>Produto não encontrado</div>;
  }

  // ✅ GARANTIR QUE OS VALORES SEJAM STRINGS/NÚMEROS
  const nome = produto.nome || 'Produto sem nome';
  const preco = Number(produto.preco) || 0;
  const quantidadeAtual = Number(quantidade) || 1;
  const subtotal = preco * quantidadeAtual;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '55px',
      margin: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* ✅ NOME DO PRODUTO */}
      <h3 style={{ 
        margin: 0, 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#333'
      }}>
        {nome} {/* ✅ RENDERIZAR STRING, NÃO OBJETO */}
      </h3>

      {/* ✅ INFORMAÇÕES DE PREÇO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '16px', color: '#666' }}>
          Preço unitário: R$ {preco.toFixed(2)} {/* ✅ RENDERIZAR NÚMERO FORMATADO */}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
          Subtotal: R$ {subtotal.toFixed(2)} {/* ✅ RENDERIZAR NÚMERO FORMATADO */}
        </span>
      </div>

      {/* ✅ CONTROLES DE QUANTIDADE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onRemove}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            ➖
          </button>
          
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            minWidth: '30px',
            textAlign: 'center'
          }}>
            {quantidadeAtual} {/* ✅ RENDERIZAR NÚMERO, NÃO OBJETO */}
          </span>
          
          <button
            onClick={onAdd}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            ➕
          </button>
        </div>

        {/* ✅ BOTÃO REMOVER COMPLETAMENTE */}
        <button
          onClick={onClear}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ Remover
        </button>
      </div>
    </div>
  );
}