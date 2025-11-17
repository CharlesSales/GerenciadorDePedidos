'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState(null);
  const { user } = useAuth();
  const  router = useRouter()
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    periodo: '7',
    dataInicio: '',
    dataFim: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  useEffect(() => {
    fetchRelatorios();
  }, []);


  const redirecionarParaHome = () => {
    if (!user) {
      router.push('/');
      return;
    }

    // Verificar se é admin
    const isAdmin = user.isAdmin || user.dados?.cargo === 1;

    if (isAdmin) {
      router.push('/admin'); // Página de admin
    } else {
      router.push('/funcionario'); // Página de funcionário
    }
  }

  const fetchRelatorios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/relatorios/completos`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setRelatorio(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Carregando relatórios...
    </div>
  );

  if (!relatorio) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#dc3545'
    }}>
      Erro ao carregar relatórios
    </div>
  );

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#333',
            margin: 0
          }}>
            📊 Dashboard de Relatórios
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '16px',
            margin: '5px 0 0 0'
          }}>
            Visão geral das métricas do seu restaurante
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          alignItems: 'center'
        }}>
          <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={fetchRelatorios}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Atualizar
          </button>

          <button
            onClick={redirecionarParaHome}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏠︎
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard 
          titulo="💰 Faturamento Hoje"
          valor={`R$ ${Number(relatorio.financeiro?.faturamento?.dia || 0).toFixed(2)}`}
          crescimento={relatorio.financeiro?.crescimento?.dia}
          cor="#28a745"
        />
        <MetricCard 
          titulo="📈 Faturamento Semana"
          valor={`R$ ${Number(relatorio.financeiro?.faturamento?.semana || 0).toFixed(2)}`}
          crescimento={relatorio.financeiro?.crescimento?.semana}
          cor="#17a2b8"
        />
        <MetricCard 
          titulo="📊 Faturamento Mês"
          valor={`R$ ${Number(relatorio.financeiro?.faturamento?.mes || 0).toFixed(2)}`}
          crescimento={relatorio.financeiro?.crescimento?.mes}
          cor="#6f42c1"
        />
        <MetricCard 
          titulo="🎯 Ticket Médio"
          valor={`R$ ${Number(relatorio.financeiro?.ticketMedio?.dia || 0).toFixed(2)}`}
          subvalor="hoje"
          cor="#fd7e14"
        />
      </div>

      {/* Segunda linha de métricas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard 
          titulo="🛍️ Pedidos Hoje"
          valor={relatorio.operacional?.totalPedidos?.dia || 0}
          cor="#20c997"
        />
        <MetricCard 
          titulo="📱 Pedidos Semana"
          valor={relatorio.operacional?.totalPedidos?.semana || 0}
          cor="#6610f2"
        />
        <MetricCard 
          titulo="📅 Pedidos Mês"
          valor={relatorio.operacional?.totalPedidos?.mes || 0}
          cor="#e83e8c"
        />
        <MetricCard 
          titulo="❌ Taxa Cancelamento"
          valor={`${relatorio.performance?.taxaCancelamento || 0}%`}
          cor="#dc3545"
        />
      </div>

      {/* Seções de gráficos e tabelas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '25px'
      }}>
        
        {/* Produtos Mais Vendidos */}
        <ChartCard titulo="🏆 Produtos Mais Vendidos">
          {relatorio.produtos?.maisVendidos?.slice(0, 5).map((produto, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < 4 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '50%',
                  width: '25px',
                  height: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </span>
                <span style={{ fontWeight: '500' }}>{produto.nome}</span>
              </div>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#28a745',
                backgroundColor: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {produto.quantidade} vendidos
              </span>
            </div>
          ))}
        </ChartCard>

        {/* Status dos Pedidos */}
        <ChartCard titulo="📋 Status dos Pedidos">
          {relatorio.operacional?.statusDistribuicao?.map((status, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < relatorio.operacional.statusDistribuicao.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span style={{ fontWeight: '500' }}>{status.status}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '100px',
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(status.count / Math.max(...relatorio.operacional.statusDistribuicao.map(s => s.count))) * 100}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(status.status),
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontWeight: 'bold', minWidth: '30px' }}>{status.count}</span>
              </div>
            </div>
          ))}
        </ChartCard>

        {/* Clientes Frequentes */}
        <ChartCard titulo="👥 Clientes Mais Frequentes">
          {relatorio.clientes?.maisFrequentes?.slice(0, 5).map((cliente, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < 4 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  backgroundColor: '#6c757d',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {cliente.nome?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span style={{ fontWeight: '500' }}>{cliente.nome}</span>
              </div>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#17a2b8',
                backgroundColor: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {cliente.pedidos} pedidos
              </span>
            </div>
          ))}
        </ChartCard>

        {/* Horários de Pico */}
        <ChartCard titulo="🕐 Horários de Pico">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '8px',
            marginBottom: '15px'
          }}>
            {relatorio.operacional?.horariosPico?.slice(6, 24).map((horario, index) => {
              const intensity = horario.pedidos / Math.max(...relatorio.operacional.horariosPico.map(h => h.pedidos));
              return (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  backgroundColor: `rgba(0, 123, 255, ${intensity})`,
                  borderRadius: '6px',
                  color: intensity > 0.5 ? 'white' : '#333',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  <div>{horario.hora}h</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>
                    {horario.pedidos}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center',
            margin: 0
          }}>
            Intensidade baseada no número de pedidos por hora
          </p>
        </ChartCard>

        {/* Novos vs Recorrentes */}
        <ChartCard titulo="🔄 Clientes Novos vs Recorrentes">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '20px 0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 auto 10px auto'
              }}>
                {relatorio.clientes?.novosVsRecorrentes?.novos || 0}
              </div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#28a745' }}>Novos</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#17a2b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 auto 10px auto'
              }}>
                {relatorio.clientes?.novosVsRecorrentes?.recorrentes || 0}
              </div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#17a2b8' }}>Recorrentes</p>
            </div>
          </div>
        </ChartCard>

        {/* Métodos de Pagamento */}
        <ChartCard titulo="💳 Métodos de Pagamento">
          {relatorio.performance?.metodoPagamento?.map((metodo, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < relatorio.performance.metodoPagamento.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                {metodo.metodo === 'pago' ? '✅ Pago' : '⏳ Pendente'}
              </span>
              <span style={{ 
                fontWeight: 'bold', 
                color: metodo.metodo === 'pago' ? '#28a745' : '#ffc107',
                backgroundColor: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {metodo.count}
              </span>
            </div>
          ))}
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({ titulo, valor, crescimento, subvalor, cor }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: `3px solid ${cor}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: cor
      }} />
      
      <h3 style={{ 
        color: '#666', 
        fontSize: '14px', 
        margin: '0 0 10px 0',
        fontWeight: '500'
      }}>
        {titulo}
      </h3>
      
      <p style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        margin: '0 0 5px 0',
        color: '#333'
      }}>
        {valor}
      </p>
      
      {crescimento && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{
            color: Number(crescimento) >= 0 ? '#28a745' : '#dc3545',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {Number(crescimento) >= 0 ? '↗️' : '↘️'} {Math.abs(crescimento)}%
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>vs período anterior</span>
        </div>
      )}
      
      {subvalor && (
        <span style={{ fontSize: '12px', color: '#666' }}>{subvalor}</span>
      )}
    </div>
  );
}

function ChartCard({ titulo, children }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        margin: '0 0 20px 0',
        color: '#333'
      }}>
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Pedido feito': return '#ffc107';
    case 'preparando': return '#fd7e14';
    case 'pronto': return '#28a745';
    case 'a caminho': return '#17a2b8';
    case 'entregue': return '#6c757d';
    default: return '#dee2e6';
  }
}