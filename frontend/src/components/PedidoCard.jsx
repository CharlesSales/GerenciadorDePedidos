'use client';
import React, { useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PedidoCard({ pedido, numeroPedido, handleChangeStatus, handleChangepaymentstatus, getStatusColor, formatarData }) {
  const itens = typeof pedido.pedidos === "string" && pedido.pedidos.trim()
    ? JSON.parse(pedido.pedidos)
    : Array.isArray(pedido.pedidos)
      ? pedido.pedidos
      : [];

  console.log(`os itens pedidos foram: \n${pedido.pedidos}`)
  // ✅ FUNÇÃO PARA COR DO STATUS DE PAGAMENTO
  const getPaymentColor = (pag) => {
    return pag === 'pago' ? '#d4edda' : '#f8d7da'; // Verde claro / Vermelho claro
  };

  const cardRef = useRef(null);
  const p = pedido.pedidos
  const total = pedido.total
  const itensPedido = JSON.parse(p)
  const { user } = useAuth()

  const id_restaurante =
    user?.dados?.id_restaurante ||
    user?.dados?.id ||
    user?.dados?.restaurante?.id_restaurante ||
    user?.dados?.restaurante?.id ||
    user?.id_restaurante ||
    user?.id;

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
            width: 80mm; /* ✅ LARGURA PADRÃO EPSON */
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
          <div><strong>CLIENTE:</strong> ${pedido.nome_cliente.substring(0, 20)}</div>
          ${pedido.casa ? `<div><strong></strong> ${pedido.casa}</div>` : ''}
          ${pedido.mesa ? `<div><strong>MESA:</strong> ${pedido.mesa}</div>` : ''}
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

        <div class="total">
          TOTAL: R$ ${Number(total || 0).toFixed(2)}
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
            {formatarData(pedido.data_hora)}
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
        backgroundColor: getPaymentColor(pedido.pag),
        borderRadius: '8px',
        border: `1px solid ${pedido.pag === 'pago' ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>💳 Pagamento:</span>
        <span style={{
          fontWeight: 'bold',
          color: pedido.pag === 'pago' ? '#155724' : '#721c24',
          fontSize: '14px'
        }}>
          {pedido.pag === 'pago' ? '✅ PAGO' : '⏳ PENDENTE'}
        </span>
      </div>

      {/* Informações do cliente */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>{pedido.nome_cliente}</p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Casa: {pedido.casa}</p>
        {pedido.mesa && (
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Mesa: {pedido.mesa}</p>
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