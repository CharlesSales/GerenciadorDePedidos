'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import ProdutoInfo from './ProdutoInfo';
import ProdutoBotao from './ProdutoBotao';

export default function ProdutoItem({ produto, adicionarAoCarrinho }) {
  const { carrinho, handleClear } = useCarrinho();
  const preco = Number(produto.preco); // garante que seja número
  const estaNoCarrinho = carrinho[produto.id_produto] !== undefined;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        width: '200px',
        margin: '10px',
        textAlign: 'center',
      }}
    >
      {/* Componente só para exibir imagem, nome e preço */}
      <ProdutoInfo nome={produto.nome} preco={preco} imagem={produto.imagem} />

      {/* Componente só para o botão de adicionar/remover */}
      <ProdutoBotao
        estaNoCarrinho={estaNoCarrinho}
        onAdicionar={() => adicionarAoCarrinho(produto)}
        onRemover={() => handleClear(produto)}
      />
    </div>
  );
}
