'use client';
import React, { useState } from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import ProdutoItem from '@/components/ProdutoItem';
import { useRouter } from 'next/navigation';

export default function Produtos() {
  const { produtos, handleAdd, handleRemove } = useCarrinho();
  const router = useRouter();

  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const categorias = [...new Set(produtos.map(p => p.categoria.categoria_nome))];

  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = categoriaSelecionada
      ? produto.categoria.categoria_nome === categoriaSelecionada
      : true;
    const passaBusca = busca
      ? produto.nome.toLowerCase().includes(busca.toLowerCase())
      : true;
    return passaCategoria && passaBusca;
  });

  return (
    <div style={{ paddingTop: '120px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Topo fixo */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid #eee',
          padding: '0.75rem 1rem',
          zIndex: 1000,
        }}
      >
        {/* Busca e carrinho */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              flex: '1 1 60%',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={() => router.push('/carrinho')}
            style={{
              backgroundColor: '#ff4d4d',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            🛒
          </button>
        </div>

        {/* Filtros de categorias horizontal */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            marginTop: '0.5rem',
            paddingBottom: '0.25rem',
          }}
        >
          <button
            onClick={() => setCategoriaSelecionada('')}
            style={{
              flexShrink: 0,
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: '1px solid #ddd',
              backgroundColor: categoriaSelecionada === '' ? '#ff4d4d' : '#f9f9f9',
              color: categoriaSelecionada === '' ? '#fff' : '#000',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                flexShrink: 0,
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: '1px solid #ddd',
                backgroundColor: categoriaSelecionada === cat ? '#ff4d4d' : '#f9f9f9',
                color: categoriaSelecionada === cat ? '#fff' : '#000',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid responsivo de produtos */}
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          justifyItems: 'center',
        }}
      >
        {produtosFiltrados.map(produto => (
          <ProdutoItem
            key={produto.id_produto}
            produto={produto}
            adicionarAoCarrinho={handleAdd}
            removeDoCarrinho={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
