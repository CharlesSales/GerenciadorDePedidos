'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token, isAuthenticated } = useAuth();

  const carregarProdutos = async () => {
    try {
      console.log('📦 Carregando produtos...');
      console.log('🔐 Token disponível:', !!token);
      console.log('👤 Usuário autenticado:', isAuthenticated);

      setLoading(true);

      // ✅ PREPARAR HEADERS
      const headers = {
        'Content-Type': 'application/json'
      };

      // ✅ SE ESTIVER AUTENTICADO, ADICIONAR TOKEN
      if (token && isAuthenticated) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Carregando produtos filtrados por restaurante...');
      } else {
        console.log('📦 Carregando todos os produtos (sem filtro)...');
      }

      const response = await fetch(`http://localhost:8080/produtos`, {
        method: 'GET',
        headers: headers
      });

      // ✅ VERIFICAR SE A RESPOSTA É VÁLIDA
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Resposta da API:', data);

      // ✅ VERIFICAR DIFERENTES FORMATOS DE RESPOSTA
      if (Array.isArray(data)) {
        // ✅ RESPOSTA DIRETA COM ARRAY DE PRODUTOS
        console.log('✅ Produtos carregados (array direto):', data.length);
        setProdutos(data);
      } else if (data && data.success && Array.isArray(data.produtos)) {
        // ✅ RESPOSTA COM OBJETO SUCCESS
        console.log('✅ Produtos carregados (objeto success):', data.produtos.length);
        console.log('🏪 Restaurante ID:', data.restaurante_id);
        setProdutos(data.produtos);
      } else if (data && Array.isArray(data.data)) {
        // ✅ RESPOSTA COM PROPRIEDADE DATA
        console.log('✅ Produtos carregados (data property):', data.data.length);
        setProdutos(data.data);
      } else {
        // ✅ FORMATO INESPERADO
        console.warn('⚠️ Formato de resposta inesperado:', data);
        console.warn('⚠️ Tipo da resposta:', typeof data);
        console.warn('⚠️ É array?', Array.isArray(data));
        
        // ✅ TENTAR EXTRAIR PRODUTOS DE QUALQUER JEITO
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
      console.error('❌ Stack trace:', error.stack);
      
      // ✅ TENTAR FALLBACK SEM TOKEN
      if (token) {
        console.log('🔄 Tentando novamente sem token...');
        try {
          const fallbackResponse = await fetch(`http://localhost:8080/produtos`, {
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

  // ✅ CARREGAR PRODUTOS QUANDO USUÁRIO ESTIVER AUTENTICADO OU MUDAR
  useEffect(() => {
    carregarProdutos();
  }, [isAuthenticated, token]);

  const adicionarAoCarrinho = (produto) => {
    console.log('➕ Adicionando ao carrinho:', produto.nome);
    setCarrinho(prevCarrinho => {
      const itemExistente = prevCarrinho.find(item => item.id_produto === produto.id_produto);
      
      if (itemExistente) {
        return prevCarrinho.map(item =>
          item.id_produto === produto.id_produto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prevCarrinho, { ...produto, quantidade: 1 }];
      }
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
      carregarProdutos
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