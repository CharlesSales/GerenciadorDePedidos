'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarMesa({ token }) {
  const router = useRouter(); 
  const [numeroMesa, setNumeroMesa] = useState('')  
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
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      const response = await fetch(`${API_URL}/mesa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ numeroMesa, restaurante })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.msg || data.error || 'Erro ao cadastrar Mesa');
      } else {
        setSuccessMsg('Mesa cadastrado com sucesso!');


     setTimeout(() => {
          router.push('/admin'); // ou a rota do painel de admin
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao cadastrar mesa:', error);
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}></div>
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>Nova Mesa</h1>
        
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
          <input type="text" placeholder="Numero da mesa" value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)} style={inputStyle} />

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
          onClick={() => router.push('/gestaoMesa')}
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
