'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PedidosContext = createContext();

export function PedidosProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const carregarPedidos = async () => {
    try {
      console.log('📋 Carregando pedidos do restaurante...');
      
      if (!token || !isAuthenticated) {
        console.log('❌ Usuário não autenticado');
        setPedidos([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Pedidos carregados:', data.total_pedidos);
        console.log('🏪 Restaurante ID:', data.restaurante_id);
        setPedidos(data.pedidos);
      } else {
        console.error('❌ Erro ao carregar pedidos:', data.error);
        setPedidos([]);
      }

    } catch (error) {
      console.error('❌ Erro na requisição de pedidos:', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPedido = async (pedidoId, novoStatus) => {
    try {
      console.log('🔄 Atualizando status do pedido:', pedidoId, 'para:', novoStatus);

      const response = await fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Status atualizado com sucesso');
        // ✅ ATUALIZAR LISTA LOCAL
        setPedidos(prevPedidos => 
          prevPedidos.map(pedido => 
            pedido.id_pedido === pedidoId 
              ? { ...pedido, status: novoStatus }
              : pedido
          )
        );
        return { success: true };
      } else {
        console.error('❌ Erro ao atualizar status:', data.error);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Erro na requisição de atualização:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const criarPedido = async (dadosPedido) => {
    try {
      console.log('🆕 Criando novo pedido...');

      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosPedido)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Pedido criado com sucesso');
        // ✅ RECARREGAR LISTA DE PEDIDOS
        await carregarPedidos();
        return { success: true, pedido: data.pedido };
      } else {
        console.error('❌ Erro ao criar pedido:', data.error);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Erro na criação do pedido:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // ✅ CARREGAR PEDIDOS QUANDO USUÁRIO ESTIVER AUTENTICADO
  useEffect(() => {
    if (isAuthenticated && token) {
      carregarPedidos();
    } else {
      setPedidos([]);
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  return (
    <PedidosContext.Provider value={{
      pedidos,
      loading,
      carregarPedidos,
      atualizarStatusPedido,
      criarPedido
    }}>
      {children}
    </PedidosContext.Provider>
  );
}

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos deve ser usado dentro de PedidosProvider');
  }
  return context;
};