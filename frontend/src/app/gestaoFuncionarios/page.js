'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [filtro, setFiltro] = useState("");
  const [coluna, setColuna] = useState("nome");
  const [cargoSelecionado, setCargoSelecionado] = useState("");

  // ✅ GARANTIR HIDRATAÇÃO
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ✅ CARREGAR FUNCIONÁRIOS
  useEffect(() => {
    if (isHydrated) {
      carregarFuncionarios();
    }
  }, [isHydrated, token, isAuthenticated]);

  console.log('👥 Funcionários recebidos:', funcionarios);
  console.log('👥 Tipo de funcionários:', typeof funcionarios);
  console.log('👥 É array?', Array.isArray(funcionarios));

const carregarFuncionarios = async () => {
  try {
    console.log('👥 === DEBUG FUNCIONARIOS ===');
    console.log('🔐 Token disponível:', !!token);
    console.log('👤 Usuário autenticado:', isAuthenticated);

    setLoading(true);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
    console.log('🌐 Fazendo request para:', `${API_URL}/funcionarios`);

    const response = await fetch(`${API_URL}/funcionarios`, {
      method: 'GET',
      headers: headers
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro HTTP:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // ✅ TRATAMENTO ESPECÍFICO PARA 401
      if (response.status === 401) {
        console.log('🔓 Token expirado ou inválido, redirecionando para login...');
        router.push('/login');
        return;
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('👥 Dados recebidos:', data);

    if (Array.isArray(data)) {
      console.log('✅ Funcionários (array direto):', data.length);
      setFuncionarios(data);
    } else if (data && data.success && Array.isArray(data.funcionarios)) {
      console.log('✅ Funcionários (objeto success):', data.funcionarios.length);
      setFuncionarios(data.funcionarios);
    } else if (data && Array.isArray(data.data)) {
      console.log('✅ Funcionários (data property):', data.data.length);
      setFuncionarios(data.data);
    } else {
      console.warn('⚠️ Formato inesperado:', data);
      setFuncionarios([]);
    }

  } catch (error) {
    // ✅ TRATAMENTO MELHORADO DE ERRO
    console.error('❌ Erro na requisição:');
    
    if (error instanceof Error) {
      console.error('📋 Mensagem do erro:', error.message);
      console.error('📋 Stack trace:', error.stack);
    } else {
      console.error('📋 Erro não padrão:', error);
      console.error('📋 Tipo do erro:', typeof error);
      console.error('📋 Erro stringificado:', JSON.stringify(error, null, 2));
    }
    
    // ✅ VERIFICAR SE É ERRO DE REDE
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 Erro de conexão com a API');
    }
    
    setFuncionarios([]);
  } finally {
    setLoading(false);
  }
};

  // ✅ NÃO RENDERIZAR ATÉ ESTAR HIDRATADO
  if (!isHydrated) {
    return null;
  }

  // ✅ LOADING
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Carregando funcionários...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ VERIFICAR SE FUNCIONÁRIOS É VÁLIDO
  if (!Array.isArray(funcionarios)) {
    console.error('❌ Funcionários não é um array:', funcionarios);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>❌ Erro ao carregar funcionários</h2>
        <p>Os dados recebidos não estão no formato esperado.</p>
        <p>Tipo recebido: {typeof funcionarios}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Recarregar
        </button>
      </div>
    );
  }

  // ✅ FILTRAR FUNCIONÁRIOS SEGUROS
  const funcionariosValidos = funcionarios.filter(funcionario => {
    // ✅ VERIFICAR SE O FUNCIONÁRIO É UM OBJETO VÁLIDO
    if (!funcionario || typeof funcionario !== 'object') {
      console.warn('⚠️ Funcionário inválido ignorado:', funcionario);
      return false;
    }
    
    // ✅ VERIFICAR SE TEM PROPRIEDADES OBRIGATÓRIAS
    if (!funcionario.id_funcionario || !funcionario.nome) {
      console.warn('⚠️ Funcionário sem ID ou nome ignorado:', funcionario);
      return false;
    }
    
    return true;
  });

  console.log('✅ Funcionários válidos:', funcionariosValidos.length);

  // ✅ CARGOS ÚNICOS (COM VERIFICAÇÃO SEGURA)
  const cargos = [...new Set(
    funcionariosValidos
      .map(f => {
        // ✅ VERIFICAÇÃO SEGURA DO CARGO
        if (f.cargo_nome) {
          return f.cargo_nome;
        } else if (f.cargo && typeof f.cargo === 'object' && f.cargo.nome) {
          return f.cargo.nome;
        } else if (typeof f.cargo === 'string') {
          return f.cargo;
        }
        return null;
      })
      .filter(Boolean)
  )];

  console.log('💼 Cargos encontrados:', cargos);

  // ✅ APLICAR FILTROS COM VERIFICAÇÃO SEGURA
  const funcionariosFiltrados = funcionariosValidos.filter(funcionario => {
    try {
      // ✅ FILTRO POR CARGO
      const passaCargo = cargoSelecionado 
        ? (funcionario.cargo_nome === cargoSelecionado || 
           funcionario.cargo?.nome === cargoSelecionado ||
           funcionario.cargo === cargoSelecionado)
        : true;
      
      // ✅ FILTRO POR BUSCA
      let passaBusca = true;
      if (filtro && filtro.trim() !== '') {
        const valorBusca = funcionario[coluna];
        
        if (valorBusca && typeof valorBusca === 'string') {
          passaBusca = valorBusca.toLowerCase().includes(filtro.toLowerCase());
        } else if (valorBusca && typeof valorBusca === 'number') {
          passaBusca = valorBusca.toString().includes(filtro);
        } else {
          passaBusca = false;
        }
      }
      
      return passaCargo && passaBusca;
      
    } catch (error) {
      console.error('❌ Erro ao filtrar funcionário:', funcionario, error);
      return false;
    }
  });

  console.log('🔍 Funcionários após filtros:', funcionariosFiltrados.length);

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* ✅ BARRA DE FILTROS */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <select 
          value={coluna} 
          onChange={(e) => setColuna(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="nome">Nome</option>
          <option value="usuario">Usuário</option>
          <option value="cargo_nome">Cargo</option>
        </select>
        
        <input
          type="text"
          placeholder={`Filtrar por ${coluna}...`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCargoSelecionado("")}
            style={{
              padding: '8px 16px',
              backgroundColor: cargoSelecionado === "" ? '#007bff' : '#f8f9fa',
              color: cargoSelecionado === "" ? 'white' : '#495057',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Todos ({funcionariosValidos.length})
          </button>
          
          {cargos.map(cargo => (
            <button
              key={cargo}
              onClick={() => setCargoSelecionado(cargo)}
              style={{
                padding: '8px 16px',
                backgroundColor: cargoSelecionado === cargo ? '#007bff' : '#f8f9fa',
                color: cargoSelecionado === cargo ? 'white' : '#495057',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {String(cargo)} {/* ✅ GARANTIR QUE É STRING */}
            </button>
          ))}
        </div>

        {/* ✅ BOTÃO ADICIONAR FUNCIONÁRIO */}
        <button
          onClick={() => router.push('/funcionarios/cadastrar')}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ➕ Novo Funcionário
        </button>
      </div>

      {/* ✅ LISTA DE FUNCIONÁRIOS */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {funcionariosFiltrados.length > 0 ? (
          funcionariosFiltrados.map(funcionario => {
            try {
              // ✅ EXTRAIR DADOS SEGUROS
              const nome = funcionario.nome || 'Nome não informado';
              const usuario = funcionario.usuario || 'N/A';
              const cargo = funcionario.cargo_nome || funcionario.cargo?.nome || funcionario.cargo || 'N/A';
              const restaurante = funcionario.restaurante?.nome_restaurante || funcionario.restaurante?.nome_restaurante || 'N/A';
              const id = funcionario.id_funcionario;

              return (
                <div
                  key={`funcionario-${id}`}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* ✅ AVATAR */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    margin: '0 auto 16px',
                    fontWeight: 'bold'
                  }}>
                    {nome.charAt(0).toUpperCase()}
                  </div>

                  {/* ✅ INFORMAÇÕES */}
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      {nome}
                    </h3>
                    
                    <p style={{ 
                      margin: '0 0 6px 0', 
                      fontSize: '14px', 
                      color: '#666'
                    }}>
                      👤 <strong>Usuário:</strong> {usuario}
                    </p>
                    
                    <p style={{ 
                      margin: '0 0 6px 0', 
                      fontSize: '14px', 
                      color: '#666'
                    }}>
                      💼 <strong>Cargo:</strong> {cargo}
                    </p>
                    
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '14px', 
                      color: '#666'
                    }}>
                      🏪 <strong>Restaurante:</strong> {restaurante}
                    </p>

                    {/* ✅ AÇÕES */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      justifyContent: 'center' 
                    }}>
                      <button
                        onClick={() => router.push(`/funcionarios/editar/${id}`)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir ${nome}?`)) {
                            // TODO: Implementar exclusão
                            console.log('🗑️ Excluir funcionário:', id);
                          }
                        }}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('❌ Erro ao renderizar funcionário:', funcionario, error);
              return (
                <div key={`erro-${funcionario.id_funcionario}`} style={{
                  border: '1px solid #dc3545',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#dc3545'
                }}>
                  ❌ Erro ao exibir funcionário<br/>
                  ID: {funcionario.id_funcionario}
                </div>
              );
            }
          })
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '18px',
            color: '#666'
          }}>
            {filtro || cargoSelecionado 
              ? `Nenhum funcionário encontrado para os filtros aplicados`
              : `Nenhum funcionário cadastrado`
            }
          </div>
        )}
      </div>

      {/* ✅ BOTÃO VOLTAR */}
      <button
        onClick={() => router.push('/admin')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#6c757d',
          color: 'white',
          fontSize: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
      >
        ← Voltar
      </button>
    </div>
  );
}