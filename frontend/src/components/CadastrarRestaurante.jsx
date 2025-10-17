'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarRestaurante() {
  const router = useRouter();

  
  const [nome_restaurante, setNome_restaurante] = useState('');
  const [usuario, setUsuario] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [numero_endereco, setNumero_endereco] = useState('');
  const [rua, setRua] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');


  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


    const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // ✅ VALIDAÇÃO CORRETA DOS CAMPOS
    if (!nome_restaurante || !usuario || !estado || !cidade || !numero_endereco || !rua || !senha || !confirmarSenha) {
      setErrorMsg('Todos os campos são obrigatórios.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMsg('As senhas não conferem.');
      return;
    }

    if (senha.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      console.log('📤 Enviando dados:', {
        nome_restaurante,
        usuario,
        estado,
        cidade,
        numero_endereco,
        rua
      });

      const response = await fetch(`${API_URL}/restaurante/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // ✅ REMOVIDO Authorization pois é cadastro público
        },
        body: JSON.stringify({
          nome_restaurante,
          usuario,
          senha,
          estado,
          cidade,
          numero_endereco,
          rua,
          confirmarSenha
        })
      });

      const data = await response.json();
      console.log('📥 Resposta do servidor:', data);

      if (!response.ok) {
        setErrorMsg(data.msg || data.error || 'Erro ao cadastrar restaurante');
      } else {
        setSuccessMsg('Restaurante cadastrado com sucesso! Redirecionando...');
        
        // ✅ LIMPAR CAMPOS
        setNome_restaurante('');
        setUsuario('');
        setEstado('');
        setCidade('');
        setNumero_endereco('');
        setRua('');
        setSenha('');
        setConfirmarSenha('');

        // ✅ REDIRECIONAR PARA LOGIN
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro ao cadastrar restaurante:', error);
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
          <div style={{ fontSize: '30px', marginBottom: '16px' }}>👨‍💼</div>
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
          <input type="text" placeholder="Nome do restaurante" value={nome_restaurante} onChange={e => setNome_restaurante(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Usuário" value={usuario} onChange={e => setUsuario(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Estado" value={estado} onChange={e => setEstado(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="cidade" value={cidade} onChange={e => setCidade(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Numero" value={numero_endereco} onChange={e => setNumero_endereco(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Rua" value={rua} onChange={e => setRua(e.target.value)} style={inputStyle} />
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
          onClick={() => router.push('/login')}
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
