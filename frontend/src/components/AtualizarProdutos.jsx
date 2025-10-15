'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AtualizarProdutos() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading } = useAuth();

  const [id, setId] = useState('');
  const [campo, setCampo] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);  // ✅ CONTROLE DE HIDRATAÇÃO


  const [cargos, setCargos] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);

  const camposDisponiveis = ['nome', 'descricao', 'preco', 'imagem', 'cozinha', 'estoque', 'restaurante', 'categoria'];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  // ✅ CONTROLAR HIDRATAÇÃO
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ✅ VERIFICAR AUTENTICAÇÃO APÓS HIDRATAÇÃO
  useEffect(() => {
    if (isHydrated && !loading) {
      console.log('🔍 Verificando autenticação:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user
      });

      if (!isAuthenticated || !token) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      console.log('✅ Usuário autenticado:', user?.dados?.nome);
    }
  }, [isHydrated, loading, isAuthenticated, token, user, router]);

  // ✅ VERIFICAR AUTENTICAÇÃO APÓS HIDRATAÇÃO (CONTINUAÇÃO)
  useEffect(() => {
    if (isHydrated && !loading) {
      console.log('🔍 Verificando autenticação:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user
      });

      if (!isAuthenticated || !token) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      console.log('✅ Usuário autenticado:', user?.dados?.nome);
    }
  }, [isHydrated, loading, isAuthenticated, token, user, router]);


  // Buscar cargos e restaurantes ao montar o componente
   useEffect(() => {
    const fetchDados = async () => {
      try {
        const resCargos = await fetch(`${API_URL}/produtos`);
        const dataCargos = await resCargos.json();
        setCargos(dataCargos.map(c => ({ ...c, nome_cargo: c.nome_cargo.trim() })));
      } catch (err) {
        console.error('Erro ao carregar cargos ou restaurantes', err);
      }
    };
    fetchDados();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');

    try {
     const res = await fetch(`${API_URL}/funcionarios/${id}/${campo}/${encodeURIComponent(novoValor)}`, {
            method: 'PUT', // ✅ MÉTODO CORRETO
            headers: {
            'Authorization': `Bearer ${token}`, // ✅ TOKEN DE AUTENTICAÇÃO
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
        campo: campo,
        novoValor: novoValor
      })
    });
    
    if (res.status === 200) {
        setMensagem('✅ Funcionário atualizado com sucesso!');
        setTimeout(() => router.push('/gestaoFuncionarios'), 1500);
      } else {
        setMensagem(`⚠️ ${res.data?.error || 'Erro ao atualizar funcionário'}`);
      }
    } catch (err) {
      console.error(err);
      setMensagem('⚠️ Erro inesperado ao atualizar funcionário');
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
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>Atualizar Produto</h1>
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
          <input
            type="text"
            placeholder="ID do Funcionário"
            value={id}
            onChange={e => setId(e.target.value)}
            required
            style={inputStyle}
          />

          <select
            value={campo}
            onChange={e => { setCampo(e.target.value); setNovoValor(''); }}
            required
            style={inputStyle}
          >
            <option value="">Selecione um campo</option>
            {camposDisponiveis.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {/* Se for cargo ou restaurante, mostrar select com os existentes */}
          {['cargo', 'restaurante'].includes(campo) ? (
            <select
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecione {campo}</option>
              {campo === 'cargo' && cargos.map(c => (
                <option key={c.id} value={c.nome_cargo}>
                    {c.nome_cargo}
                </option>
                ))}

              {campo === 'restaurante' && restaurantes.map(r => (
                <option key={r.id} value={r.id}>{r.nome_restaurante}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Novo Valor"
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: carregando ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: carregando ? 'not-allowed' : 'pointer'
            }}
          >
            {carregando ? '⏳ Atualizando...' : '🚀 Atualizar'}
          </button>
        </form>

        <button
          onClick={() => router.push('/gestaoFuncionarios')}
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
          ← Voltar
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
