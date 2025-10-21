'use client';
import React from "react";

export default function HeaderPedidos({ user, filtroData, setFiltroData }) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
        />
      </div>
    </div>
  );
}
