'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar se é admin
    if (!user || (user.tipo !== 'funcionario' && !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>🏪 Painel Administrativo</h1>
        <div>
          <span>Olá, {user.nome}!</span>
          <button 
            onClick={logout}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px',
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
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
            backgroundColor: '#f9f9f9',
            ':hover': { backgroundColor: '#f0f0f0' }
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
      </div>
    </div>
  );
}