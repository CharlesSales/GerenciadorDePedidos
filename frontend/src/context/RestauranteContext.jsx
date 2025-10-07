'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RestauranteContext = createContext();

export function RestauranteProvider({ children }) {
  const { user, isAuthenticated, token } = useAuth();
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (isAuthenticated && token && user && (user.tipo === 'funcionario' || user.tipo === 'restaurante')) {
      carregarDadosRestaurante();
    } else {
      // ✅ LIMPAR DADOS SE NÃO ESTIVER AUTENTICADO
      setRestaurante(null);
      setError('');
    }
  }, [user, isAuthenticated, token]);

  const carregarDadosRestaurante = async () => {
    if (!user || !token) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🏪 Carregando dados do restaurante para usuário:', user.tipo);
      
      let restauranteId = null;
      
      if (user.tipo === 'funcionario') {
        restauranteId = user.dados?.restaurante || user.dados?.restaurante_id;
        console.log('👨‍💼 Funcionário - ID do restaurante:', restauranteId);
      } else if (user.tipo === 'restaurante') {
        restauranteId = user.dados?.id_restaurante || user.id;
        console.log('👑 Dono - ID do restaurante:', restauranteId);
      }

      if (!restauranteId) {
        console.log('❌ ID do restaurante não encontrado');
        setError('ID do restaurante não encontrado');
        return;
      }

      // ✅ BUSCAR DADOS DO RESTAURANTE SEM PREFIXO /api
      const response = await fetch(`${API_URL}/restaurante/${restauranteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta (restaurante):', response.status);

      if (response.status === 401) {
        console.log('🚫 Token inválido ao buscar restaurante');
        setError('Sessão expirada');
        return;
      }

      if (!response.ok) {
        console.log('❌ Erro ao buscar restaurante:', response.status);
        // ✅ SE NÃO TEM ENDPOINT DE RESTAURANTE, USAR DADOS DO USUÁRIO
        console.log('ℹ️ Usando dados do usuário como dados do restaurante');
        
        if (user.tipo === 'restaurante') {
          // ✅ USAR DADOS DO PRÓPRIO USUÁRIO RESTAURANTE
          setRestaurante({
            id_restaurante: user.dados?.id_restaurante || user.id,
            nome_restaurante: user.dados?.nome_restaurante || user.dados?.nome,
            ...user.dados
          });
          console.log('✅ Dados do restaurante carregados do usuário:', user.dados?.nome_restaurante);
        } else if (user.tipo === 'funcionario') {
          // ✅ CRIAR OBJETO BÁSICO PARA FUNCIONÁRIO
          setRestaurante({
            id_restaurante: restauranteId,
            nome_restaurante: user.restaurante_info?.nome || 'Restaurante',
            ...user.restaurante_info
          });
          console.log('✅ Dados básicos do restaurante carregados para funcionário');
        }
        return;
      }

      const data = await response.json();
      setRestaurante(data);
      console.log(`🏪 Dados do restaurante carregados via API: ${data.nome_restaurante}`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar restaurante:', error);
      
      // ✅ FALLBACK - USAR DADOS DO USUÁRIO
      console.log('ℹ️ Usando fallback - dados do usuário');
      
      if (user.tipo === 'restaurante') {
        setRestaurante({
          id_restaurante: user.dados?.id_restaurante || user.id,
          nome_restaurante: user.dados?.nome_restaurante || user.dados?.nome,
          ...user.dados
        });
      } else if (user.tipo === 'funcionario') {
        setRestaurante({
          id_restaurante: user.dados?.restaurante || user.dados?.restaurante_id,
          nome_restaurante: user.restaurante_info?.nome || 'Restaurante',
          ...user.restaurante_info
        });
      }
      
      setError('Erro ao conectar com servidor, usando dados em cache');
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFICAR PERMISSÕES DO USUÁRIO
  const temPermissao = (recurso) => {
    if (!user) return false;
    
    // ✅ DONO DO RESTAURANTE TEM TODAS AS PERMISSÕES
    if (user.tipo === 'restaurante') return true;
    
    // ✅ FUNCIONÁRIO - VERIFICAR CARGO
    if (user.tipo === 'funcionario') {
      if (user.dados?.cargo === 'gerente' || user.dados?.cargo === 'admin') {
        return true;
      }
      
      // ✅ VERIFICAR PERMISSÕES ESPECÍFICAS
      if (user.cargo_info?.is_admin) return true;
      return user.cargo_info?.permissoes?.[recurso] || false;
    }
    
    return false;
  };

  // ✅ FUNÇÃO PARA OBTER ID DO RESTAURANTE
  const getRestauranteId = () => {
    if (restaurante) {
      return restaurante.id_restaurante;
    }
    
    if (user?.tipo === 'funcionario') {
      return user.dados?.restaurante || user.dados?.restaurante_id;
    } else if (user?.tipo === 'restaurante') {
      return user.dados?.id_restaurante || user.id;
    }
    
    return null;
  };

  const value = {
    restaurante,
    loading,
    error,
    temPermissao,
    carregarDadosRestaurante,
    getRestauranteId
  };

  return (
    <RestauranteContext.Provider value={value}>
      {children}
    </RestauranteContext.Provider>
  );
}

export const useRestaurante = () => {
  const context = useContext(RestauranteContext);
  if (!context) {
    throw new Error('useRestaurante deve ser usado dentro de RestauranteProvider');
  }
  return context;
};