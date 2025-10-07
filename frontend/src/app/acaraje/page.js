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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                🥘 Acarajé da Bahia
              </h1>
            </div>
            
            {/* ✅ ÁREA DO USUÁRIO COM LOGOUT */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Olá, <span className="font-medium">{user?.dados?.nome || 'Usuário'}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ CONTEÚDO DA PÁGINA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Bem-vindo ao Sistema de Pedidos!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ✅ CARDS DE FUNCIONALIDADES */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">📋 Pedidos</h3>
              <p className="text-blue-600 text-sm">Gerenciar pedidos do restaurante</p>
              <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                Ver Pedidos
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">🍽️ Produtos</h3>
              <p className="text-green-600 text-sm">Cadastrar e editar produtos</p>
              <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600">
                Ver Produtos
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">👥 Funcionários</h3>
              <p className="text-purple-600 text-sm">Gerenciar equipe</p>
              <button className="mt-3 bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600">
                Ver Funcionários
              </button>
            </div>
          </div>

          {/* ✅ INFO DO USUÁRIO */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">ℹ️ Informações da Sessão</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nome:</strong> {user?.dados?.nome || 'N/A'}</p>
              <p><strong>Tipo:</strong> {user?.tipo || 'N/A'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Restaurante:</strong> {user?.dados?.restaurante || user?.dados?.id_restaurante || 'N/A'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}