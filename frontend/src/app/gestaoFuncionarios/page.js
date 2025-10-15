'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ListaFuncionarios from '@/components/ListaFuncionarios';

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [coluna, setColuna] = useState("nome");
  const [cargoSelecionado, setCargoSelecionado] = useState("");
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) carregarFuncionarios();
  }, [isHydrated, token, isAuthenticated]);

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      const response = await fetch(`${API_URL}/funcionarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) return window.location.href = '/login';
        throw new Error(await response.text());
      }

      const data = await response.json();
      setFuncionarios(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <ListaFuncionarios
      funcionarios={funcionarios}
      loading={loading}
      filtro={filtro}
      setFiltro={setFiltro}
      coluna={coluna}
      setColuna={setColuna}
      cargoSelecionado={cargoSelecionado}
      setCargoSelecionado={setCargoSelecionado}
    />
  );
}
