'use client';
import React, { useState } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function Produtos() {
  const { produtos, handleAdd, handleRemove } = useCarrinho();
  const router = useRouter();
  const [filtro, setFiltro] = useState("");
  const [coluna, setColuna] = useState("nome");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  const categorias = [...new Set(produtos.map(p => p.categoria.categoria_nome))];

  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = categoriaSelecionada ? produto.categoria.categoria_nome === categoriaSelecionada : true;
    const passaBusca = filtro
      ? produto[coluna]?.toLowerCase().includes(filtro.toLowerCase())
      : true;
    return passaCategoria && passaBusca;
  });

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Filtros fixos no topo */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid #eee',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000
        }}
      >
        {/* Linha com input e botão do carrinho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          <input
            type="text"
            placeholder="Buscar produto..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              flex: '1 1 200px',
              maxWidth: '400px',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.375rem',
              textAlign: 'center',
              minWidth: '150px'
            }}
          />

          <button
            onClick={() => router.push('/carrinho')}
            style={{
              backgroundColor: '#ff4d4d',
              color: 'white',
              fontSize: '1.25rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            🛒
          </button>
        </div>

        {/* Botões de categoria */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            width: '100%',
            justifyContent: 'center',
            padding: '0.25rem 0'
          }}
        >
          <button
            onClick={() => setCategoriaSelecionada("")}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              border: '1px solid #ddd',
              backgroundColor: categoriaSelecionada === "" ? '#ff4d4d' : '#f9f9f9',
              color: categoriaSelecionada === "" ? '#fff' : '#000',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                border: '1px solid #ddd',
                backgroundColor: categoriaSelecionada === cat ? '#ff4d4d' : '#f9f9f9',
                color: categoriaSelecionada === cat ? '#fff' : '#000',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de produtos */}
      <div
        style={{
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '2rem',
          justifyItems: 'center'
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
  );
}
