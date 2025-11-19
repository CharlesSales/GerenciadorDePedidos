'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    cpf: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('usuario');
  const [rememberMe, setRememberMe] = useState(false);

  const usuarioFormatado = formData.usuario.trim().replace(/\s+/g, '');
  const senhaFormatada = formData.senha.trim();


  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log('👤 Usuário encontrado no useEffect:', user);
      redirectUser(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const redirectUser = (userData) => {
    console.log('🔄 REDIRECIONAMENTO - Usuário:', {
      tipo: userData.tipo,
      isAdmin: userData.isAdmin,
      nome: userData.dados?.nome || userData.dados?.nome_restaurante,
      cargo: userData.dados?.cargo
    });

    setIsLoading(false);

    let destino = '/login';

    if (userData.tipo === 'cliente') {
      destino = `/restaurante/${userData.restaurante?.id_restaurante || 1}/cardapio`;
    } else if (userData.tipo === 'restaurante') {
      destino = '/admin';
    } else if (userData.tipo === 'funcionario') {
      if (userData.isAdmin) {
        destino = '/admin';
      } else {
        destino = '/funcionario';
      }
    }

    console.log('🎯 Redirecionando para:', destino);
    router.push(destino);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginMode === 'usuario') {
        if (!formData.usuario || !formData.senha) {
          setError('Usuário e senha são obrigatórios');
          return;
        }

        console.log('📝 Tentativa de login funcionário/restaurante:', formData.usuario);

        let result = await login(usuarioFormatado, senhaFormatada, 'funcionario');

        if (!result.success) {
          console.log('🔄 Tentando como restaurante...');
          result = await login(usuarioFormatado, senhaFormatada, 'restaurante');
        }

        if (result.success) {
          console.log('✅ Login realizado com sucesso!');
        } else {
          setError(result.error || 'Usuário ou senha inválidos');
        }
      } else {
        setError('Login de cliente ainda não implementado');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastro = () => {
    console.log('📝 Navegando para cadastro...');
    router.push('/cadastrarRestaurante');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>

      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.01) 50%, transparent 60%)
        `,
        zIndex: 1
      }} />

      {/* Logo e Título - MOVIDO PARA DENTRO DO CARD */}
      {/* Card de Login */}
      <div style={{
        background: 'rgba(52, 73, 94, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px 50px 50px 50px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3)',
        zIndex: 2
      }}>

        {/* Logo e Título DENTRO do card */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '40px'
        }}>
          {/* Logo Icon */}
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 20px auto',
            background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            🍽️
          </div>

          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '300',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#ecf0f1'
          }}>
            FoodFlow
          </h1>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '12px',
            color: '#bdc3c7',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Management
          </p>
        </div>

        {/* Abas de Perfil */}
        <div style={{
          display: 'flex',
          marginBottom: '30px',
          backgroundColor: 'rgba(44, 62, 80, 0.6)',
          borderRadius: '12px',
          padding: '6px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <button
            type="button"
            onClick={() => {
              setLoginMode('usuario');
              setFormData({ usuario: '', senha: '', cpf: '' });
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: loginMode === 'usuario' ? 'rgba(231, 76, 60, 0.8)' : 'transparent',
              color: loginMode === 'usuario' ? '#fff' : '#bdc3c7',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Funcionário
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('cpf');
              setFormData({ usuario: '', senha: '', cpf: '' });
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: loginMode === 'cpf' ? 'rgba(231, 76, 60, 0.8)' : 'transparent',
              color: loginMode === 'cpf' ? '#fff' : '#bdc3c7',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Cliente
          </button>
        </div>

        {/* Título do Login */}
        <h2 style={{
          textAlign: 'center',
          color: '#ecf0f1',
          fontSize: '22px',
          fontWeight: '300',
          margin: '0 0 30px 0',
          letterSpacing: '1px'
        }}>
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Campo Usuário */}
          {loginMode === 'usuario' && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '400',
                color: '#bdc3c7',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Username
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleInputChange}
                placeholder="Digite seu usuário"
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  backgroundColor: 'rgba(236, 240, 241, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#ecf0f1',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.15)';
                  e.target.style.borderColor = 'rgba(231, 76, 60, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          )}

          {/* Campo CPF */}
          {loginMode === 'cpf' && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '400',
                color: '#bdc3c7',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="Digite seu CPF"
                maxLength="11"
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  backgroundColor: 'rgba(236, 240, 241, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#ecf0f1',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.15)';
                  e.target.style.borderColor = 'rgba(231, 76, 60, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          )}

          {/* Campo Senha */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '400',
              color: '#bdc3c7',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '15px 18px',
                backgroundColor: 'rgba(236, 240, 241, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#ecf0f1',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.15)';
                e.target.style.borderColor = 'rgba(231, 76, 60, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(236, 240, 241, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          {/* Lembrar-me */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#bdc3c7'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#e74c3c'
                }}
              />
              Lembrar-me
            </label>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              color: '#e74c3c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '25px',
              fontSize: '13px',
              border: '1px solid rgba(231, 76, 60, 0.2)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Botão Login */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              background: isLoading
                ? 'rgba(149, 165, 166, 0.8)'
                : 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
              }
            }}
          >
            {isLoading ? 'Entrando...' : 'Login'}
          </button>

          {/* Link Cadastro */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleCadastro}
              style={{
                background: 'none',
                border: 'none',
                color: '#bdc3c7',
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ecf0f1'}
              onMouseLeave={(e) => e.target.style.color = '#bdc3c7'}
            >
              Cadastrar Restaurante
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        zIndex: 3
      }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: 'rgba(189, 195, 199, 0.6)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          © 2025 FoodFlow — Management System
        </p>
      </div>
    </div>
  );
}