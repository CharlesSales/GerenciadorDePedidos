'use client';
import React from 'react';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRouter } from 'next/navigation';

export default function CarrinhoPage() {
  const { 
    carrinho, 
    adicionarAoCarrinho, 
    removerDoCarrinho, 
    alterarQuantidade, 
    limparCarrinho, 
    calcularTotal 
  } = useCarrinho();
  const router = useRouter();

  // ✅ LOGS SEGUROS
  console.log('🛒 === PÁGINA DO CARRINHO ===');
  console.log('🛒 Carrinho tipo:', typeof carrinho);
  console.log('🛒 Carrinho é array:', Array.isArray(carrinho));
  console.log('🛒 Carrinho length:', carrinho?.length || 0);

  let total = 0;
  try {
    total = calcularTotal();
    if (isNaN(total)) total = 0;
  } catch (error) {
    console.error('❌ Erro ao calcular total:', error);
    total = 0;
  }

  // ✅ VERIFICAR SE CARRINHO É VÁLIDO
  const carrinhoValido = Array.isArray(carrinho) ? carrinho.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (!item.id_produto || !item.nome) return false;
    return true;
  }) : [];

  console.log('🛒 Itens válidos no carrinho:', carrinhoValido.length);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',  
      alignItems: 'center',      
      minHeight: '100vh',           
      width: '100%',              
      padding: '20px'
    }}>     

      {/* ✅ CARRINHO VAZIO */}
      {carrinhoValido.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '100px', margin: 0 }}>🛒</h1>
          <p style={{ fontSize: '24px', marginBottom: '20px' }}>Carrinho vazio</p>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Adicione alguns produtos para continuar
          </p>
          <button
            onClick={() => router.push('/produtos')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Ver Produtos
          </button>
        </div>
      )}

      {/* ✅ CARRINHO COM ITENS */}
      {carrinhoValido.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Seu Carrinho ({carrinhoValido.length} {carrinhoValido.length === 1 ? 'item' : 'itens'})
          </h1>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '10px'
          }}>
            {carrinhoValido.map((item, index) => {
              // ✅ PROCESSAR ITEM DE FORMA SEGURA
              let nomeItem, precoItem, quantidadeItem, subtotalItem;
              
              try {
                nomeItem = item.nome ? String(item.nome) : 'Produto sem nome';
                precoItem = parseFloat(item.preco) || 0;
                quantidadeItem = parseInt(item.quantidade) || 1;
                subtotalItem = precoItem * quantidadeItem;
                
                if (isNaN(subtotalItem)) subtotalItem = 0;
                
              } catch (error) {
                console.error('❌ Erro ao processar item do carrinho:', item, error);
                return (
                  <div key={`erro-${index}`} style={{
                    border: '1px solid #dc3545',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    color: '#dc3545'
                  }}>
                    ❌ Erro ao exibir item
                  </div>
                );
              }

              return (
                <div
                  key={`item-${item.id_produto}-${index}`}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {/* ✅ INFO DO PRODUTO */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                      {nomeItem}
                    </h3>
                    <p style={{ margin: '0', color: '#666' }}>
                      R$ {precoItem.toFixed(2)} x {quantidadeItem} = 
                      <strong> R$ {subtotalItem.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* ✅ CONTROLES */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        try {
                          if (quantidadeItem > 1) {
                            alterarQuantidade(item.id_produto, quantidadeItem - 1);
                          } else {
                            removerDoCarrinho(item.id_produto);
                          }
                        } catch (error) {
                          console.error('❌ Erro ao diminuir quantidade:', error);
                        }
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      ➖
                    </button>
                    
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'center'
                    }}>
                      {quantidadeItem}
                    </span>
                    
                    <button
                      onClick={() => {
                        try {
                          adicionarAoCarrinho(item);
                        } catch (error) {
                          console.error('❌ Erro ao aumentar quantidade:', error);
                        }
                      }}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      ➕
                    </button>

                    <button
                      onClick={() => {
                        try {
                          removerDoCarrinho(item.id_produto);
                        } catch (error) {
                          console.error('❌ Erro ao remover item:', error);
                        }
                      }}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        marginLeft: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ TOTAL */}
          <div style={{
            borderTop: '2px solid #ddd',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#28a745'
            }}>
              Total: R$ {total.toFixed(2)}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => {
                  try {
                    limparCarrinho();
                  } catch (error) {
                    console.error('❌ Erro ao limpar carrinho:', error);
                  }
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Limpar Carrinho
              </button>

              <button
                onClick={() => router.push('/confirmacao')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '12px 30px',
                  fontSize: '18px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}