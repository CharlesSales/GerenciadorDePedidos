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
        borderRadius: '12px',
        padding: '16px',
        width: '100%',
        maxWidth: '350px', // ✅ LARGURA MÁXIMA PARA 3 COLUNAS
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'row', // ✅ FORMATO RETANGULAR (HORIZONTAL)
        alignItems: 'center',
        gap: '16px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        minHeight: '100px', // ✅ ALTURA MÍNIMA
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {/* ✅ IMAGEM À ESQUERDA */}
      <div style={{
        width: '80px',
        height: '80px',
        flexShrink: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {imagem ? (
          <img
            src={imagem}
            alt={nome}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => { 
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="color:#999; font-size:24px;">🍽️</div>';
            }}
          />
        ) : (
          <div style={{ color: '#999', fontSize: '24px' }}>🍽️</div>
        )}
      </div>

      {/* ✅ INFORMAÇÕES NO CENTRO */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
        minWidth: 0,
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#333',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {nome}
        </h3>
        
        {descricao && (
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {descricao}
          </p>
        )}
        
        <p style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#28a745',
          lineHeight: '1',
        }}>
          R$ {preco.toFixed(2)}
        </p>
      </div>

      {/* ✅ BOTÃO À DIREITA */}
      <div style={{ flexShrink: 0 }}>
        {!estaNoCarrinho ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdicionar(produto);
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '90px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Adicionar
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removerDoCarrinho(produto.id_produto);
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '90px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}