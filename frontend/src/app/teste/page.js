'use client';
import { useRouter } from 'next/navigation';

export default function AcarajePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // 🌞 Fundo mais vivo e alegre
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}
    >
      {/* ✅ TÍTULO */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2d3436',
            margin: '0 0 10px 0'
          }}
        >
          Como deseja receber seu pedido?
        </h1>
        <p style={{ fontSize: '16px', color: '#636e72', margin: 0 }}>
          Selecione uma opção abaixo
        </p>
      </div>

      {/* ✅ BOTÃO 1 - RETIRAR NO RESTAURANTE */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
        onClick={() => router.push('/confirmacaoCliente')}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#00b894',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          🏪
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3436',
              margin: '0 0 4px 0'
            }}
          >
            Retirar no restaurante
          </h3>
          <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
            Sem taxa • 20-30 min
          </p>
        </div>
      </div>

      {/* ✅ BOTÃO 2 - RECEBER EM CASA */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
        onClick={() => router.push('/confirmacaoDelivery')}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#0984e3',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          🚚
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3436',
              margin: '0 0 4px 0'
            }}
          >
            Receber em casa
          </h3>
          <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
            Taxa R$ 5,00 • 40-50 min
          </p>
        </div>
      </div>
    </div>
  );
}
