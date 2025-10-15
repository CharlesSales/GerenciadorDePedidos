'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarFuncionario({ token }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [restaurante, setRestaurante] = useState(''); // restaurante do usuário
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ Extrair restaurante do token
  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // decodifica token JWT
      setRestaurante(payload.restaurante_id); // define o restaurante do usuário logado
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nome || !usuario || !cargo || !senha || !confirmarSenha) {
      setErrorMsg('Todos os campos são obrigatórios.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMsg('As senhas não conferem.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      const response = await fetch(`${API_URL}/funcionarios/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, usuario, cargo, restaurante, senha, confirmarSenha })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.msg || data.error || 'Erro ao cadastrar funcionário');
      } else {
        setSuccessMsg('Funcionário cadastrado com sucesso!');
        setNome('');
        setUsuario('');
        setCargo('');
        setSenha('');
        setConfirmarSenha('');

     setTimeout(() => {
          router.push('/admin'); // ou a rota do painel de admin
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      setErrorMsg('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍💼</div>
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>Novo Funcionário</h1>
          <p style={{ color: '#6c757d', margin: '8px 0 0 0' }}>Cadastro</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Usuário" value={usuario} onChange={e => setUsuario(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Cargo" value={cargo} onChange={e => setCargo(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} style={inputStyle} />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            backgroundColor: loading ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '⏳ Cadastrando...' : '🚀 Cadastrar'}
          </button>
        </form>

        <button
          onClick={() => router.push('/funcionarios')}
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
  boxSizing: 'border-box'
};
