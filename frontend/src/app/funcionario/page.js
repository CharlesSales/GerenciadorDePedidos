'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function FuncionarioPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // ✅ Sempre declarado antes de qualquer return
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user && user.tipo !== 'funcionario' && !user.isAdmin) {
      router.push('/login');
    }
  }, [user, router]);

  // ✅ Retornos condicionais só depois dos hooks
  if (!isHydrated) {
    return null;
  }

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
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>
          Carregando...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (

       <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* ✅ HEADER */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333' }}>
              🏪 Dashboard Funcionarios
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Olá, <strong>{user.dados?.nome || user.dados?.nome_restaurante}</strong>!
            </p>
          </div>
        </div>
      </div>

    <div style={{ padding: '20px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div
          onClick={() => router.push('/produtos')}
          style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🍽️</div>
          <h3>Produtos</h3>
          <p>Gerenciar cardápio</p>
        </div>

        <div
          onClick={() => router.push('/pedidos_geral')}
          style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
          <h3>Pedidos</h3>
          <p>Visualizar pedidos</p>
        </div>
        {/* ✅ CONFIGURAÇÕES */}
        <div
          onClick={() => router.push('/pedidos_geral')}
          style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚙️</div>
          <h3>Configurações</h3>
          <p>Ajustes do sistema e restaurante</p>
        </div>
      </div>
    </div>
    </div>
  );
}