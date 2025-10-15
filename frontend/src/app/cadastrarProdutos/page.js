'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CadastrarProdutos from '@/components/CadastrarProdutos';

export default function CadastrarFuncionarioPage() {
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

  return <CadastrarProdutos token={token} />;
}
