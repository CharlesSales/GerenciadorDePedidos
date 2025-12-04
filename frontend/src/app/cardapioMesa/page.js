'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';

function CardapioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ CORREÇÃO: Buscar pelos parâmetros corretos
  const id_restaurante = searchParams.get('id_restaurante');
  const id_mesa = searchParams.get('id_mesa');

  ('📦 Parâmetros recebidos:', { id_restaurante, id_mesa });

  const { handleAdd, handleRemove, carrinho } = useCarrinho();

  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [restaurante, setRestaurante] = useState(null);
  const [produtosRestaurante, setProdutosRestaurante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gerenciadordepedidos.onrender.com';

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ CORREÇÃO: Verificar se ambos os parâmetros existem
        if (!id_restaurante || !id_mesa) {
          setError({
            tipo: 'ID_INVALIDO',
            titulo: 'URL inválida',
            mensagem: 'Acesse com: /cardapioMesa?id_restaurante=1&id_mesa=1',
            acao: 'Voltar ao início'
          });
          return;
        }

        (`🌐 Fazendo requisição: ${API_URL}/produtos/mesa/${id_restaurante}/${id_mesa}`);

        // ✅ CORREÇÃO: Usar os parâmetros corretos na requisição
        const response = await fetch(`${API_URL}/produtos/mesa/${id_restaurante}/${id_mesa}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        ('📦 Dados recebidos:', data);

        // ✅ CORREÇÃO: Verificar diferentes estruturas de resposta
        if (data.success) {
          // Estrutura com success: true
          setRestaurante(data.restaurante);
          setProdutosRestaurante(data.produtos || []);
        } else if (data.produtos || Array.isArray(data)) {
          // ✅ FALLBACK: Estrutura direta ou com produtos
          setProdutosRestaurante(Array.isArray(data) ? data : (data.produtos || []));
          
          // Se tem informações do restaurante
          if (data.restaurante) {
            setRestaurante(data.restaurante);
          } else if (data.mesa) {
            setRestaurante({ nome: `Restaurante ${id_restaurante}` });
          }
        } else if (data.data) {
          // ✅ FALLBACK: Estrutura com data
          setProdutosRestaurante(data.data || []);
          setRestaurante({ nome: `Restaurante ${id_restaurante}` });
        } else {
          console.warn('⚠️ Estrutura de resposta inesperada:', data);
          // ✅ TENTAR USAR A RESPOSTA MESMO ASSIM
          setProdutosRestaurante([]);
          setRestaurante({ nome: `Restaurante ${id_restaurante}` });
        }

      } catch (err) {
        console.error('❌ Erro ao carregar produtos:', err);
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
  }, [id_restaurante, id_mesa, API_URL]);

  useEffect(() => {
    // ✅ CORREÇÃO: Usar id_restaurante para o localStorage
    if (carrinho.length > 0 && id_restaurante) {
      localStorage.setItem(`carrinho_restaurante_${id_restaurante}`, JSON.stringify(carrinho));
    }
  }, [carrinho, id_restaurante]);

  // ✅ LOADING STATE
  if (loading) {
    return <CardapioLoading />;
  }

  // ---------------------- FILTROS ----------------------------
  const categorias = [...new Set(produtosRestaurante.map(p => p.categoria?.categoria_nome).filter(Boolean))];

  const produtosFiltrados = produtosRestaurante.filter(produto => {
    const passaCategoria = categoriaSelecionada
      ? produto.categoria?.categoria_nome === categoriaSelecionada
      : true;

    const passaBusca = busca
      ? produto.nome.toLowerCase().includes(busca.toLowerCase())
      : true;

    return passaCategoria && passaBusca;
  });

  const itensCarrinho = carrinho.reduce((total, item) => total + item.quantidade, 0);

  // ---------------------- ERRO ----------------------------
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
            {error.tipo === 'ID_INVALIDO' ? '🔗' : '📶'}
          </div>
          <h2 style={{ color: '#2d3436', fontWeight: '700', marginBottom: '10px' }}>
            {error.titulo}
          </h2>
          <p style={{ color: '#636e72', marginBottom: '20px' }}>{error.mensagem}</p>

          <button
            onClick={() => {
              if (error.tipo === 'ID_INVALIDO') {
                router.push('/admin');
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
              cursor: 'pointer'
            }}
          >
            {error.acao}
          </button>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR INFORMAÇÕES DA MESA
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 100%)',
        paddingTop: '140px'
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
        {/* ✅ MOSTRAR INFORMAÇÕES DA MESA */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          color: '#333',
          fontWeight: 'bold'
        }}>
          🍽️ Numero da Mesa {id_mesa}
        </div>

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
              onClick={() => router.push(`/carrinhoMesa?id_restaurante=${id_restaurante}&id_mesa=${id_mesa}`)}
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

        {/* Categorias */}
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
              boxShadow: categoriaSelecionada === '' 
                ? '0 4px 10px rgba(255,123,0,0.4)' 
                : '0 2px 6px rgba(0,0,0,0.1)',
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
                boxShadow: categoriaSelecionada === cat
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

      {/* Lista de produtos */}
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
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <ProdutoItem
              key={produto.id_produto}
              produto={produto}
              adicionarAoCarrinho={handleAdd}
              removeDoCarrinho={handleRemove}
            />
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            gridColumn: '1 / -1',
            padding: '40px'
          }}>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente ajustar os filtros ou entre em contato com o restaurante.</p>
          </div>
        )}
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
        <div style={{ fontSize: '40px', marginBottom: '10px', animation: 'bounce 1s infinite' }}>
          🍽️
        </div>
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
