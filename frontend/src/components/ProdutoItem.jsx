'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';

export default function ProdutoItem({ produto, adicionarAoCarrinho }) {
  const { carrinho, removerDoCarrinho } = useCarrinho();
  
  if (!produto) return <div>Produto não encontrado</div>;

  const nome = produto.nome || 'Produto sem nome';
  const preco = Number(produto.preco) || 0;
  const descricao = produto.descricao || '';
  const imagem = produto.imagem || produto.imagem_url || '';
  
  const estaNoCarrinho = carrinho.some(item => item.id_produto === produto.id_produto);
  const handleAdicionar = adicionarAoCarrinho || useCarrinho().adicionarAoCarrinho;

  return (
    <div
  style={{
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '20px',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease',
  }}
>
  {/* Imagem responsiva */}
  <div style={{
    width: '100%',
    maxHeight: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: '10px',
  }}>
    {imagem && (
      <img
        src={imagem}
        alt={nome}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    )}
  </div>

  {/* Informações */}
  <div>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{nome}</h3>
    {descricao && (
      <p style={{
        margin: '0 0 8px 0',
        fontSize: '12px',
        color: '#666',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>{descricao}</p>
    )}
    <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
      R$ {preco.toFixed(2)}
    </p>
  </div>

  {/* Botões */}
  <div style={{ marginTop: 'auto' }}>
    {!estaNoCarrinho ? (
      <button
        onClick={() => handleAdicionar(produto)}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        Adicionar
      </button>
    ) : (
      <button
        onClick={() => removerDoCarrinho(produto.id_produto)}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        Remover
      </button>
    )}
  </div>
</div>
)}
  