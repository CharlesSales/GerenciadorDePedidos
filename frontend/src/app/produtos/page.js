'use client';
import React, { useState } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function Produtos() {
  const { produtos, adicionarAoCarrinho, loading } = useCarrinho();
  const router = useRouter();
  const [filtro, setFiltro] = useState("");
  const [coluna, setColuna] = useState("nome");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  console.log('📦 Produtos recebidos:', produtos);
  console.log('📦 Tipo de produtos:', typeof produtos);
  console.log('📦 É array?', Array.isArray(produtos));

  // ✅ LOADING
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Carregando produtos...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ VERIFICAR SE PRODUTOS É VÁLIDO
  if (!Array.isArray(produtos)) {
    console.error('❌ Produtos não é um array:', produtos);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>❌ Erro ao carregar produtos</h2>
        <p>Os dados recebidos não estão no formato esperado.</p>
        <p>Tipo recebido: {typeof produtos}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Recarregar
        </button>
      </div>
    );
  }

  // ✅ FILTRAR PRODUTOS SEGUROS
  const produtosValidos = produtos.filter(produto => {
    // ✅ VERIFICAR SE O PRODUTO É UM OBJETO VÁLIDO
    if (!produto || typeof produto !== 'object') {
      console.warn('⚠️ Produto inválido ignorado:', produto);
      return false;
    }
    
    // ✅ VERIFICAR SE TEM PROPRIEDADES OBRIGATÓRIAS
    if (!produto.id_produto || !produto.nome) {
      console.warn('⚠️ Produto sem ID ou nome ignorado:', produto);
      return false;
    }
    
    return true;
  });

  console.log('✅ Produtos válidos:', produtosValidos.length);

  // ✅ CATEGORIAS ÚNICAS (COM VERIFICAÇÃO SEGURA)
  const categorias = [...new Set(
    produtosValidos
      .map(p => {
        // ✅ VERIFICAÇÃO SEGURA DA CATEGORIA
        if (p.categoria && typeof p.categoria === 'object' && p.categoria.categoria_nome) {
          return p.categoria.categoria_nome;
        }
        return null;
      })
      .filter(Boolean)
  )];

  console.log('📂 Categorias encontradas:', categorias);

  // ✅ APLICAR FILTROS COM VERIFICAÇÃO SEGURA
  const produtosFiltrados = produtosValidos.filter(produto => {
    try {
      // ✅ FILTRO POR CATEGORIA
      const passaCategoria = categoriaSelecionada 
        ? (produto.categoria?.categoria_nome === categoriaSelecionada)
        : true;
      
      // ✅ FILTRO POR BUSCA
      let passaBusca = true;
      if (filtro && filtro.trim() !== '') {
        const valorBusca = produto[coluna];
        
        if (valorBusca && typeof valorBusca === 'string') {
          passaBusca = valorBusca.toLowerCase().includes(filtro.toLowerCase());
        } else if (valorBusca && typeof valorBusca === 'number') {
          passaBusca = valorBusca.toString().includes(filtro);
        } else {
          passaBusca = false;
        }
      }
      
      return passaCategoria && passaBusca;
      
    } catch (error) {
      console.error('❌ Erro ao filtrar produto:', produto, error);
      return false;
    }
  });

  console.log('🔍 Produtos após filtros:', produtosFiltrados.length);

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* ✅ BARRA DE FILTROS */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <select 
          value={coluna} 
          onChange={(e) => setColuna(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="nome">Nome</option>
          <option value="descricao">Descrição</option>
          <option value="cozinha">Cozinha</option>
        </select>
        
        <input
          type="text"
          placeholder={`Filtrar por ${coluna}...`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoriaSelecionada("")}
            style={{
              padding: '8px 16px',
              backgroundColor: categoriaSelecionada === "" ? '#007bff' : '#f8f9fa',
              color: categoriaSelecionada === "" ? 'white' : '#495057',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Todas ({produtosValidos.length})
          </button>
          
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: '8px 16px',
                backgroundColor: categoriaSelecionada === cat ? '#007bff' : '#f8f9fa',
                color: categoriaSelecionada === cat ? 'white' : '#495057',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {String(cat)} {/* ✅ GARANTIR QUE É STRING */}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ LISTA DE PRODUTOS */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map(produto => {
            try {
              return (
                <ProdutoItem
                  key={`produto-${produto.id_produto}`} // ✅ KEY ÚNICA E SEGURA
                  produto={produto}
                  adicionarAoCarrinho={adicionarAoCarrinho}
                />
              );
            } catch (error) {
              console.error('❌ Erro ao renderizar produto:', produto, error);
              return (
                <div key={`erro-${produto.id_produto}`} style={{
                  border: '1px solid #dc3545',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#dc3545'
                }}>
                  ❌ Erro ao exibir produto<br/>
                  ID: {produto.id_produto}
                </div>
              );
            }
          })
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '18px',
            color: '#666'
          }}>
            {filtro || categoriaSelecionada 
              ? `Nenhum produto encontrado para os filtros aplicados`
              : `Nenhum produto disponível`
            }
          </div>
        )}
      </div>

      {/* ✅ BOTÃO DO CARRINHO */}
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
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
      >
        🛒
      </button>
    </div>
  );
}