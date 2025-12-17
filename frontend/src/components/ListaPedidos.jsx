'use client';
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HeaderPedidos({ user, filtroData, setFiltroData, filtroPeriodo, setFiltroPeriodo, filtroPagamento, setFiltroPagamento }) {
  const { user: userA } = useAuth();
  const router = useRouter();

  const redirecionarParaHome = () => {
    if (!userA) {
      router.push('/');
      return;
    }

    const isAdmin = userA.isAdmin || userA.dados?.cargo === 1;

    if (isAdmin) router.push('/admin');
    else router.push('/funcionario');
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* DIV PRINCIPAL */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
      }}>

        {/* ESQUERDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🍽️
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{user?.dados?.restaurante?.nome_restaurante || 'Restaurante'}</h1>
            <p style={{ margin: 0, color: '#666' }}>Painel de pedidos</p>
          </div>
        </div>

        {/* DIREITA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* FILTROS */}
          <div style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginRight: "20px"
          }}>
            {["dia", "semana", "mes", "todos"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroPeriodo(tipo)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: filtroPeriodo === tipo ? "#2563eb" : "#e5e7eb",
                  color: filtroPeriodo === tipo ? "white" : "black",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {tipo.toUpperCase()}
              </button>
            ))}
          </div>

          {/* CALENDÁRIO */}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />

          {/* BOTÃO HOME */}
          <button
            onClick={redirecionarParaHome}
            style={{
              backgroundColor: 'transparent',
              fontSize: '22px',
              padding: '10px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            🏠︎
          </button>
        </div>
      </div>

      {/* FILTRO DE PAGAMENTO - ABAIXO DA DIV PRINCIPAL */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: '#495057'
        }}>
          Status do Pagamento:
        </span>
        
        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          {[
            { key: "todos", label: "TODOS", color: "#6c757d", icon: "📋" },
            { key: "nao", label: "PENDENTE", color: "#ffc107", icon: "⏳" },
            { key: "pago", label: "PAGO", color: "#28a745", icon: "✅" }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFiltroPagamento(status.key)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: filtroPagamento === status.key ? status.color : "#f8f9fa",
                color: filtroPagamento === status.key ? "white" : "#495057",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
                transition: "all 0.2s ease",
                boxShadow: filtroPagamento === status.key ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseOver={(e) => {
                if (filtroPagamento !== status.key) {
                  e.target.style.backgroundColor = "#e9ecef";
                }
              }}
              onMouseOut={(e) => {
                if (filtroPagamento !== status.key) {
                  e.target.style.backgroundColor = "#f8f9fa";
                }
              }}
            >
              <span>{status.icon}</span>
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}