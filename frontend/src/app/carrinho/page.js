'use client';
import React, { useState } from 'react';
import Status from "@/components/Status";
import CardProduto from '@/components/CardProduto';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function CarrinhoPage() {
  const { carrinho, handleAdd, handleRemove, handleClear, produtos } = useCarrinho();
  const [status, setStatus] = useState('idle'); 
  const [contador, setContador] = useState(0);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const router = useRouter();
 

  return (
    <div style={{ padding: '20px' }}>
      <h1>Carrinho</h1>

      {Object.keys(carrinho).length === 0 && <p>Carrinho vazio.</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {produtos
          .filter(produto => carrinho[produto.id_produto])
          .map(produto => (
            <CardProduto
              key={produto.id_produto}
              produto={produto}
              quantidade={carrinho[produto.id_produto]}
              preco={produto.preco}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onClear={handleClear}
            />
          ))}
      </div>

      {Object.keys(carrinho).length > 0 && status !== 'confirmed' && (
/*
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

      */
        <button
          onClick={() => router.push('/confirmacao')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: status === 'loading' ? '#f0ad4e' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? `Finalizando... (${contador})`
            : 'Finalizar pedido '}
          
          </button>
      )}

      {status === 'confirmed' && pedidoConfirmado && (
        <>
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>✅ Pedido Confirmado!</h2>
            <h3>Resumo do pedido:</h3>
            <ul>
              {Object.entries(pedidoConfirmado).map(([produtoId, quantidade]) => {
                const produto = produtos.find(p => p.id_produto === parseInt(produtoId));
                if (!produto) return null;
                const precoUnit = Number(produto.preco);
                const totalItem = precoUnit * quantidade;
                return (
                  <li key={produtoId}>
                    {produto.nome} - Quantidade: {quantidade} - Preço unitário: R$ {precoUnit.toFixed(2)} - Total: R$ {totalItem.toFixed(2)}
                  </li>
                );
              })}
            </ul>
            <h3>Total do pedido: R$ {totalPedido}</h3>
          </div>
          <Status status="confirmed" />


        </>
      )}
    </div>
  );
}
