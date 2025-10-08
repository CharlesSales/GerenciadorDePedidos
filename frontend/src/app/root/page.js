'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) return;

    // Se não tem usuário logado, ir para login
    if (!user) {
      router.push('/login');
      return;
    }

    // Se tem usuário logado, redirecionar baseado no tipo
    if (user.tipo === 'restaurante' || user.isAdmin) {
      router.push('/admin'); // ou /dashboard
    } else if (user.tipo === 'funcionario') {
      router.push('/produtos');
    } else {
      router.push('/admin');
    }
  }, [user, loading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>🍽️</div>
        <div>Carregando Acarajé da Mari...</div>
      </div>
    );
  }

  // Enquanto redireciona
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>🔄</div>
      <div>Redirecionando...</div>
    </div>
  );
}