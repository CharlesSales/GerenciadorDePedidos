'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  // Lista de produtos do cardápio

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/produtos")
      .then(res => res.json())
      .then(data => {
        console.log(data); // verifique se tem id em cada produto
        setProdutos(Array.isArray(data) ? data : data.produtos || []);
      });
  }, []);


  const [carrinho, setCarrinho] = useState({});



  const handleAdd = (produto) => {
  setCarrinho(prev => ({
    ...prev,
    [produto.id_produto]: (prev[produto.id_produto] || 0) + 1
  }));
};


  const handleRemove = (produto) => {
    const atual = carrinho[produto.id_produto] || 1;
    if (atual > 1) {
      setCarrinho(prev => ({ ...prev, [produto.id_produto]: atual - 1 }));
    }
  };

  const handleClear = (produto) => {
    setCarrinho(prev => {
      const novo = { ...prev };
      delete novo[produto.id_produto];
      return novo;
    });
  };

  return (
    <CarrinhoContext.Provider value={{ carrinho, produtos, handleAdd, handleRemove, handleClear }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => useContext(CarrinhoContext);


/*
'use client';
import { createContext, useContext, useState } from 'react'; 

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState({});

  
  const handleAdd = (produto) => {
    setCarrinho(prev => ({
      ...prev,
      [produto.id]: (prev[produto.id] || 0) + 1
    }));
  };

  const handleRemove = (produto) => {
    const atual = carrinho[produto.id] || 1;
    if (atual > 1) {
      setCarrinho(prev => ({ ...prev, [produto.id]: atual - 1 }));
    }
  };

  const handleClear = (produto) => {
    setCarrinho(prev => {
      const novo = { ...prev };
      delete novo[produto.id];
      return novo;
    });
  };

  return (
    <CarrinhoContext.Provider value={{ carrinho, handleAdd, handleRemove, handleClear }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => useContext(CarrinhoContext);
*/