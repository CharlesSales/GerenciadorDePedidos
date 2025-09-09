'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  // Lista de produtos do cardápio

  const [produtos, setProdutos] = useState([]);
  const [acaraje, setAcaraje] = useState([]);

  // Localmente, para desenvolvimento
  // http://localhost:3001

  // No Render.com, para produção
  // https://gerenciadordepedidos.onrender.com
  useEffect(() => {
    fetch("https://gerenciadordepedidos.onrender.com/produtos")
      .then(res => res.json())
      .then(data => {
        console.log(data); // verifique se tem id em cada produto
        setProdutos(Array.isArray(data) ? data : data.produtos || []);
      });
  }, []);

  useEffect(() => {
    fetch("https://gerenciadordepedidos.onrender.com/acaraje")
      .then(res => res.json())
      .then(data => {
        console.log(data); // verifique se tem id em cada produto
        setAcaraje(Array.isArray(data) ? data : data.acaraje || []);
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
    <CarrinhoContext.Provider value={{ carrinho, produtos, acaraje, handleAdd, handleRemove, handleClear }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {children}
      </div>
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => useContext(CarrinhoContext);

