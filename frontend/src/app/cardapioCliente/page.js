'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProdutoItem from '@/components/ProdutoItem';
import { useCarrinho } from '@/context/CarrinhoContext';

// ✅ COMPONENTE INTERNO QUE USA useSearchParams
function CardapioContent() {
  const searchParams = useSearchParams(); // ← AGORA DENTRO DO SUSPENSE
  const router = useRouter();

  // ✅ PEGAR ID DO QUERY PARAM
  const id = searchParams.get('restaurante');

  const { produtos, handleAdd, handleRemove, carrinho } = useCarrinho();

  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  // ✅ CARREGAR PRODUTOS DO RESTAURANTE
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 ID do restaurante:', id);
        console.log('🔄 URL da API:', API_URL);

        if (!id) {
          console.log('❌ ID do restaurante não encontrado na URL');
          setError({
            tipo: 'ID_INVALIDO',
            titulo: 'URL inválida',
            mensagem: 'Acesse com: /cardapioCliente?restaurante=1',
            acao: 'Voltar ao início'
          });
          return;
        }

        const url = `${API_URL}/produtos/restaurante/${id}`;
        console.log('🔄 Fazendo requisição para:', url);

        const response = await fetch(url);

        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Response OK:', response.ok);

        if (!response.ok) {
          console.log('❌ Resposta não OK, status:', response.status);

          let errorData;
          try {
            errorData = await response.json();
            console.log('❌ Dados do erro:', errorData);
          } catch (parseError) {
            console.log('❌ Erro ao fazer parse do JSON:', parseError);
            errorData = { error: 'Erro desconhecido' };
          }

          if (response.status === 404) {
            setError({
              tipo: 'RESTAURANTE_NAO_ENCONTRADO',
              titulo: 'Restaurante não encontrado',
              mensagem: 'Este restaurante não existe ou foi removido.',
              acao: 'Voltar ao início'
            });
            return;
          }

          throw new Error(errorData.error || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        setRestaurante(data.restaurante);

        console.log(`✅ ${data.produtos?.length || 0} produtos carregados`);

      } catch (err) {
        console.error('❌ Erro detalhado:', err);

        setError({
          tipo: 'ERRO_CONEXAO',
          titulo: 'Erro de conexão',
          mensagem: `Erro: ${err.message}`,
          acao: 'Tentar novamente'
        });
      } finally {
        setLoading(false);
      }
    };

    carregarProdutos();
  }, [id, API_URL]);

  // ✅ SALVAR CARRINHO NO LOCALSTORAGE
  useEffect(() => {
    if (carrinho.length > 0 && id) {
      localStorage.setItem(`carrinho_restaurante_${id}`, JSON.stringify(carrinho));
    }
  }, [carrinho, id]);

  // ✅ ALTERAR QUANTIDADE
  const alterarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    setCarrinho(carrinhoAtual =>
      carrinhoAtual.map(item =>
        item.id_produto === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  };

  // ✅ FILTROS
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

  // ✅ CALCULAR TOTAIS
  const totalCarrinho = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  const itensCarrinho = carrinho.reduce((total, item) => total + item.quantidade, 0);

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">
            {error.tipo === 'RESTAURANTE_NAO_ENCONTRADO' ? '🏪' :
              error.tipo === 'RESTAURANTE_INATIVO' ? '⏰' :
                error.tipo === 'ID_INVALIDO' ? '🔗' : '📶'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error.titulo}
          </h2>
          <p className="text-gray-600 mb-6">
            {error.mensagem}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (error.tipo === 'RESTAURANTE_NAO_ENCONTRADO' || error.tipo === 'ID_INVALIDO') {
                  router.push('/');
                } else {
                  window.location.reload();
                }
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {error.acao}
            </button>
            <p className="text-xs text-gray-400">
              ID: {id} | API: {API_URL}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            alignItems: 'center',
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => router.push('/carrinhoCliente')}
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
            {itensCarrinho > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {itensCarrinho}
              </span>
            )}
          </div>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // ✅ PRODUTOS MAIS LARGOS
          maxWidth: '1200px', // ✅ MÁXIMO 3 COLUNAS
          margin: '0 auto',
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

// ✅ LOADING COMPONENT PARA SUSPENSE
function CardapioLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🍽️</div>
        <p className="text-gray-600">Carregando cardápio...</p>
      </div>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL COM SUSPENSE
export default function CardapioRestaurante() {
  return (
    <Suspense fallback={<CardapioLoading />}>
      <CardapioContent />
    </Suspense>
  );
}