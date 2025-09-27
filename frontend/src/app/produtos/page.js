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

  // categorias únicas
  const categorias = [...new Set(produtos.map(p => p.categoria.categoria_nome))];

  // aplica filtros
  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = categoriaSelecionada ? produto.categoria.categoria_nome === categoriaSelecionada : true;
    const passaBusca = filtro
      ? produto[coluna]?.toLowerCase().includes(filtro.toLowerCase())
      : true;
    return passaCategoria && passaBusca;
  });

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Filtros no centro */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000
      }}>
        {/* Input de busca */}
        <input
          type="text"
          placeholder="Buscar produto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            width: '80%',
            maxWidth: '400px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            textAlign: 'center'
          }}
        />

        {/* Botões de categoria */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          width: '100%',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setCategoriaSelecionada("")}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              backgroundColor: categoriaSelecionada === "" ? '#ff4d4d' : '#f9f9f9',
              color: categoriaSelecionada === "" ? '#fff' : '#000',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                backgroundColor: categoriaSelecionada === cat ? '#ff4d4d' : '#f9f9f9',
                color: categoriaSelecionada === cat ? '#fff' : '#000',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de produtos */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px'
      }}>
        {produtosFiltrados.map(produto => (
          <ProdutoItem
            key={produto.id_produto}
            produto={produto}
            adicionarAoCarrinho={handleAdd}
            removeDoCarrinho={handleRemove}
          />
        ))}
      </div>

      {/* Botão do carrinho fixo */}
      <button
        onClick={() => router.push('/carrinho')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          fontSize: '20px',
          padding: '15px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        🛒
      </button>
    </div>
  );
}
