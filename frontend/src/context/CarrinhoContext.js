'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false); // ✅ ESTADO DE HIDRATAÇÃO
  const { user, token, isAuthenticated } = useAuth();

  // ✅ VERIFICAR SE ESTÁ NO CLIENTE
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const carregarProdutos = async () => {
    try {
      console.log('📦 Carregando produtos...');
      console.log('🔐 Token disponível:', !!token);
      console.log('👤 Usuário autenticado:', isAuthenticated);

      setLoading(true);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token && isAuthenticated) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Carregando produtos filtrados por restaurante...');
      } else {
        console.log('📦 Carregando todos os produtos (sem filtro)...');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

      const response = await fetch(`${API_URL}/produtos`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Resposta da API:', data);

      if (Array.isArray(data)) {
        console.log('✅ Produtos carregados (array direto):', data.length);
        setProdutos(data);
      } else if (data && data.success && Array.isArray(data.produtos)) {
        console.log('✅ Produtos carregados (objeto success):', data.produtos.length);
        console.log('🏪 Restaurante ID:', data.restaurante_id);
        setProdutos(data.produtos);
      } else if (data && Array.isArray(data.data)) {
        console.log('✅ Produtos carregados (data property):', data.data.length);
        setProdutos(data.data);
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', data);
        
        if (data && typeof data === 'object') {
          const possiveisProdutos = data.produtos || data.data || data.items || [];
          if (Array.isArray(possiveisProdutos)) {
            console.log('✅ Produtos encontrados em propriedade alternativa:', possiveisProdutos.length);
            setProdutos(possiveisProdutos);
          } else {
            console.log('❌ Nenhum array de produtos encontrado');
            setProdutos([]);
          }
        } else {
          setProdutos([]);
        }
      }

    } catch (error) {
      console.error('❌ Erro detalhado na requisição:', error);
      
      if (token) {
        console.log('🔄 Tentando novamente sem token...');
        try {
          const fallbackResponse = await fetch(`${API_URL}/produtos`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('✅ Fallback funcionou:', fallbackData);
            
            if (Array.isArray(fallbackData)) {
              setProdutos(fallbackData);
            } else {
              setProdutos([]);
            }
          } else {
            console.error('❌ Fallback também falhou');
            setProdutos([]);
          }
        } catch (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError);
          setProdutos([]);
        }
      } else {
        setProdutos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR PRODUTOS APENAS NO CLIENTE
  useEffect(() => {
    if (isHydrated) {
      carregarProdutos();
    }
  }, [isAuthenticated, token, isHydrated]);

  const adicionarAoCarrinho = (produto) => {
    console.log('🛒 === ADICIONANDO AO CARRINHO ===');
    console.log('🛒 Produto recebido:', produto);
    console.log('🛒 Carrinho atual antes:', carrinho);
    
    setCarrinho(prevCarrinho => {
      console.log('🛒 Carrinho anterior (dentro do setState):', prevCarrinho);
      
      const itemExistente = prevCarrinho.find(item => item.id_produto === produto.id_produto);
      console.log('🛒 Item já existe?', !!itemExistente);
      
      let novoCarrinho;
      
      if (itemExistente) {
        novoCarrinho = prevCarrinho.map(item =>
          item.id_produto === produto.id_produto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
        console.log('🛒 Incrementando quantidade do item existente');
      } else {
        novoCarrinho = [...prevCarrinho, { ...produto, quantidade: 1 }];
        console.log('🛒 Adicionando novo item ao carrinho');
      }
      
      console.log('🛒 Novo carrinho:', novoCarrinho);
      return novoCarrinho;
    });
  };

  const removerDoCarrinho = (produtoId) => {
    console.log('➖ Removendo do carrinho:', produtoId);
    setCarrinho(prevCarrinho => prevCarrinho.filter(item => item.id_produto !== produtoId));
  };

  const alterarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }
    
    setCarrinho(prevCarrinho =>
      prevCarrinho.map(item =>
        item.id_produto === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  };

  const limparCarrinho = () => {
    console.log('🗑️ Limpando carrinho');
    setCarrinho([]);
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      return total + (parseFloat(item.preco) * item.quantidade);
    }, 0);
  };

  // ✅ NÃO RENDERIZAR ATÉ ESTAR HIDRATADO
  if (!isHydrated) {
    return (
      <CarrinhoContext.Provider value={{
        produtos: [],
        carrinho: [],
        loading: true,
        adicionarAoCarrinho: () => {},
        removerDoCarrinho: () => {},
        alterarQuantidade: () => {},
        limparCarrinho: () => {},
        calcularTotal: () => 0,
        carregarProdutos: () => {},
        handleAdd: () => {},
        handleRemove: () => {},
        handleClear: () => {}
      }}>
        {children}
      </CarrinhoContext.Provider>
    );
  }

  return (
    <CarrinhoContext.Provider value={{
      produtos,
      carrinho,
      loading,
      adicionarAoCarrinho,
      removerDoCarrinho,
      alterarQuantidade,
      limparCarrinho,
      calcularTotal,
      carregarProdutos,
      handleAdd: adicionarAoCarrinho,
      handleRemove: removerDoCarrinho,
      handleClear: limparCarrinho
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  }
  return context;
};