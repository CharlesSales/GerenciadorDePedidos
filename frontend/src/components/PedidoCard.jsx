'use client';
import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PedidoCard({ pedido, numeroPedido, handleChangeStatus, handleChangepaymentstatus, getStatusColor, formatarData }) {
  if (!pedido) return null;
  const itens = typeof pedido.pedidos === "string" && pedido.pedidos.trim()
    ? JSON.parse(pedido.pedidos)
    : Array.isArray(pedido.pedidos)
      ? pedido.pedidos
      : [];

  const pagamento = pedido?.pag || 'pendente';


  const getPaymentColor = (pag) => {
    return pag === 'pago' ? '#d4edda' : '#f8d7da'; // Verde claro / Vermelho claro
  };

  const cardRef = useRef(null);
  const total = pedido.total
  const itensPedido = JSON.parse(pedido.pedidos)
  const { user } = useAuth()
  const cnpj = user?.dados?.restaurante?.cnpj
  const id_restaurante = user?.dados?.restaurante?.id_restaurante
  const [numeroMesa, setNumeroMesa] = useState('')
  const [taxa, setTaxa] = useState(0)
  const [taxaCantor, setTaxaCantor] = useState(0)
  const taxaServico = user?.dados?.restaurante?.taxaServico
  const taxaCouvert = user?.dados?.restaurante?.taxaCouvert
  const [couvertStatus, setCouvertStatus] = useState(null);
  const dataCompleta = pedido.data_hora
  const data = dataCompleta.split('T')[0];

  // ✅ EXTRAIR NOME DO FUNCIONÁRIO DE FORMA SEGURA
  const nomeFuncionario = (() => {
    if (!pedido.funcionario) return 'Não informado';

    // Se for string, retornar diretamente
    if (typeof pedido.funcionario === 'string') {
      return pedido.funcionario;
    }

    // Se for objeto, extrair nome
    if (typeof pedido.funcionario === 'object') {
      return pedido.funcionario.nome ||
        pedido.funcionario.nome_funcionario ||
        pedido.funcionario.usuario ||
        'Funcionário';
    }

    return 'Não informado';
  })();

  useEffect(() => {
    if (taxaServico === true) {
      setTaxa(0.1);
    } else {
      setTaxa(0);
    }
  }, [taxaServico]);



  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const buscarStatusCouvert = async () => {
    try {
      const token = localStorage.getItem('token');

      // ✅ Usar a rota correta conforme suas rotas
      const response = await fetch(`${API_URL}/restaurante/restaurantes/couvert/${id_restaurante}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error("❌ Erro ao buscar couvert");
        // ✅ Se falhar, usar o valor do contexto como fallback
        setCouvertStatus(couvert);
        return;
      }

      const data = await response.json();
      ("📊 Dados recebidos do backend:", data);

      // ✅ Verificar se data é array ou objeto
      const taxaCouvert = Array.isArray(data) ? data[0]?.taxaCouvert : data?.taxaCouvert;

      ("🎵 Taxa couvert do backend:", taxaCouvert);

      // Converte CORRETAMENTE qualquer tipo de retorno
      const statusBoolean = taxaCouvert === true || taxaCouvert === "true" || taxaCouvert === 1 || taxaCouvert === "1";

      ("🎵 Status final:", statusBoolean);
      setCouvertStatus(statusBoolean);

    } catch (error) {
      console.error("❌ Erro ao buscar status do couvert:", error);
      // ✅ Se der erro, usar o valor do contexto
      setCouvertStatus(couvert);
    }
  };
  useEffect(() => {
    if (user && id_restaurante) {
      buscarStatusCouvert();
    }
  }, [user, id_restaurante]);


  useEffect(() => {
    if (couvertStatus === true) {
      setTaxaCantor(0.2);
    } else {
      setTaxaCantor(0);
    }
  }, [couvertStatus]);

  (`taxa do cantor: ${taxaCantor}\nstatus: ${couvertStatus}`)


  const buscarMesa = async (idMesa) => {
    if (!idMesa) return;

    try {
      const response = await fetch(`${API_URL}/mesa/buscar/${idMesa}`);

      if (response.ok) {
        const data = await response.json();

        // ✅ CORREÇÃO: A API retorna um array, então pegar o primeiro elemento
        if (data && Array.isArray(data) && data.length > 0) {
          const mesa = data[0]; // Pegar o primeiro elemento do array
          const numeroMesaEncontrado = mesa.numeroMesa || mesa.numero_mesa || mesa.numero || `Mesa ${idMesa}`;

          setNumeroMesa(numeroMesaEncontrado);
        } else {
          setNumeroMesa(`Mesa ${idMesa}`);
        }
      } else {
        setNumeroMesa(`Mesa ${idMesa}`);
      }
    } catch (error) {
      setNumeroMesa(`Mesa ${idMesa}`);
    }
  };

  (`taxa do cantor ${taxaCantor}`)

  useEffect(() => {
    const idMesa = itens.length > 0 && itens[0].id_mesa
      ? itens[0].id_mesa
      : pedido.mesa || pedido.id_mesa;


    if (idMesa && idMesa !== 'Mesa não informada') {
      buscarMesa(idMesa);
    }
  }, [pedido, itens]);

  useEffect(() => {
    const idMesa = itens.length > 0 && itens[0].id_mesa
      ? itens[0].id_mesa
      : pedido.mesa || pedido.id_mesa;


    if (idMesa && idMesa !== 'Mesa não informada') {
      buscarMesa(idMesa); // ✅ Passando idMesa como parâmetro

    }
  }, [pedido, itens]);

  const handlePrint = () => {
    const novaJanela = window.open("", "", "width=300,height=600");
    novaJanela.document.write(`
        <!DOCTYPE html>
        <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${numeroPedido}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 5px;
            line-height: 1.2;
            background: white;
            width: 80mm; 
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .restaurante {
            font-size: 14px;
            font-weight: bold;
            margin: 2px 0;
            text-transform: uppercase;
          }
          .pedido-numero {
            font-size: 12px;
            margin: 2px 0;
          }
          .data-hora {
            font-size: 10px;
            margin: 2px 0;
          }
          .cliente-info {
            margin: 8px 0;
            padding: 3px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .cliente-info div {
            margin: 1px 0;
            font-size: 11px;
          }
          .itens {
            margin: 8px 0;
          }
          .itens-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 3px;
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 2px;
          }
          .item {
            font-size: 10px;
            margin: 2px 0;
            display: flex;
            justify-content: space-between;
          }
          .item-nome {
            flex: 1;
            padding-right: 5px;
          }
          .item-preco {
            white-space: nowrap;
          }
          .total {
            margin-top: 8px;
            padding-top: 5px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 5px;
          }
          .status-pag {
            text-align: center;
            margin: 5px 0;
            font-size: 11px;
            font-weight: bold;
          }
          
          /* ✅ CONFIGURAÇÕES ESPECÍFICAS PARA IMPRESSÃO */
          @media print {
            body { 
              margin: 0; 
              padding: 2px;
              width: 80mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurante">${(user?.dados?.restaurante?.nome_restaurante || 'RESTAURANTE').substring(0, 25)}</div>
          <div class="pedido-numero">PEDIDO #${numeroPedido}</div>
          <div class="data-hora">${formatarData(pedido.data_hora)}</div>
        </div>

        <div class="cliente-info">
          <div><strong>PEDIDO:</strong> #${numeroPedido}</div>
          ${user?.dados?.restaurante?.cnpj ? `<div><strong>CNPJ:</strong>${cnpj}</div>` : ''}
          ${pedido.casa ? `<div><strong> ${pedido.casa}</strong></div>` : ''}
          ${pedido.mesa ? `<div><strong>MESA:</strong> ${numeroMesa}</div>` : ''}
        </div>

        <div class="itens">
          <div class="itens-title">ITENS DO PEDIDO</div>
          ${itensPedido.map(item => `
            <div class="item">
              <div class="item-nome">${item.quantidade} ${item.nome.substring(0, 18)}</div>
              <div class="item-preco">R$ ${Number(item.preco || 0).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="calculo">
          <div class="itens-title"></div>
          <div class="itens-subtotal"> SUBTOTAL R$ ${Number(total || 0).toFixed(2)}</div>
          ${taxaServico ? `<div class="itens-taxa"> SERVICO R$ ${Number(total * taxa).toFixed(2)}<\div>` : ''}
          ${couvertStatus ? `<div class="itens-taxa"> COUVERT R$ ${Number(total * taxaCantor).toFixed(2)}<\div>` : ''}
        </div>

        <div class="total">
          TOTAL: R$ ${Number(total + (taxaServico ? total * taxa : 0) + (taxaCouvert ? total * taxaCantor : 0) || 0).toFixed(2)}
        </div>
        <div class="footer">
          ${new Date().toLocaleString('pt-BR')}
          <br>
          Sistema FoodFlow - Obrigado!
        </div>
      </body>
    </html>
  `);
    novaJanela.document.close();

    // ✅ CONFIGURAR IMPRESSÃO PARA CUPOM
    setTimeout(() => {
      novaJanela.focus();
      novaJanela.print();

      // ✅ FECHAR AUTOMATICAMENTE APÓS IMPRIMIR
      setTimeout(() => {
        novaJanela.close();
      }, 1000);
    }, 500);
  };

  // ✅ MAPEAR STATUS NUMÉRICO PARA TEXTO
  const getStatusText = (status) => {
    const statusMap = {
      1: 'Pedido feito',
      2: 'Preparando',
      3: 'Pronto',
      4: 'A caminho',
      5: 'Entregue'
    };

    // Se já é texto, retorna como está
    if (typeof status === 'string') return status;

    // Se é número, converte para texto
    return statusMap[status] || `Status ${status}`;
  };

  return (
    <div ref={cardRef} style={{
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      {/* Header do pedido */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
            Pedido #{numeroPedido}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {data} {formatarData(pedido.data_hora)}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Funcionário: {nomeFuncionario}
          </p>
        </div>

        {/* ✅ MOSTRAR STATUS DO PEDIDO (NÃO PAGAMENTO) */}
        <div style={{
          backgroundColor: getStatusColor(getStatusText(pedido.status)),
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {getStatusText(pedido.status)}
        </div>
      </div>

      {/* ✅ ADICIONAR INDICADOR DE PAGAMENTO SEPARADO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '8px 12px',
        backgroundColor: getPaymentColor(pagamento),
        borderRadius: '8px',
        border: `1px solid ${pagamento === 'pago' ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>💳 Pagamento:</span>
        <span style={{
          fontWeight: 'bold',
          color: pagamento === 'pago' ? '#155724' : '#721c24',
          fontSize: '14px'
        }}>
          {pedido.pag === 'pago' ? '✅ PAGO' : '⏳ PENDENTE'}
        </span>
      </div>

      {/* Informações do cliente */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>{pedido.nome_cliente}</p>
        {/* <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Casa: {pedido.casa}</p> */}
        {pedido.casa && (
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>casa: {pedido.casa}</p>
        )}
        {pedido.mesa && (
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Mesa: {numeroMesa}</p>
        )}
        {pedido.detalhe && (
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Obs: {pedido.detalhe}</p>
        )}
      </div>

      {/* Lista de itens */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
          Itens do Pedido:
        </h4>
        {itens.length > 0 ? (
          itens.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < itens.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold', color: '#e11616ff', fontSize: '14px' }}>{item.quantidade}x</span>
                <span style={{ marginLeft: '10px', color: '#e11616ff', fontSize: '14px' }}>{item.nome}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>Nenhum item encontrado</p>
        )}
      </div>

      {/* Total e ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Total: R$ {Number(pedido.total || 0).toFixed(2)}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* ✅ BOTÃO DE PAGAMENTO COM ÍCONES */}
          <button
            onClick={() => handleChangepaymentstatus(pedido.id_pedido)}
            style={{
              backgroundColor: pedido.pag === 'pago' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {pedido.pag === 'pago' ? 'Pago' : 'Pendente'}
          </button>

          {/* ✅ BOTÃO DE STATUS COM ÍCONE */}
          <button
            onClick={() => handleChangeStatus(pedido.id_pedido, getStatusText(pedido.status))}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ⏩ Avançar
          </button>
          {/* ✅ BOTÃO DE STATUS COM ÍCONE */}
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            🖨️
          </button>

        </div>
      </div>
    </div>
  );
}