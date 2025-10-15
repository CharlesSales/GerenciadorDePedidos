'use client'
import React, { useEffect, useState } from 'react';

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/relatorios', {
        
        headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRelatorio(data);
    }
    fetchData();
  }, []);

  if (!relatorio) return <p>Carregando...</p>;

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
      <Card titulo="Vendas do Dia" valor={`R$ ${relatorio.total_dia.toFixed(2)}`} />
      <Card titulo="Vendas da Semana" valor={`R$ ${relatorio.total_semana.toFixed(2)}`} />
      <Card titulo="Vendas do Mês" valor={`R$ ${relatorio.total_mes.toFixed(2)}`} />
      <Card titulo="Vendas do Ano" valor={`R$ ${relatorio.total_ano.toFixed(2)}`} />
      <Card titulo="Produto Mais Vendido" valor={relatorio.produto_mais_vendido} />
      <Card titulo="Qtd. Vendida" valor={relatorio.quantidade_vendida} />
    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 text-center">
      <h2 className="text-gray-500 text-sm">{titulo}</h2>
      <p className="text-2xl font-bold mt-2">{valor}</p>
    </div>
  );
}
