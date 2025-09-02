'use client';
import React, { useEffect, useState } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function Produtos() {
  const { produtos } = useCarrinho();
  const { handleAdd, handleClear, handleRemove } = useCarrinho();
  const router = useRouter();


  return (
    <div style={{ padding: '20px' }}>
      <h1>Produtos</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {produtos.map((produto) => (
          <ProdutoItem
            key={produto.id_produto}
            produto={produto}       // ⚠️ passa o objeto inteiro
            adicionarAoCarrinho={handleAdd} // ⚠️ nome correto da prop no ProdutoItem
            removeDoCarrinho={handleRemove}
          />
        ))}
      </div>

      <button
        onClick={() => router.push('/carrinho')}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Ir para o carrinho
      </button>
    </div>
  );
}
