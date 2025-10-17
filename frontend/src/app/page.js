'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // ✅ REDIRECIONAR IMEDIATAMENTE PARA LOGIN SEM MOSTRAR CONTEÚDO
        router.replace('/login');
      } else {
        // ✅ SE AUTENTICADO, IR PARA DASHBOARD
        router.replace('/admin');
      }
    }
  }, [isAuthenticated, loading, router]);

  // ✅ MOSTRAR LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // ✅ DURANTE O REDIRECIONAMENTO, MOSTRAR LOADING
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}