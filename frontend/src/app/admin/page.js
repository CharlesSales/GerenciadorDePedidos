'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // ✅ Garantir hidratação
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    logout(); // ✅ Função já implementada no AuthContext
    router.push('/login');
  };

  // ✅ Redirecionar caso não autenticado
  useEffect(() => {
    if (isHydrated && !loading && !user) {
      router.push('/login');
    }
  }, [isHydrated, loading, user, router]);

  // ✅ Loading visual
  if (!isHydrated || loading) {
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

  // ✅ Evita renderizar conteúdo antes do redirecionamento terminar
  if (!user) return null;

  // ✅ Verificação de permissão
  if (!user.isAdmin && user.tipo !== 'restaurante') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>🚫</h1>
        <h2 style={{ color: '#dc3545', margin: 0 }}>Acesso Negado</h2>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Você não tem permissão para acessar esta área.
        </p>
        <button
          onClick={() => router.push('/funcionario')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // ✅ Resto da página (dashboard)
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
              🏪 Dashboard Administrativo
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Olá, <strong>{user.dados?.nome || user.dados?.nome_restaurante}</strong>!
            </p>
          </div>
           <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: '20px',
            padding: '10px 14px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          ⏏️
        </button>
        </div>
        
      </div>

      {/* ✅ MENU DE OPÇÕES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        
        {/* ✅ GESTÃO DE PRODUTOS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/gestaoProdutos')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            📦
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Gestão de Produtos
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Visualizar e gerenciar produtos do restaurante
          </p>
        </div>

        {/* ✅ PEDIDOS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/pedidos')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            📋
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Gerenciar Pedidos
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Visualizar e atualizar status dos pedidos
          </p>
        </div>

        {/* ✅ FUNCIONÁRIOS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/gestaoFuncionarios')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            👥
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Funcionários
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Gerenciar equipe e permissões
          </p>
        </div>

        {/* ✅ RELATÓRIOS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/relatorios')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            📊
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Relatórios
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Análises de vendas e performance
          </p>
        </div>

        {/* ✅ CONFIGURAÇÕES */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/cardapioCliente')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            ⚙️
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Configurações
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Ajustes do sistema e restaurante
          </p>
        </div>

        {/* ✅ CARDÁPIO PÚBLICO */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/produtos')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            🍽️
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Cardápio
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Visualizar como os produtos
          </p>
        </div>

      </div>

      {/* ✅ INFORMAÇÕES DO USUÁRIO */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          ℹ️ Informações da Sessão
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <strong>Tipo de Usuário:</strong><br/>
            <span style={{ color: '#666' }}>
              {user.tipo === 'restaurante' ? '👑 Dono do Restaurante' : '👨‍💼 Funcionário Admin'}
            </span>
          </div>
          
          <div>
            <strong>Nome:</strong><br/>
            <span style={{ color: '#666' }}>
              {user.dados?.nome || user.dados?.nome_restaurante}
            </span>
          </div>
          
          {user.dados?.cargo && (
            <div>
              <strong>Cargo:</strong><br/>
              <span style={{ color: '#666' }}>ID: {user.dados.cargo}</span>
            </div>
          )}
          
        <div>
          <strong>Restaurante:</strong><br/>
          <span style={{ color: '#666' }}>
            {user.dados?.restaurante?.nome_restaurante || 'N/A'}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}