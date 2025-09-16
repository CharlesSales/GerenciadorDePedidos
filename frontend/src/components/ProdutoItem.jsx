// ProdutoItem.jsx
'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import ProdutoInfo from './ProdutoInfo';
import ProdutoBotao from './ProdutoBotao';

export default function ProdutoItem({ produto, adicionarAoCarrinho }) {
  const { carrinho, handleClear } = useCarrinho();
  const preco = Number(produto.preco);
  const estaNoCarrinho = carrinho[produto.id_produto] !== undefined;

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: '10px',
        padding: '15px',
        width: '200px', // menor largura
        textAlign: 'center',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Imagem, nome e preço */}
      <ProdutoInfo
        nome={produto.nome}
        preco={preco}
        imagem={produto.imagem}
        pequeno={true} // flag para imagem menor
      />

      {/* Botão compacto */}
      <div style={{ marginTop: '8px' }}>
        <ProdutoBotao
          estaNoCarrinho={estaNoCarrinho}
          onAdicionar={() => adicionarAoCarrinho(produto)}
          onRemover={() => handleClear(produto)}
          pequeno={true} // flag para botão menor
        />
      </div>
    </div>
  );
}
