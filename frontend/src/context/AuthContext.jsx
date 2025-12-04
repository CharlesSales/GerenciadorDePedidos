'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false); // ✅ ESTADO DE HIDRATAÇÃO

  // ✅ VERIFICAR SE ESTÁ NO CLIENTE
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // ✅ VERIFICAR TOKEN SALVO APENAS NO CLIENTE
    if (isHydrated) {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      
      setLoading(false);
    }
  }, [isHydrated]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const login = async (usuario, senha, tipo) => {
    try {
      ('🔐 Fazendo login:', { tipo, usuario });
      
      const url = tipo === 'funcionario' 
        ? `${API_URL}/auth/funcionario`
        : `${API_URL}/auth/restaurante`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (data.success) {
        ('✅ Login bem-sucedido:', data.user.dados.nome);
        
        setUser(data.user);
        setToken(data.token);
        
        // ✅ SALVAR APENAS NO CLIENTE
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return { success: true, user: data.user };
      } else {
        console.error('❌ Erro no login:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const logout = () => {
    ('🚪 Fazendo logout...');
    setUser(null);
    setToken(null);
    ('Erro porra')
    
    // ✅ REMOVER APENAS NO CLIENTE
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = !!user && !!token;

  // ✅ NÃO RENDERIZAR ATÉ ESTAR HIDRATADO
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={{
        user: null,
        token: null,
        loading: true,
        login: async () => ({ success: false, error: 'Carregando...' }),
        logout: () => {},
        isAuthenticated: false
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};