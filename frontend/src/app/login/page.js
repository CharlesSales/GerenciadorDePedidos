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
  const [loginMode, setLoginMode] = useState('usuario'); // 'usuario' ou 'cpf'

  const { login, user } = useAuth(); // ✅ USAR APENAS AS FUNÇÕES DISPONÍVEIS
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

    // ✅ REDIRECIONAMENTO BASEADO NO TIPO E PERMISSÃO
    let destino = '/login';

    if (userData.tipo === 'cliente') {
      destino = `/restaurante/${userData.restaurante?.id_restaurante || 1}/cardapio`;
    } else if (userData.tipo === 'restaurante') {
      destino = '/admin'; // Dono → Admin
    } else if (userData.tipo === 'funcionario') {
      if (userData.isAdmin) {
        destino = '/admin'; // Funcionário Admin → Admin
      } else {
        destino = '/funcionario'; // Funcionário Regular → Funcionário
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
        // ✅ LOGIN FUNCIONÁRIO/RESTAURANTE
        if (!formData.usuario || !formData.senha) {
          setError('Usuário e senha são obrigatórios');
          return;
        }

        console.log('📝 Tentativa de login funcionário/restaurante:', formData.usuario);
        
        // ✅ TENTAR PRIMEIRO COMO FUNCIONÁRIO
        let result = await login(formData.usuario, formData.senha, 'funcionario');
        
        // ✅ SE NÃO DEU CERTO, TENTAR COMO RESTAURANTE
        if (!result.success) {
          console.log('🔄 Tentando como restaurante...');
          result = await login(formData.usuario, formData.senha, 'restaurante');
        }
        
        if (result.success) {
          console.log('✅ Login realizado com sucesso!');
          // ✅ O redirecionamento será feito pelo useEffect quando user mudar
        } else {
          setError(result.error || 'Usuário ou senha inválidos');
        }
      } else {
        // ✅ LOGIN CLIENTE (FUTURO)
        setError('Login de cliente ainda não implementado');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginTeste = (tipo) => {
    // ✅ CREDENCIAIS QUE REALMENTE FUNCIONAM
    if (tipo === 'funcionario_admin') {
      setLoginMode('usuario');
      setFormData({ usuario: 'admin', senha: '123', cpf: '' });
    } else if (tipo === 'restaurante') {
      setLoginMode('usuario');
      setFormData({ usuario: 'acarajedamari', senha: '1234', cpf: '' });
    } else if (tipo === 'cliente') {
      setLoginMode('cpf');
      setFormData({ usuario: '', senha: '1234', cpf: '12345678901' });
    }
    // ✅ OUTROS FUNCIONÁRIOS (SE EXISTIREM NO BANCO)
    else if (tipo === 'henrique') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Henrique', senha: '1234', cpf: '' });
    } else if (tipo === 'vinicius') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Vinicius', senha: '1234', cpf: '' });
    } else if (tipo === 'luciano') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Luciano', senha: '1234', cpf: '' });
    } else if (tipo === 'juan') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Juan', senha: '1234', cpf: '' });
    } else if (tipo === 'keivisson') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Keivisson', senha: '1234', cpf: '' });
    } else if (tipo === 'luciana') {
      setLoginMode('usuario');
      setFormData({ usuario: 'Luciana', senha: '1234', cpf: '' });
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍽️</div>
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>
            Acarajé da Mari
          </h1>
          <p style={{ color: '#6c757d', margin: '8px 0 0 0' }}>
            Sistema de Pedidos
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ✅ TOGGLE ENTRE USUÁRIO E CPF */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('usuario');
                  setFormData({ usuario: '', senha: '', cpf: '' });
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: loginMode === 'usuario' ? '#dc3545' : '#e9ecef',
                  color: loginMode === 'usuario' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                👨‍💼 Funcionário/Dono
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
                  padding: '8px',
                  backgroundColor: loginMode === 'cpf' ? '#dc3545' : '#e9ecef',
                  color: loginMode === 'cpf' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                👤 Cliente
              </button>
            </div>
          </div>

          {loginMode === 'usuario' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057'
              }}>
                Usuário
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleInputChange}
                placeholder="Digite seu usuário"
                style={{
                  width: '100%', padding: '12px', border: '2px solid #e9ecef',
                  borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {loginMode === 'cpf' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057'
              }}>
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="Digite seu CPF (somente números)"
                maxLength="11"
                style={{
                  width: '100%', padding: '12px', border: '2px solid #e9ecef',
                  borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057'
            }}>
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="Digite sua senha"
              style={{
                width: '100%', padding: '12px', border: '2px solid #e9ecef',
                borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da', color: '#721c24', padding: '12px',
              borderRadius: '8px', marginBottom: '24px', fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '14px', 
              backgroundColor: isLoading ? '#6c757d' : '#dc3545',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Entrando...' : '🚀 Entrar'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px', marginTop: '20px' }}>
          <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '12px', marginBottom: '12px' }}>
            🧪 Acesso rápido para testes:
          </p>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => loginTeste('funcionario_admin')}
              style={{
                flex: 1, padding: '8px', backgroundColor: '#dc3545', color: 'white',
                border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              👨‍💼 Admin (admin/123)
            </button>

            <button
              type="button"
              onClick={() => loginTeste('restaurante')}
              style={{
                flex: 1, padding: '8px', backgroundColor: '#28a745', color: 'white',
                border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              👑 Dono (acarajedamari/1234)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => loginTeste('henrique')}
              style={{
                flex: 1, padding: '6px', backgroundColor: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
              }}
            >
              Henrique
            </button>
            
            <button
              type="button"
              onClick={() => loginTeste('vinicius')}
              style={{
                flex: 1, padding: '6px', backgroundColor: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
              }}
            >
              Vinicius
            </button>
            
            <button
              type="button"
              onClick={() => loginTeste('luciano')}
              style={{
                flex: 1, padding: '6px', backgroundColor: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
              }}
            >
              Luciano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}