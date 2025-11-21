'use client';
import React, {useState} from 'react';
import { useRouter } from 'next/navigation';

export default function ListaFuncionario({
  funcionarios,
  loading,
  filtro,
  setFiltro,
  coluna,
  setColuna,
  cargoSelecionado,
  setCargoSelecionado,
  deletarFuncionario
}) {

  const router = useRouter();
  const [funcionarioDeletando, setFuncionarioDeletando] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  
  const handleDeleteFuncionario = async (funcionario) => {
    try {
      setFuncionarioDeletando(funcionario.id_funcionario)

      const token = localStorage.getItem('token')

      if (!token) {
        alert('Token não encontrado')
        router.push('/login')
        return;
      }

      const response = await fetch(`${API_URL}/funcionarios/${funcionario.id_funcionario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Status: ', response.status)

      if (!response.ok) {
        let errorMessage = 'DEU MERDA!!'

        if (response.status === 401) {
          errorMessage = 'Token expirado. Faça login novamente.';
          localStorage.removeItem('token');
          router.push('/login');
          return;
        } else if (response.status === 404) {
          errorMessage = 'Funcionario não encontrado.';
        } else if (response.status === 403) {
          errorMessage = 'Sem permissão para deletar este funcionario.';
        } else if (response.status === 500) {
          errorMessage = 'Você não pode excluir esse funcionario.'
        }
        const errorText = await response.text();
        console.error('❌ Erro na deleção:', response.status);

        alert(`❌ ${errorMessage}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Funcionario deletado com sucesso:', result);
      // ✅ CALLBACK PARA ATUALIZAR LISTA NO COMPONENTE PAI
      if (deletarFuncionario) {
        deletarFuncionario(funcionario.id_funcionario);
      }


      // ✅ ALTERNATIVA: RECARREGAR A PÁGINA
      // window.location.reload();

    } catch (error) {
      console.error('❌ Erro inesperado ao deletar Funcionario:', error);
      alert(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setFuncionarioDeletando(null);
      setShowConfirmDialog(false);
      setFuncionarioParaDeletar(null);
    }
  };

  const abrirConfirmacao = (funcionario) => {
    setFuncionarioParaDeletar(funcionario);
    setShowConfirmDialog(true);
  };

  // ✅ FUNÇÃO PARA CANCELAR DELEÇÃO
  const cancelarDelecao = () => {
    setFuncionarioParaDeletar(false);
    setFuncionarioParaDeletar(null);
  };

  // ✅ FUNÇÃO PARA CONFIRMAR DELEÇÃO
  const confirmarDelecao = () => {
    if (funcionarioParaDeletar) {
      handleDeleteFuncionario(funcionarioParaDeletar);
    }
  };


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

  if (!Array.isArray(funcionarios)) {
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

  // Filtrar funcionários válidos
  const funcionariosValidos = funcionarios.filter(f => f && f.id_funcionario && f.nome);

  const cargos = [...new Set(
    funcionariosValidos
      .map(f => f.cargo_nome || f.cargo?.nome || f.cargo)
      .filter(Boolean)
  )];

  const funcionariosFiltrados = funcionariosValidos.filter(funcionario => {
    const passaCargo = cargoSelecionado
      ? (funcionario.cargo_nome === cargoSelecionado ||
        funcionario.cargo?.nome === cargoSelecionado ||
        funcionario.cargo === cargoSelecionado)
      : true;

    let passaBusca = true;
    if (filtro && filtro.trim() !== '') {
      const valorBusca = funcionario[coluna];
      if (valorBusca) {
        passaBusca = valorBusca.toString().toLowerCase().includes(filtro.toLowerCase());
      }
    }
    return passaCargo && passaBusca;
  });

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* ✅ MODAL DE CONFIRMAÇÃO */}
      {showConfirmDialog && funcionarioParaDeletar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗑️</div>

            <h3 style={{
              margin: '0 0 16px 0',
              color: '#dc3545',
              fontSize: '20px'
            }}>
              Confirmar Exclusão
            </h3>

            <p style={{
              margin: '0 0 20px 0',
              color: '#666',
              lineHeight: '1.5'
            }}>
              Tem certeza que deseja excluir o Funcionario<br />
              <strong>"{funcionarioParaDeletar.nome}"</strong>?
            </p>

            <p style={{
              margin: '0 0 24px 0',
              color: '#dc3545',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ⚠️ Esta ação não pode ser desfeita!
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={cancelarDelecao}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✖️ Cancelar
              </button>

              <button
                onClick={confirmarDelecao}
                disabled={funcionarioDeletando === funcionarioParaDeletar?.id_funcionario}
                style={{
                  backgroundColor: funcionarioDeletando === funcionarioParaDeletar?.id_funcionario ? '#ccc' : '#dc3545',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: funcionarioDeletando === funcionarioParaDeletar?.id_funcionario ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {funcionarioDeletando === funcionarioParaDeletar?.id_funcionario ? (
                  <span>⏳ Deletando...</span>
                ) : (
                  <span>🗑️ Sim, Excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingTop: '100px' }}>
        {/* Barra de filtros */}
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
          <select value={coluna} onChange={(e) => setColuna(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
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
                {String(cargo)}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/cadastrarFuncionario')}
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

        {/* Lista de funcionários */}
        <div style={{
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {funcionariosFiltrados.length > 0 ? (
            funcionariosFiltrados.map(funcionario => {
              const nome = funcionario.nome || 'Nome não informado';
              const usuario = funcionario.usuario || 'N/A';
              const cargo = funcionario.cargo_nome || funcionario.cargo?.nome || funcionario.cargo || 'N/A';
              const restaurante = funcionario.restaurante?.nome_restaurante || 'N/A';
              const id = funcionario.id_funcionario;

              return (
                <div key={`funcionario-${id}`} style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
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

                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {nome}
                    </h3>
                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666' }}>👤 <strong>ID:</strong> {id}</p>
                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666' }}>👤 <strong>Usuário:</strong> {usuario}</p>
                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666' }}>💼 <strong>Cargo:</strong> {cargo}</p>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>🏪 <strong>Restaurante:</strong> {restaurante}</p>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>

                      <button
                        onClick={() => abrirConfirmacao(funcionario)}
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
                      >🗑️ Excluir
                      </button>

                      <button
                        onClick={() => router.push(`/atualizarFuncionarios?id=${id}`)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: 'white',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >✏️ Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
              {filtro || cargoSelecionado
                ? `Nenhum funcionário encontrado para os filtros aplicados`
                : `Nenhum funcionário cadastrado`}
            </div>
          )}
        </div>

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
        >← Voltar</button>
      </div>
    </div>
  );
}
