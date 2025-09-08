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

  // Filtra produtos conforme o filtro de busca
  const produtosFiltrados = produtos.filter(produto => {
    if (!filtro || !coluna) return true;
    return produto[coluna]?.toLowerCase().includes(filtro.toLowerCase());
  });

  // Agrupa produtos por categoria
  const categorias = {};
  produtosFiltrados.forEach(produto => {
    if (!categorias[produto.categoria]) categorias[produto.categoria] = [];
    categorias[produto.categoria].push(produto);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Filtro</h1>
      <div>
        <label>
          Coluna:
          <select value={coluna} onChange={e => setColuna(e.target.value)}>
            <option value="">Selecione uma coluna</option>
            <option value="nome">Nome</option>
            <option value="descricao">Descrição</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Digite para filtrar"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </div>

      <h2>Produtos por Categoria</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        {Object.keys(categorias).map(categoria => (
          <div key={categoria}>
            <h3>{categoria}</h3>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', overflowX: 'auto' }}>
              {categorias[categoria].map(produto => (
                <ProdutoItem
                  key={produto.id_produto}
                  produto={produto}
                  adicionarAoCarrinho={handleAdd}
                  removeDoCarrinho={handleRemove}
                />
              ))}
            </div>
          </div>
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
