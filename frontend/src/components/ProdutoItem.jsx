'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';

export default function ProdutoItem({ produto, adicionarAoCarrinho }) {
  // garante que o preço seja número
  const { carrinho, handleAdd, handleClear } = useCarrinho();
  const preco = Number(produto.preco);
  const estaNoCarrinho = carrinho[produto.id_produto] !== undefined;
  

  return (

     <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      width: '200px',
      margin: '10px',
      textAlign: 'center'
    }}>
      <img
        src={produto.imagem}
        alt={produto.nome}
        style={{ width: '100%', borderRadius: '6px' }}
      />
      <h2 className="text-lg font-semibold">{produto.nome}</h2>
      <p className="text-gray-600">R$ {preco.toFixed(2)}</p>
       {estaNoCarrinho ? (
        <button
          onClick={() => handleClear(produto)}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Remover do carrinho
        </button>
      ) : (
        <button
          onClick={() => adicionarAoCarrinho(produto)}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Adicionar ao carrinho
        </button>
      )}
    </div>
  );
}

/*
export default function ProdutoItem({ produto }) {
  const { carrinho, handleAdd, handleClear } = useCarrinho();
  const preco = Number(produto.estoq); // 👈 garante que seja número
  const estaNoCarrinho = carrinho[produto.id_produto] !== undefined;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      width: '200px',
      margin: '10px',
      textAlign: 'center'
    }}>
      <img
        src={produto.imagem}
        alt={produto.nome}
        style={{ width: '100%', borderRadius: '6px' }}
      />
      <h4 style={{ margin: '10px 0 5px' }}>{produto.nome}</h4>
      <p style={{ color: '#555' }}>R$ {preco.toFixed(2)}</p>

      {estaNoCarrinho ? (
        <button
          onClick={() => handleClear(produto)}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Remover do carrinho
        </button>
      ) : (
        <button
          onClick={() => handleAdd(produto)}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Adicionar ao carrinho
        </button>
      )}
    </div>
  );
}
*/