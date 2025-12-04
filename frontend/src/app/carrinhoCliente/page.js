'use client';
import React, { Suspense } from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// ✅ COMPONENTE INTERNO COM useSearchParams
function CarrinhoContent() {
  const {
    carrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    calcularTotal,
  } = useCarrinho();

  const searchParams = useSearchParams();
  const restauranteFromUrl = searchParams.get("restaurante");
  const router = useRouter();

  // 1. Pega da URL
  const id_restaurante =
    restauranteFromUrl ||
    carrinho?.[0]?.restaurante_id || // 2. Pega do carrinho
    null;

  (`o id do restaurante é ${id_restaurante}`);

  let total = 0;
  try {
    total = calcularTotal();
    if (isNaN(total)) total = 0;
  } catch {
    total = 0;
  }

  const carrinhoValido = Array.isArray(carrinho)
    ? carrinho.filter((item) => item && typeof item === 'object' && item.id_produto && item.nome)
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '16px',
        background: 'linear-gradient(180deg, #FFF6EE 0%, #FFE9D1 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Carrinho vazio */}
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
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF7A00' }}>
            Carrinho vazio
          </p>
          <p style={{ fontSize: '15px', color: '#7A7A7A' }}>
            Adicione alguns produtos para continuar
          </p>
          <button
            onClick={() => {
              if (id_restaurante) {
                router.push(`/cardapioCliente?restaurante=${id_restaurante}`);
              } else {
                router.push('/'); // ✅ Fallback se não tiver ID
              }
            }}
            style={botaoPrincipal('#FF7A00')}
          >
            🍽️ Ver Cardápio
          </button>
        </div>
      )}

      {/* Carrinho com Itens */}
      {carrinhoValido.length > 0 && (
        <>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '24px',
              marginBottom: '16px',
              color: '#FF7A00',
              fontWeight: 'bold',
            }}
          >
            Seu Carrinho ({carrinhoValido.length}{' '}
            {carrinhoValido.length === 1 ? 'item' : 'itens'})
          </h2>

          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>
            {carrinhoValido.map((item, index) => {
              const nomeItem = item.nome || 'Produto sem nome';
              const precoItem = parseFloat(item.preco) || 0;
              const quantidadeItem = parseInt(item.quantidade) || 1;
              const subtotalItem = precoItem * quantidadeItem;

              return (
                <div
                  key={`item-${item.id_produto}-${index}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    border: '1px solid #FFE2C1',
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
                          color: '#555',
                          fontSize: '14px',
                        }}
                      >
                        R$ {precoItem.toFixed(2)} x {quantidadeItem} ={' '}
                        <strong style={{ color: '#FF7A00' }}>
                          R$ {subtotalItem.toFixed(2)}
                        </strong>
                      </p>
                    </div>

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
                        style={botaoAcao('#E53935')}
                      >
                        ➖
                      </button>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#333',
                          textAlign: 'center',
                          width: '28px',
                        }}
                      >
                        {quantidadeItem}
                      </span>
                      <button
                        onClick={() => adicionarAoCarrinho(item)}
                        style={botaoAcao('#00C851')}
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

          {/* Rodapé fixo */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 999,
              borderTop: '4px solid #FF7A00',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#FF7A00',
              }}
            >
              Total: R$ {total.toFixed(2)}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                maxWidth: '420px',
              }}
            >
              <button onClick={limparCarrinho} style={botaoPrincipal('#6c757d')}>
                Limpar
              </button>
              <button
                onClick={() => {
                  // ✅ PASSAR O RESTAURANTE ID PARA A CONFIRMAÇÃO
                  if (id_restaurante) {
                    router.push(`/teste?restaurante=${id_restaurante}`);
                  } else {
                    router.push('/teste');
                  }
                }}
                style={botaoPrincipal('#00C851')}
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

// ✅ COMPONENTE DE LOADING
function CarrinhoLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '16px',
        background: 'linear-gradient(180deg, #FFF6EE 0%, #FFE9D1 100%)',
        fontFamily: 'Inter, sans-serif',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>
        🛒
      </div>
      <p style={{ fontSize: '18px', color: '#FF7A00', fontWeight: 'bold' }}>
        Carregando carrinho...
      </p>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL COM SUSPENSE
export default function CarrinhoPage() {
  return (
    <Suspense fallback={<CarrinhoLoading />}>
      <CarrinhoContent />
    </Suspense>
  );
}

/* 🎨 Estilos utilitários */
function botaoAcao(cor) {
  return {
    backgroundColor: cor,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };
}

function botaoPrincipal(cor) {
  return {
    backgroundColor: cor,
    color: 'white',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    flex: 1,
    fontWeight: '600',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };
}