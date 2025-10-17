'use client';
import React, { useState, useEffect } from 'react';
import CadastrarRestaurante from '@/components/CadastrarRestaurante';

export default function CadastrarFuncionarioPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return <CadastrarRestaurante />;
}
