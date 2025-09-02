'use client';
import Link from 'next/link';

const icons = {
  "Pedido recebido": "📥",
  "Em preparo": "👩‍🍳",
  "Saiu para entrega": "🚚",
  "Entregue": "✅",
  "confirmed": "✅",
};

export default function Status({ status }) {
  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginTop: '30px',
        textAlign: 'center',
      }}
    >
      <h2>Status do Pedido</h2>
      <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
        {icons[status] || "⏳"} {status}
      </p>

      <Link href="/status">
        <button
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Acompanhar Pedido
        </button>
      </Link>
    </div>
  );
}
