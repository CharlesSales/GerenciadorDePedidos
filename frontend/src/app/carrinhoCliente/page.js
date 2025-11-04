'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CarrinhoPage() {
  const {
    carrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    calcularTotal,
  } = useCarrinho();

  const { user } = useAuth();
  const router = useRouter();

  const id_restaurante = 
    user?.dados?.id_restaurante || 
    user?.dados?.id || 
    user?.dados?.restaurante?.id_restaurante ||
    user?.dados?.restaurante?.id ||
    user?.id_restaurante ||
    user?.id;
  let total = 0;
  try {
    total = calcularTotal();
    if (isNaN(total)) total = 0;
  } catch (error) {
    console.error('❌ Erro ao calcular total:', error);
    total = 0;
  }

  const carrinhoValido = Array.isArray(carrinho)
    ? carrinho.filter(
        (item) => item && typeof item === 'object' && item.id_produto && item.nome
      )
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '16px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* 🛒 Carrinho Vazio */}
      {carrinhoValido.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '64px', margin: 0 }}>🛒</h1>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Carrinho vazio</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Adicione alguns produtos para continuar
          </p>
          <button
            onClick={() => router.push(`/cardapioCliente?restaurante=${id_restaurante}`)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '90%',
              maxWidth: '280px',
            }}
          >
            Ver Produtos
          </button>
        </div>
      )}

      {/* 🧾 Carrinho com Itens */}
      {carrinhoValido.length > 0 && (
        <>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '22px',
              marginBottom: '16px',
              color: '#333',
            }}
          >
            Seu Carrinho ({carrinhoValido.length}{' '}
            {carrinhoValido.length === 1 ? 'item' : 'itens'})
          </h2>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingBottom: '120px', // espaço pro rodapé fixo
            }}
          >
            {carrinhoValido.map((item, index) => {
              const nomeItem = item.nome || 'Produto sem nome';
              const precoItem = parseFloat(item.preco) || 0;
              const quantidadeItem = parseInt(item.quantidade) || 1;
              const subtotalItem = precoItem * quantidadeItem;

              return (
                <div
                  key={`item-${item.id_produto}-${index}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '60%' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          margin: 0,
                          color: '#333',
                        }}
                      >
                        {nomeItem}
                      </h3>
                      <p
                        style={{
                          margin: '4px 0',
                          color: '#666',
                          fontSize: '14px',
                        }}
                      >
                        R$ {precoItem.toFixed(2)} x {quantidadeItem} ={' '}
                        <strong style={{ color: '#28a745' }}>
                          R$ {subtotalItem.toFixed(2)}
                        </strong>
                      </p>
                    </div>

                    {/* Controles */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() =>
                          quantidadeItem > 1
                            ? alterarQuantidade(item.id_produto, quantidadeItem - 1)
                            : diminuirQuantidade(item.id_produto)
                        }
                        style={botaoAcao('#dc3545')}
                      >
                        ➖
                      </button>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          width: '28px',
                        }}
                      >
                        {quantidadeItem}
                      </span>
                      <button
                        onClick={() => adicionarAoCarrinho(item)}
                        style={botaoAcao('#28a745')}
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => removerDoCarrinho(item.id_produto)}
                        style={botaoAcao('#6c757d')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé fixo com total */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              backgroundColor: '#fff',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 999,
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#28a745',
              }}
            >
              Total: R$ {total.toFixed(2)}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                maxWidth: '400px',
                justifyContent: 'space-between',
              }}
            >
              <button
                onClick={() => limparCarrinho()}
                style={{
                  ...botaoPrincipal('#6c757d'),
                  flex: 1,
                }}
              >
                Limpar
              </button>

              <button
                // onClick={() => router.push('/confirmacaoCliente')}
                onClick={() => router.push('/teste')}
                style={{
                  ...botaoPrincipal('#28a745'),
                  flex: 2,
                }}
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ✅ Funções utilitárias para estilos */
function botaoAcao(cor) {
  return {
    backgroundColor: cor,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '16px',
    cursor: 'pointer',
  };
}

function botaoPrincipal(cor) {
  return {
    backgroundColor: cor,
    color: 'white',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };
}
