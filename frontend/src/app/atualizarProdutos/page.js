'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AtualizarProdutos from '@/components/AtualizarProdutos';

export default function AtualizarFuncionarioPage() {
  const { token, isAuthenticated } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <AtualizarProdutos token={token} />;
}
