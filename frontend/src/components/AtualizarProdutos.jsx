'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AtualizarProdutos() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading } = useAuth();

  const [id, setId] = useState('');
  const [campo, setCampo] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [produtoNome, setProdutoNome] = useState(''); // ✅ NOVO: Nome do produto

  const [categorias, setCategorias] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);

  const camposDisponiveis = ['nome', 'descricao', 'preco', 'imagem', 'cozinha', 'estoque', 'categoria'];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');

  useEffect(() => {
    if (idFromUrl) {
      setId(idFromUrl);
      // ✅ BUSCAR NOME DO PRODUTO
      buscarProduto(idFromUrl);
    }
  }, [idFromUrl]);

  // ✅ FUNÇÃO PARA BUSCAR DADOS DO PRODUTO
  const buscarProduto = async (produtoId) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${produtoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const produto = await response.json();
        setProdutoNome(produto.nome || 'Produto não encontrado');
      } else {
        setProdutoNome('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setProdutoNome('Erro ao carregar produto');
    }
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !loading) {
      ('🔍 Verificando autenticação:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user
      });

      if (!isAuthenticated || !token) {
        ('❌ Usuário não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      ('✅ Usuário autenticado:', user?.dados?.nome);
    }
  }, [isHydrated, loading, isAuthenticated, token, user, router]);

  // ✅ BUSCAR CATEGORIAS E RESTAURANTES
  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Buscar categorias
        const resCategorias = await fetch(`${API_URL}/categoria`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          setCategorias(dataCategorias);
        }
        // Buscar restaurantes
        const resRestaurantes = await fetch(`${API_URL}/restaurante`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (resRestaurantes.ok) {
          const dataRestaurantes = await resRestaurantes.json();
          setRestaurantes(dataRestaurantes);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    if (token) {
      fetchDados();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');

    (`Testando update: \nid:${id}\ncampo: ${campo}\nnovo valor: ${novoValor}`);

    try {
      const res = await fetch(`${API_URL}/produtos/${id}/${campo}/${encodeURIComponent(novoValor)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campo: campo,
          novoValor: novoValor
        })
      });

      if (res.status === 200) {
        setMensagem('✅ Produto atualizado com sucesso!');
        setTimeout(() => router.push('/gestaoProdutos'), 1500);
      } else {
        const errorData = await res.json();
        setMensagem(`⚠️ ${errorData?.error || 'Erro ao atualizar produto'}`);
      }
    } catch (err) {
      console.error(err);
      setMensagem('⚠️ Erro inesperado ao atualizar produto');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>
            Atualizar Produto
          </h1>
          {/* ✅ MOSTRAR NOME DO PRODUTO */}
          {produtoNome && (
            <p style={{
              margin: '8px 0 0 0',
              color: '#6c757d',
              fontSize: '28px',
              fontWeight: '500'
            }}>
              {produtoNome}
            </p>
          )}
        </div>

        {mensagem && (
          <div style={{
            backgroundColor: mensagem.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: mensagem.startsWith('✅') ? '#155724' : '#721c24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* ✅ INPUT PARA ID (se não vier da URL) */}
          {!idFromUrl && (
            <input
              type="text"
              placeholder="ID do Produto"
              value={id}
              onChange={e => setId(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <select
            value={campo}
            onChange={e => { setCampo(e.target.value); setNovoValor(''); }}
            required
            style={inputStyle}
          >
            <option value="">Selecione um campo</option>
            {camposDisponiveis.map(c => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          {/* ✅ CAMPO DINÂMICO BASEADO NA SELEÇÃO */}
          {campo === 'categoria' ? (
            <select
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.categoria_nome}
                </option>
              ))}
            </select>
          ) : campo === 'restaurante' ? (
            <select
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecione um restaurante</option>
              {restaurantes.map(r => (
                <option key={r.id_restaurante} value={r.id_restaurante}>
                  {r.nome_restaurante}
                </option>
              ))}
            </select>
          ) : campo === 'preco' ? (
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço (ex: 15.90)"
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            />
          ) : campo === 'estoque' ? (
            <input
              type="number"
              min="0"
              placeholder="Quantidade em estoque"
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            />
          ) : campo === 'cozinha' ? (
            <select
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecione a cozinha</option>
              <option value="Doce">Doce</option>
              <option value="Salgada">Salgada</option>
              <option value="Ambas">Ambas</option>
            </select>
          ) : campo ? (
            <input
              type={campo === 'imagem' ? 'url' : 'text'}
              placeholder={
                campo === 'nome' ? 'Nome do produto' :
                  campo === 'descricao' ? 'Descrição do produto' :
                    campo === 'imagem' ? 'URL da imagem' :
                      'Novo valor'
              }
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            />
          ) : null}

          <button
            type="submit"
            disabled={carregando || !id || !campo || !novoValor}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor:
                carregando || !id || !campo || !novoValor
                  ? '#6c757d'
                  : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor:
                carregando || !id || !campo || !novoValor
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            {carregando ? '⏳ Atualizando...' : '🚀 Atualizar Produto'}
          </button>
        </form>

        <button
          onClick={() => router.push('/gestaoProdutos')}
          style={{
            marginTop: '20px',
            backgroundColor: '#6c757d',
            color: 'white',
            padding: '12px',
            width: '100%',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Voltar para Gestão de Produtos
        </button>
      </div>
    </div>
  );
}

// Estilo comum para os inputs
const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  fontSize: '16px',
  boxSizing: 'border-box',
  backgroundColor: 'white'
};