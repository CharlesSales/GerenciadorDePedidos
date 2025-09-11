'use client';
import React, { useState, useRef, useEffect } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

function FiltroProdutos({ filtro, setFiltro, coluna, setColuna, onClose }) {
  const filtroRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={filtroRef} style={{
      position: 'fixed',
      top: '70px',
      right: '25px',
      zIndex: 1000,
      padding: '15px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      minWidth: '250px'
    }}>
      <h3>Filtrar Produtos</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Coluna:
          <select 
            value={coluna} 
            onChange={e => setColuna(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">Selecione</option>
            <option value="nome">Nome</option>
            <option value="descricao">Descrição</option>
            <option value="categoria">Categoria</option>
          </select>
        </label>
      </div>
      <input
        type="text"
        placeholder="Digite para filtrar"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        style={{ width: '100%', padding: '5px' }}
      />
    </div>
  );
}

export default function Produtos() {
  const { produtos, handleAdd, handleRemove } = useCarrinho();
  const router = useRouter();
  const [filtro, setFiltro] = useState("");  
  const [coluna, setColuna] = useState("nome"); 
  const [openFiltro, setOpenFiltro] = useState(false);

  const produtosFiltrados = produtos.filter(produto => {
    if (!filtro || !coluna) return true;
    return produto[coluna]?.toLowerCase().includes(filtro.toLowerCase());
  });

  const categorias = {};
  produtosFiltrados.forEach(produto => {
    if (!categorias[produto.categoria]) categorias[produto.categoria] = [];
    categorias[produto.categoria].push(produto);
  });

  return (
    <div style={{ padding: '30px' }}>
      {/* Botão de filtro */}
      <button
        onClick={() => setOpenFiltro(!openFiltro)}
        style={{
          fontSize: '35px',
          position: 'fixed',
          top: '10px',
          right: '30px',
          zIndex: 1000,
          padding: '10px 15px',
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          width: '50px',
          cursor: 'pointer'
        }}
      >
        🔍
      </button>

      {openFiltro && (
        <FiltroProdutos
          filtro={filtro}
          setFiltro={setFiltro}
          coluna={coluna}
          setColuna={setColuna}
          onClose={() => setOpenFiltro(false)}
        />
      )}

      {/* Produtos agrupados por categoria */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {Object.keys(categorias).map(categoria => (
          <div key={categoria}>
            <h3>{categoria}</h3>
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                overflowX: 'auto', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '6px', 
                backgroundColor: '#f9f9f9' 
            }}>
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

      {/* Botão do carrinho */}
      <button
        onClick={() => router.push('/carrinho')}
        style={{
          fontSize: '35px',
          position: 'fixed',
          top: '10px',
          right: '60px',
          zIndex: 1000,
          padding: '10px 15px',
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🛒
      </button>
    </div>
  );
}
