'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 ADMIN PAGE - Estado:', {
      loading,
      isAuthenticated,
      user: user ? {
        tipo: user.tipo,
        isAdmin: user.isAdmin,
        nome: user.dados?.nome || user.nome
      } : null
    });

    // ✅ AGUARDAR O LOADING TERMINAR
    if (!loading) {
      // ✅ SE NÃO ESTIVER AUTENTICADO, REDIRECIONAR PARA LOGIN
      if (!isAuthenticated || !user) {
        console.log('❌ Não autenticado, redirecionando para login');
        router.push('/login');
        return;
      }

      // ✅ VERIFICAR SE TEM PERMISSÃO DE ADMIN
      const temPermissaoAdmin = 
        user.tipo === 'restaurante' || 
        user.isAdmin === true ||
        user.dados?.isAdmin === true;

      if (!temPermissaoAdmin) {
        console.log('❌ Sem permissão de admin, redirecionando para funcionário');
        router.push('/funcionario');
        return;
      }

      console.log('✅ Usuário tem permissão de admin');
    }
  }, [user, router, isAuthenticated, loading]);

  // ✅ MOSTRAR LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
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
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>Verificando permissões...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ SE NÃO ESTIVER AUTENTICADO, NÃO RENDERIZAR CONTEÚDO
  if (!isAuthenticated || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Redirecionando para login...</p>
      </div>
    );
  }

  // ✅ VERIFICAR PERMISSÃO NOVAMENTE ANTES DE RENDERIZAR
  const temPermissaoAdmin = 
    user.tipo === 'restaurante' || 
    user.isAdmin === true ||
    user.dados?.isAdmin === true;

  if (!temPermissaoAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Redirecionando...</p>
      </div>
    );
  }

  // ✅ FUNÇÃO DE LOGOUT COM CONFIRMAÇÃO
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  // ✅ OBTER NOME DO USUÁRIO CORRETAMENTE
  const nomeUsuario = user.dados?.nome || user.nome || 'Administrador';

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0', color: '#333' }}>🏪 Painel Administrativo</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Área restrita para administradores
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>
              Olá, {nomeUsuario}!
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {user.isAdmin ? '👑 Administrador' : '🏪 Restaurante'}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff3333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4d'}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* ✅ CARD PRODUTOS */}
        <div 
          onClick={() => router.push('/produtos')}
          style={{
            padding: '30px',
            border: 'none',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🍽️</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Produtos</h3>
          <p style={{ margin: '0', color: '#666' }}>Gerenciar cardápio e preços</p>
        </div>

        {/* ✅ CARD PEDIDOS */}
        <div 
          onClick={() => router.push('/pedidos_geral')}
          style={{
            padding: '30px',
            border: 'none',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>📋</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Pedidos</h3>
          <p style={{ margin: '0', color: '#666' }}>Visualizar e gerenciar pedidos</p>
        </div>

        {/* ✅ CARD FUNCIONÁRIOS */}
        <div 
          onClick={() => router.push('/funcionarios')}
          style={{
            padding: '30px',
            border: 'none',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>👥</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Funcionários</h3>
          <p style={{ margin: '0', color: '#666' }}>Gerenciar equipe e cargos</p>
        </div>

        {/* ✅ CARD RELATÓRIOS */}
        <div 
          onClick={() => router.push('/relatorios')}
          style={{
            padding: '30px',
            border: 'none',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>📊</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Relatórios</h3>
          <p style={{ margin: '0', color: '#666' }}>Análises e estatísticas</p>
        </div>
      </div>

      {/* ✅ DEBUG INFO */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '10px',
        fontSize: '12px'
      }}>
        <strong>🔧 Debug Info:</strong>
        <pre style={{ margin: '10px 0', overflow: 'auto' }}>
          {JSON.stringify({
            isAuthenticated,
            tipo: user?.tipo,
            isAdmin: user?.isAdmin,
            nome: nomeUsuario,
            temPermissao: temPermissaoAdmin
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}