'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [couvertStatus, setCouvertStatus] = useState(null);
  const couvert = user?.dados?.restaurante?.taxaCouvert;
  const id_restaurante = user?.dados?.restaurante?.id_restaurante
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
  
  console.log(user)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // ✅ Redirecionar caso não autenticado
  useEffect(() => {
    if (isHydrated && !loading && !user) {
      router.push('/login');
    }
  }, [isHydrated, loading, user, router]);


  useEffect(() => {
    if (couvert !== undefined) {
      setCouvertStatus(couvert);
    }
  }, [couvert]);


  const buscarStatusCouvert = async () => {
    try {
      const token = localStorage.getItem('token');

      // ✅ Usar a rota correta conforme suas rotas
      const response = await fetch(`${API_URL}/restaurante/restaurantes/couvert/${id_restaurante}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error("❌ Erro ao buscar couvert");
        // ✅ Se falhar, usar o valor do contexto como fallback
        setCouvertStatus(couvert);
        return;
      }

      const data = await response.json();
      // ✅ Verificar se data é array ou objeto
      const taxaCouvert = Array.isArray(data) ? data[0]?.taxaCouvert : data?.taxaCouvert;


      // Converte CORRETAMENTE qualquer tipo de retorno
      const statusBoolean = taxaCouvert === true || taxaCouvert === "true" || taxaCouvert === 1 || taxaCouvert === "1";

      setCouvertStatus(statusBoolean);

    } catch (error) {
      console.error("❌ Erro ao buscar status do couvert:", error);
      // ✅ Se der erro, usar o valor do contexto
      setCouvertStatus(couvert);
    }
  };
  useEffect(() => {
    if (user && id_restaurante) {
      buscarStatusCouvert();
    }
  }, [user, id_restaurante]);


  const handleatualizarStatusCouvert = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Token não encontrado");

      const novoStatus = !couvertStatus;

      const response = await fetch(`${API_URL}/restaurante`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: novoStatus,
          id: id_restaurante,
        }),
      });

      if (!response.ok) {
        alert("Erro ao atualizar couvert");
        return;
      }

      const result = await response.json();

      // Atualiza o estado local imediatamente
      setCouvertStatus(novoStatus);

      // ✅ Buscar novamente para confirmar
      setTimeout(() => {
        buscarStatusCouvert();
      }, 500);

    } catch (error) {
      console.error(error);
      alert("Erro inesperado");
    }
  };


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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Couvert</span>
            <div
              onClick={handleatualizarStatusCouvert}
              style={{
                width: '50px',
                height: '26px',
                backgroundColor: couvertStatus ? '#28a745' : '#ccc',
                borderRadius: '13px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '1px',
                  left: couvertStatus ? '27px' : '3px',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            </div>
            <span style={{
              fontSize: '12px',
              color: couvertStatus ? '#28a745' : '#6c757d',
              fontWeight: 'bold'
            }}>
              {couvertStatus ? 'ON' : 'OFF'}
            </span>
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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* ✅ BOTÕES PRINCIPAIS - CARDÁPIO E PEDIDOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {/* ✅ CARDÁPIO PÚBLICO - PRINCIPAL */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            border: '2px solid #007bff'
          }}
            onClick={() => router.push('/produtos')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
          >
            <div style={{ fontSize: '64px', textAlign: 'center', marginBottom: '20px' }}>
              🍽️
            </div>
            <h2 style={{ margin: 0, textAlign: 'center', marginBottom: '12px', fontSize: '24px', color: '#007bff' }}>
              Cardápio
            </h2>
            <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '16px' }}>
              Faça o pedido no caixa
            </p>
          </div>

          {/* ✅ PEDIDOS - PRINCIPAL */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            border: '2px solid #28a745'
          }}
            onClick={() => router.push('/pedidos_geral')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
          >
            <div style={{ fontSize: '64px', textAlign: 'center', marginBottom: '20px' }}>
              📋
            </div>
            <h2 style={{ margin: 0, textAlign: 'center', marginBottom: '12px', fontSize: '24px', color: '#28a745' }}>
              Gerenciar Pedidos
            </h2>
            <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '16px' }}>
              Visualizar e atualizar status dos pedidos em tempo real
            </p>
          </div>
        </div>

        {/* ✅ BOTÕES SECUNDÁRIOS */}
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

          {/* ✅ GESTÃO DE MESAS */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
            onClick={() => {
              if (!id_restaurante) {
                alert('❌ ID do restaurante não encontrado!');
                console.error('❌ Dados do usuário:', user);
                return;
              }
              router.push(`/gestaoMesa`);
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
              🪑
            </div>
            <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
              Gestão de Mesas
            </h3>
            <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
              Visualizar QR codes das mesas
            </p>
          </div>
        </div>
      </div>

        {/* ✅ RELATÓRIOS
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

       
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
          onClick={() => {
            ('🔗 Navegando para cardápio com ID:', id_restaurante);
            ('🔗 URL completa:', `/cardapioCliente?restaurante=${id_restaurante}`);

            if (!id_restaurante) {
              alert('❌ ID do restaurante não encontrado!');
              console.error('❌ Dados do usuário:', user);
              return;
            }

            router.push(`/cardapioCliente?restaurante=${id_restaurante}`);
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            ⚙️
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Ver Cardápio ({id_restaurante || 'ID?'})
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Visualizar cardápio do restaurante
          </p>
        </div> */}

       

        {/* ✅ CARDÁPIO PÚBLICO */}
        {/* <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
          onClick={() => {
            ('🔗 Navegando para cardápio da mesa');
            ('🏪 ID Restaurante:', id_restaurante);
            ('🪑 ID Mesa:', 1);

            if (!id_restaurante) {
              alert('❌ ID do restaurante não encontrado!');
              console.error('❌ Dados do usuário:', user);
              return;
            }

            // ✅ CORREÇÃO: URL com query parameters corretos
            router.push(`/cardapioMesa?id_restaurante=${id_restaurante}&id_mesa=1`);
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            🍽️
          </div>
          <h3 style={{ margin: 0, textAlign: 'center', marginBottom: '8px' }}>
            Testar Cardápio Mesa
          </h3>
          <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '14px' }}>
            Ver produtos como cliente da mesa 1
          </p>
        </div> */}

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
            <strong>Tipo de Usuário:</strong><br />
            <span style={{ color: '#666' }}>
              {user.tipo === 'restaurante' ? '👑 Dono do Restaurante' : '👨‍💼 Funcionário Admin'}
            </span>
          </div>

          <div>
            <strong>Nome:</strong><br />
            <span style={{ color: '#666' }}>
              {user.dados?.nome || user.dados?.nome_restaurante}
            </span>
          </div>

          {user.dados?.cargo && (
            <div>
              <strong>Cargo:</strong><br />
              <span style={{ color: '#666' }}>ID: {user.dados.cargo.nome_cargo}</span>
            </div>
          )}

          <div>
            <strong>Restaurante:</strong><br />
            <span style={{ color: '#666' }}>
              {user.dados?.restaurante?.nome_restaurante || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}