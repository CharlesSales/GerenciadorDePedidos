'use client';
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HeaderPedidos({ user, filtroData, setFiltroData }) {
  const { user: userA } = useAuth();
  const router = useRouter();

  const redirecionarParaHome = () => {
    if (!userA) {
      router.push('/');
      return;
    }

    // Verificar se é admin
    const isAdmin = userA.isAdmin || userA.dados?.cargo === 1;

    if (isAdmin) {
      router.push('/admin'); // Página de admin
    } else {
      router.push('/funcionario'); // Página de funcionário
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Lado esquerdo - Info do restaurante */}
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
          <h1 style={{ margin: 0, color: '#333' }}>{user?.dados?.restaurante?.nome_restaurante || 'Restaurant'}</h1>
          <p style={{ margin: 0, color: '#666' }}>Pedidos do dia</p>
        </div>
      </div>

      {/* Lado direito - Calendário e botão home */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '15px' 
      }}>
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
        
        <button
          onClick={redirecionarParaHome}
          style={{
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: '20px',
            padding: '10px 14px',
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
  );
}