'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';

export default function ProdutoItem({ produto, adicionarAoCarrinho }) {
  const { carrinho, removerDoCarrinho } = useCarrinho();
  
  // ✅ VERIFICAR SE PRODUTO EXISTE
  if (!produto) {
    return <div>Produto não encontrado</div>;
  }

  // ✅ GARANTIR QUE OS VALORES SEJAM STRINGS/NÚMEROS
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
        padding: '15px',
        width: '200px',
        textAlign: 'center',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* ✅ IMAGEM */}
      {imagem && (
        <img
          src={imagem}
          alt={nome}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '10px'
          }}
          onError={(e) => {
            e.target.style.display = 'none'; // Esconder se erro
          }}
        />
      )}

      {/* ✅ INFORMAÇÕES DO PRODUTO */}
      <div>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          {nome} {/* ✅ RENDERIZAR STRING, NÃO OBJETO */}
        </h3>
        
        {descricao && (
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: '12px', 
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {descricao} {/* ✅ RENDERIZAR STRING, NÃO OBJETO */}
          </p>
        )}
        
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: '#28a745'
        }}>
          R$ {preco.toFixed(2)} {/* ✅ RENDERIZAR NÚMERO FORMATADO */}
        </p>
      </div>

      {/* ✅ BOTÕES */}
      <div style={{ marginTop: 'auto' }}>
        {!estaNoCarrinho ? (
          <button
            onClick={() => {
              console.log('🛒 Adicionando produto:', nome);
              handleAdicionar(produto);
            }}
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
            ➕ Adicionar
          </button>
        ) : (
          <button
            onClick={() => {
              console.log('🗑️ Removendo produto:', nome);
              removerDoCarrinho(produto.id_produto);
            }}
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
            ❌ Remover
          </button>
        )}
      </div>
    </div>
  );
}