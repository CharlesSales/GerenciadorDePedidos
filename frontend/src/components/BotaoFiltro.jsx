'use client';
import React, { useState, useRef, useEffect } from 'react';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function Produtos() {
  const { produtos, adicionarAoCarrinho, loading } = useCarrinho();
  const router = useRouter();
  const filtrosRef = useRef(null);

  // ✅ ESTADOS DOS FILTROS
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [coluna, setColuna] = useState('nome');
  const [filtro, setFiltro] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  // ✅ TOGGLE DO MENU DE FILTROS
  const handleToggleFiltros = () => {
    setFiltrosOpen(!filtrosOpen);
  };

  // ✅ FECHAR FILTROS AO CLICAR FORA
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtrosRef.current && !filtrosRef.current.contains(event.target)) {
        setFiltrosOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // ✅ VERIFICAÇÕES DE PRODUTOS
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
    if (!produto || typeof produto !== 'object') {
      console.warn('⚠️ Produto inválido ignorado:', produto);
      return false;
    }
    
    if (!produto.id_produto || !produto.nome) {
      console.warn('⚠️ Produto sem ID ou nome ignorado:', produto);
      return false;
    }
    
    return true;
  });

  console.log('✅ Produtos válidos:', produtosValidos.length);

  // ✅ EXTRAIR CATEGORIAS ÚNICAS
  const categorias = [...new Set(
    produtosValidos
      .map(p => {
        // ✅ VERIFICAR DIFERENTES ESTRUTURAS DE CATEGORIA
        if (p.categoria && typeof p.categoria === 'object' && p.categoria.categoria_nome) {
          return p.categoria.categoria_nome;
        } else if (typeof p.categoria === 'string') {
          return p.categoria;
        }
        return null;
      })
      .filter(Boolean)
  )];

  console.log('📂 Categorias encontradas:', categorias);

  // ✅ APLICAR FILTROS
  const produtosFiltrados = produtosValidos.filter(produto => {
    try {
      // ✅ FILTRO POR CATEGORIA
      let passaCategoria = true;
      if (categoriaSelecionada) {
        const categoriaValor = produto.categoria?.categoria_nome || produto.categoria;
        passaCategoria = categoriaValor === categoriaSelecionada;
      }
      
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
    <div style={{ paddingTop: '20px' }}>
      
      {/* ✅ CONTAINER DOS BOTÕES NO TOPO DIREITO */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
      }}>
        

        {/* ✅ BOTÃO FILTROS */}
        <div ref={filtrosRef}>
          <button
            onClick={handleToggleFiltros}
            style={{
              fontSize: '18px',
              padding: '15px 17px',
              top: '90px',
              right: '15px',
              cursor: 'pointer',
              background: filtrosOpen ? '#007bff' : 'white',
              color: filtrosOpen ? 'white' : '#333',
              border: '2px solid #007bff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!filtrosOpen) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (!filtrosOpen) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            🔍
            {/* ✅ INDICADOR DE FILTROS ATIVOS */}
            {(filtro || categoriaSelecionada) && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                •
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ✅ BARRA LATERAL DE FILTROS (LADO DIREITO) */}
      {filtrosOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '350px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
          zIndex: 999,
          padding: '20px',
          overflowY: 'auto',
          borderLeft: '1px solid #e9ecef'
        }}>
          
          {/* ✅ CABEÇALHO DA BARRA LATERAL */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '2px solid #e9ecef',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              color: '#333',
              fontWeight: 'bold'
            }}>
              🔍 Filtrar Produtos
            </h2>
            <button
              onClick={() => setFiltrosOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>

          {/* ✅ SEÇÃO DE BUSCA */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#495057',
              marginBottom: '12px'
            }}>
              🔎 Buscar por:
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <select
                value={coluna}
                onChange={(e) => setColuna(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="nome">Nome do Produto</option>
                <option value="descricao">Descrição</option>
                <option value="cozinha">Cozinha</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder={`Digite o ${coluna}...`}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* ✅ SEÇÃO DE CATEGORIAS */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#495057',
              marginBottom: '12px'
            }}>
              📂 Categorias:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setCategoriaSelecionada("")}
                style={{
                  padding: '12px 16px',
                  backgroundColor: categoriaSelecionada === "" ? '#007bff' : '#f8f9fa',
                  color: categoriaSelecionada === "" ? 'white' : '#495057',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (categoriaSelecionada !== "") {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoriaSelecionada !== "") {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
              >
                📋 Todas as Categorias ({produtosValidos.length})
              </button>

              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSelecionada(cat)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: categoriaSelecionada === cat ? '#007bff' : '#f8f9fa',
                    color: categoriaSelecionada === cat ? 'white' : '#495057',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (categoriaSelecionada !== cat) {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (categoriaSelecionada !== cat) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                >
                  🏷️ {String(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ BOTÕES DE AÇÃO */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            paddingTop: '16px',
            borderTop: '2px solid #e9ecef',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                setFiltro("");
                setCategoriaSelecionada("");
                setColuna("nome");
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              🔄 Limpar
            </button>
            <button
              onClick={() => setFiltrosOpen(false)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
              }}
            >
              ✅ Aplicar
            </button>
          </div>
        </div>
      )}

      {/* ✅ OVERLAY PARA FECHAR A BARRA */}
      {filtrosOpen && (
        <div
          onClick={() => setFiltrosOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
        />
      )}

      {/* ✅ LISTA DE PRODUTOS */}
      <div style={{
        padding: '20px',
        paddingRight: filtrosOpen ? '370px' : '20px', // ✅ ESPAÇO PARA BARRA LATERAL
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        transition: 'padding-right 0.3s ease'
      }}>
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map(produto => {
            try {
              return (
                <ProdutoItem
                  key={`produto-${produto.id_produto}`}
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
              : `Nenhum produto disponível`}
          </div>
        )}
      </div>

      {/* ✅ BOTÃO DO CARRINHO */}
      <button
        onClick={() => router.push('/carrinho')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: filtrosOpen ? '370px' : '20px', // ✅ AJUSTAR POSIÇÃO SE BARRA ABERTA
          backgroundColor: '#ff4d4d',
          color: 'white',
          fontSize: '20px',
          padding: '15px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'right 0.3s ease'
        }}
      >
        🛒
      </button>
    </div>
  );
}