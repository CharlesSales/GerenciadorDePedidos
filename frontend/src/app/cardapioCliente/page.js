'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';

function CardapioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('restaurante');

  const { produtos, handleAdd, handleRemove, carrinho } = useCarrinho();

  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gerenciadordepedidos.onrender.com';

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError({
            tipo: 'ID_INVALIDO',
            titulo: 'URL inválida',
            mensagem: 'Acesse com: /cardapioCliente?restaurante=1',
            acao: 'Voltar ao início'
          });
          return;
        }

        const response = await fetch(`${API_URL}/produtos/restaurante/${id}`);
        if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
        const data = await response.json();

        setRestaurante(data.restaurante);
      } catch (err) {
        setError({
          tipo: 'ERRO_CONEXAO',
          titulo: 'Erro de conexão',
          mensagem: err.message,
          acao: 'Tentar novamente'
        });
      } finally {
        setLoading(false);
      }
    };
    carregarProdutos();
  }, [id, API_URL]);

  useEffect(() => {
    if (carrinho.length > 0 && id) {
      localStorage.setItem(`carrinho_restaurante_${id}`, JSON.stringify(carrinho));
    }
  }, [carrinho, id]);

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

  const itensCarrinho = carrinho.reduce((total, item) => total + item.quantidade, 0);

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            padding: '40px',
            maxWidth: '400px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>
            {error.tipo === 'RESTAURANTE_NAO_ENCONTRADO'
              ? '🏪'
              : error.tipo === 'ID_INVALIDO'
              ? '🔗'
              : '📶'}
          </div>
          <h2 style={{ color: '#2d3436', fontWeight: '700', marginBottom: '10px' }}>
            {error.titulo}
          </h2>
          <p style={{ color: '#636e72', marginBottom: '20px' }}>{error.mensagem}</p>
          <button
            onClick={() => {
              if (error.tipo === 'RESTAURANTE_NAO_ENCONTRADO' || error.tipo === 'ID_INVALIDO') {
                router.push('/');
              } else {
                window.location.reload();
              }
            }}
            style={{
              backgroundColor: '#ff7b00',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ff9500')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff7b00')}
          >
            {error.acao}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 100%)',
        paddingTop: '120px'
      }}
    >
      {/* Barra fixa topo */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderBottom: '2px solid #ffe29f',
          padding: '0.75rem 1rem',
          zIndex: 1000
        }}
      >
        {/* Busca + Carrinho */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              flex: '1 1 60%',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              border: '2px solid #ffc107',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => router.push('/carrinhoCliente')}
              style={{
                backgroundColor: '#ff7b00',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '1.4rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              🛒
            </button>
            {itensCarrinho > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#d63031',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {itensCarrinho}
              </span>
            )}
          </div>
        </div>

        {/* Filtro categorias */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            marginTop: '0.75rem',
            paddingBottom: '0.25rem'
          }}
        >
          <button
            onClick={() => setCategoriaSelecionada('')}
            style={{
              flexShrink: 0,
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: categoriaSelecionada === '' ? '#ff7b00' : '#fff',
              color: categoriaSelecionada === '' ? '#fff' : '#ff7b00',
              boxShadow:
                categoriaSelecionada === '' ? '0 4px 10px rgba(255,123,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                flexShrink: 0,
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: categoriaSelecionada === cat ? '#ff7b00' : '#fff',
                color: categoriaSelecionada === cat ? '#fff' : '#ff7b00',
                boxShadow:
                  categoriaSelecionada === cat
                    ? '0 4px 10px rgba(255,123,0,0.4)'
                    : '0 2px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div
        style={{
          display: 'grid',
          gap: '1.2rem',
          padding: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          maxWidth: '1200px',
          margin: '0 auto',
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

function CardapioLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px', animation: 'bounce 1s infinite' }}>🍽️</div>
        <p style={{ color: '#636e72' }}>Carregando cardápio...</p>
      </div>
    </div>
  );
}

export default function CardapioRestaurante() {
  return (
    <Suspense fallback={<CardapioLoading />}>
      <CardapioContent />
    </Suspense>
  );
}
