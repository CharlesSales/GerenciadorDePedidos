'use client';
import React, { useState, useEffect } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Produtos() {
  const { produtos, handleAdd, handleRemove, carrinho, calcularTotal, limparCarrinho } = useCarrinho();
  const { user } = useAuth();
  const router = useRouter();
  const [filtro, setFiltro] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  // categorias únicas
  const categorias = [...new Set(produtos.map(p => p.categoria.categoria_nome))];

  // produtos filtrados
  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = categoriaSelecionada ? produto.categoria.categoria_nome === categoriaSelecionada : true;
    const passaBusca = filtro ? produto.nome.toLowerCase().includes(filtro.toLowerCase()) : true;
    return passaCategoria && passaBusca;
  });

  const total = calcularTotal();

  // função para redirecionar home conforme o cargo
  const redirecionarParaHome = () => {
    if (!user) {
      router.push('/');
      return;
    }
    const isAdmin = user.isAdmin || user.dados?.cargo === 1;
    router.push(isAdmin ? '/admin' : '/funcionario');
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
      }}
    >

        
      
      {/* === 50% - PRODUTOS === */}
      <div
        style={{
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Campo de busca fixo */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            padding: '10px',
            zIndex: 10,
            borderBottom: '1px solid #ddd',
          }}
        >
          <input
            type="text"
            placeholder="Buscar produto..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              width: '90%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          />
          <button
            onClick={redirecionarParaHome}
            style={{
              marginLeft: '22px', 
              backgroundColor: '#f5f5f5',
              right: '5px',
              fontSize: '15px',
              padding: '11px',
              borderRadius: '50%',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            🏠︎
          </button>
        </div>

        {/* Botões de categoria */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            width: '100%',
            marginTop: '20px',
          }}
        >
          <button
            onClick={() => setCategoriaSelecionada('')}
            style={{
              padding: '8px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              backgroundColor: categoriaSelecionada === '' ? '#ff4d4d' : '#f9f9f9',
              color: categoriaSelecionada === '' ? '#fff' : '#000',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: '8px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                backgroundColor: categoriaSelecionada === cat ? '#ff4d4d' : '#f9f9f9',
                color: categoriaSelecionada === cat ? '#fff' : '#000',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista de produtos */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            justifyItems: 'center',
          }}
        >
          {produtosFiltrados.map((produto) => (
            <ProdutoItem
              key={produto.id_produto}
              produto={produto}
              adicionarAoCarrinho={handleAdd}
              removeDoCarrinho={handleRemove}
            />
          ))}
        </div>
      </div>

      {/* === 25% - CARRINHO FIXO === */}
      <div
        style={{
          width: '20%',
          borderLeft: '1px solid #ddd',
          backgroundColor: '#fff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{textAlign: 'center' }}>🛒 Carrinho</h2>

        {/* Lista de itens */}
        <div style={{ flex: 1, overflowY: 'auto', marginTop: '25px' }}>
          {carrinho.length === 0 ? (
            <p style={{ marginTop: '80%', textAlign: 'center', color: '#777' }}>Carrinho vazio</p>
          ) : (
            carrinho.map((item, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #000000ff',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '10px',
                }}
              >
                <strong>{item.nome}</strong>
                <p style={{ margin: '4px 0' }}>
                  R$ {item.preco.toFixed(2)} x {item.quantidade}
                </p>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button onClick={() => handleRemove(item.id_produto)}>➖</button>
                  <button onClick={() => handleAdd(item)}>➕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total e ações */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <h3 style={{ textAlign: 'center', color: '#28a745' }}>
            Total: R$ {total.toFixed(2)}
          </h3>
          <button
            onClick={() => limparCarrinho()}
            style={{
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              width: '100%',
              marginTop: '10px',
              cursor: 'pointer',
            }}
          >
            Limpar Carrinho
          </button>
          <button
            onClick={() => router.push('/confirmacao')}
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              width: '100%',
              marginTop: '10px',
              cursor: 'pointer',
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
