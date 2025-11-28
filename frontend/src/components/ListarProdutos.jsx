'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ListaProdutos({
    produtos,
    loading,
    filtro,
    setFiltro,
    coluna,
    setColuna,
    categoriaSelecionada,
    setCategoriaSelecionada,
    deletarProduto
}) {
    const router = useRouter();

    const [produtoDeletando, setProdutoDeletando] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

    const handleDeleteProduto = async (produto) => {
        try {
            setProdutoDeletando(produto.id_produto)

            const token = localStorage.getItem('token')

            if (!token) {
                alert('Token não encontrado')
                router.push('/login')
                return;
            }

            const response = await fetch(`${API_URL}/produtos/${produto.id_produto}`, {
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
                    errorMessage = 'Produto não encontrado.';
                } else if (response.status === 403) {
                    errorMessage = 'Sem permissão para deletar este produto.';
                }
                const errorText = await response.text();
                console.error('❌ Erro na deleção:', errorText);

                alert(`❌ ${errorMessage}`);
                return;
            }

            const result = await response.json();
            console.log('✅ Produto deletado com sucesso:', result);
            // ✅ CALLBACK PARA ATUALIZAR LISTA NO COMPONENTE PAI
            if (deletarProduto) {
                deletarProduto(produto.id_produto);
            }


            // ✅ ALTERNATIVA: RECARREGAR A PÁGINA
            // window.location.reload();

        } catch (error) {
            console.error('❌ Erro inesperado ao deletar produto:', error);
            alert(`❌ Erro inesperado: ${error.message}`);
        } finally {
            setProdutoDeletando(null);
            setShowConfirmDialog(false);
            setProdutoParaDeletar(null);
        }
    };

    const abrirConfirmacao = (produto) => {
        setProdutoParaDeletar(produto);
        setShowConfirmDialog(true);
    };

    // ✅ FUNÇÃO PARA CANCELAR DELEÇÃO
    const cancelarDelecao = () => {
        setShowConfirmDialog(false);
        setProdutoParaDeletar(null);
    };

    // ✅ FUNÇÃO PARA CONFIRMAR DELEÇÃO
    const confirmarDelecao = () => {
        if (produtoParaDeletar) {
            handleDeleteProduto(produtoParaDeletar);
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
                <p>Carregando produtos...</p>
                <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (!Array.isArray(produtos)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <h2>❌ Erro ao carregar produtos</h2>
                <p>Os dados recebidos não estão no formato esperado.</p>
                <p>Tipo recebido: {typeof produtos}</p>
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

    // ✅ FILTRAR E VALIDAR PRODUTOS
    const produtosValidos = produtos.filter(p => {
        // Verificação mais robusta
        if (!p || typeof p !== 'object') return false;
        if (!p.id_produto) return false;
        if (!p.nome || typeof p.nome !== 'string') return false;
        return true;
    });

    // ✅ EXTRAIR CATEGORIAS COM VALIDAÇÃO
    const categorias = [...new Set(
        produtosValidos
            .map(p => {
                // Verificação segura para categoria
                if (p.categoria && p.categoria.categoria_nome) {
                    return p.categoria.categoria_nome;
                }
                if (p.categoria_nome && typeof p.categoria_nome === 'string') {
                    return p.categoria_nome;
                }
                return 'Sem categoria';
            })
            .filter(Boolean)
    )];

    // ✅ FILTRAR PRODUTOS COM VALIDAÇÃO
    const produtosFiltrados = produtosValidos.filter(produto => {
        const passaCategoria = categoriaSelecionada
            ? (produto.categoria?.categoria_nome === categoriaSelecionada ||
                produto.categoria_nome === categoriaSelecionada)
            : true;

        let passaBusca = true;
        if (filtro && filtro.trim() !== '') {
            const valorBusca = produto[coluna];
            if (valorBusca != null && valorBusca !== undefined) {
                passaBusca = String(valorBusca).toLowerCase().includes(filtro.toLowerCase());
            }
        }
        return passaCategoria && passaBusca;
    });



    return (
        <div style={{ paddingTop: '100px' }}>
            {/* ✅ MODAL DE CONFIRMAÇÃO */}
            {showConfirmDialog && produtoParaDeletar && (
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
                            Tem certeza que deseja excluir o produto<br />
                            <strong>"{produtoParaDeletar.nome}"</strong>?
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
                                disabled={produtoDeletando === produtoParaDeletar?.id_produto}
                                style={{
                                    backgroundColor: produtoDeletando === produtoParaDeletar?.id_produto ? '#ccc' : '#dc3545',
                                    color: 'white',
                                    padding: '12px 24px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: produtoDeletando === produtoParaDeletar?.id_produto ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {produtoDeletando === produtoParaDeletar?.id_produto ? (
                                    <span>⏳ Deletando...</span>
                                ) : (
                                    <span>🗑️ Sim, Excluir</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                <select
                    value={coluna}
                    onChange={(e) => setColuna(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="nome">Nome</option>
                    <option value="descricao">Descrição</option>
                    <option value="preco">Preço</option>
                    <option value="categoria_nome">Categoria</option>
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
                        onClick={() => setCategoriaSelecionada("")}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: categoriaSelecionada === "" ? '#007bff' : '#f8f9fa',
                            color: categoriaSelecionada === "" ? 'white' : '#495057',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Todos ({produtosValidos.length})
                    </button>

                    {categorias.map(categoria => (
                        <button
                            key={categoria}
                            onClick={() => setCategoriaSelecionada(categoria)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: categoriaSelecionada === categoria ? '#007bff' : '#f8f9fa',
                                color: categoriaSelecionada === categoria ? 'white' : '#495057',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {String(categoria)} ({produtosValidos.filter(p =>
                                (p.categoria?.categoria_nome || p.categoria_nome) === categoria
                            ).length})
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => router.push('/cadastrarProdutos')}
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
                    ➕ Novo Produto
                </button>
            </div>

            {/* Lista de produtos */}
            <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
            }}>
                {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map(produto => {
                        // ✅ VALIDAÇÃO SEGURA DE TODAS AS PROPRIEDADES
                        const nome = produto.nome || 'Nome não informado';
                        const preco = produto.preco || 0;
                        const estoque = produto.estoque || 0;
                        const id = produto.id_produto;

                        // ✅ VERIFICAÇÃO SEGURA DA IMAGEM
                        const temImagem = produto.imagem &&
                            typeof produto.imagem === 'string' &&
                            produto.imagem.trim() !== '' &&
                            produto.imagem !== 'null' &&
                            produto.imagem !== 'undefined';

                        return (
                            <div key={`produto-${id}`} style={{
                                border: '1px solid #eee',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}>
                                {/* ✅ IMAGEM/ÍCONE DO PRODUTO */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: temImagem ? '#f8f9fa' : '#28a745',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px',
                                    color: 'white',
                                    margin: '0 auto 16px',
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    border: '3px solid #28a745',
                                    position: 'relative'
                                }}>
                                    {temImagem ? (
                                        <img
                                            src={produto.imagem}
                                            alt={nome}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                            onError={(e) => {
                                                console.log(`❌ Erro ao carregar imagem: ${produto.imagem}`);
                                                e.target.style.display = 'none';
                                                const parent = e.target.parentElement;
                                                if (parent) {
                                                    parent.style.backgroundColor = '#28a745';
                                                    parent.innerHTML = '<span style="font-size: 32px;">🍽️</span>';
                                                }
                                            }}
                                            onLoad={() => {
                                                console.log(`✅ Imagem carregada: ${produto.imagem}`);
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '32px' }}>🍽️</span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#333'
                                    }}>
                                        {nome}
                                    </h3>

                                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666' }}>
                                        <strong>Estoque:</strong> <span style={{
                                            color: estoque > 10 ? '#28a745' : estoque > 0 ? '#ffc107' : '#dc3545',
                                            fontWeight: 'bold'
                                        }}>{estoque}</span>
                                    </p>

                                    <p style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#28a745', fontWeight: 'bold' }}>
                                        preço:  R$ {Number(preco).toFixed(2)}
                                    </p>

                                    {/* ✅ INDICADOR DE IMAGEM */}
                                    {temImagem && (
                                        <p style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '12px',
                                            color: '#28a745',
                                            fontWeight: 'bold'
                                        }}>
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => abrirConfirmacao(produto)}
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


                                        <button
                                            onClick={() => router.push(`/atualizarProdutos?id=${id}`)}
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
                                        >
                                            ✏️ Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '40px',
                        fontSize: '18px',
                        color: '#666'
                    }}>
                        {filtro || categoriaSelecionada
                            ? `Nenhum produto encontrado para os filtros aplicados`
                            : `Nenhum produto cadastrado`}
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
            >
                ← Voltar
            </button>
        </div>
    );
}