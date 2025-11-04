'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AcarajePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout(); // ✅ Função já implementada no AuthContext
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HEADER COM BOTÃO DE LOGOUT */}
      <div style={{
          backgroundColor: 'rgba(18, 174, 101, 0.24)',
          borderRadius: '8px',
          padding: 'px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/confirmacaoDelivery')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            delivery
          </div>
        </div>

          <div style={{
          backgroundColor: 'rgba(18, 174, 101, 0.24)',
          borderRadius: '8px',
          padding: 'px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => router.push('/confirmacaoCliente')}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
            Local
          </div>
        </div>
    </div>
  );
}