'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ListaMesas({
    mesas,
    loading,
    filtro,
    setFiltro,
    coluna,
    setColuna,
    statusSelecionado,
    setStatusSelecionado,
}) {

    const router = useRouter();

    // Modal para exibir QR CODE
    const [mesaSelecionada, setMesaSelecionada] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);

    const abrirQrModal = (mesa) => {
        setMesaSelecionada(mesa);
        setShowQrModal(true);
    };

    const fecharQrModal = () => {
        setShowQrModal(false);
        setMesaSelecionada(null);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', height: '100vh', flexDirection: 'column'
            }}>

                <div style={{
                    width: '50px', height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #007bff',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                }}></div>

                <p>Carregando mesas...</p>

                <style jsx>{`
                    @keyframes spin { 
                        0% { transform: rotate(0deg); } 
                        100% { transform: rotate(360deg); } 
                    }
                `}</style>

            </div>
        );
    }

    if (!Array.isArray(mesas)) {
        return (
            <div style={{ padding: 50 }}>
                <h2>Erro ao carregar as mesas</h2>
                <button onClick={() => window.location.reload()}>Recarregar</button>
            </div>
        );
    }

    const mesasValidas = mesas.filter(m => m && m.id && m.numeroMesa);

    const statusList = [...new Set(mesasValidas.map(m => m.status).filter(Boolean))];

    const mesasFiltradas = mesasValidas.filter(mesa => {
        const passaStatus = statusSelecionado ? mesa.status === statusSelecionado : true;

        let passaBusca = true;
        if (filtro && filtro.trim() !== '') {
            const valorBusca = mesa[coluna];
            if (valorBusca) {
                passaBusca = valorBusca.toString().toLowerCase().includes(filtro.toLowerCase());
            }
        }

        return passaStatus && passaBusca;
    });

    return (
        <div style={{ paddingTop: '100px' }}>

            {/* MODAL DO QR CODE */}
            {showQrModal && mesaSelecionada && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: 30,
                        borderRadius: 12,
                        width: '90%',
                        maxWidth: 400,
                        textAlign: 'center'
                    }}>

                        <h3 style={{ color: '#007bff', marginBottom: 12 }}>
                            QR Code da Mesa #{mesaSelecionada.numeroMesa}
                        </h3>

                        <img
                            src={mesaSelecionada.qr_imagem}
                            alt="~Qr code indisponivel"
                            style={{
                                width: 220,
                                height: 220,
                                objectFit: 'contain',
                                borderRadius: 12,
                                border: '1px solid #eee',
                                background: '#fff'
                            }}
                            onError={(e) => {
                                e.target.style.display = "none";
                                const parent = e.target.parentElement;
                                parent.innerHTML =
                                    '<p style="color:#999; margin-top:20px;">QR Code indisponível</p>';
                            }}
                        />

                        <button
                            onClick={fecharQrModal}
                            style={{
                                marginTop: 20,
                                backgroundColor: '#6c757d',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* FILTROS */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                background: 'white',
                padding: 20,
                display: 'flex', gap: 15,
                flexWrap: 'wrap',
                justifyContent: 'center',
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>

                <select value={coluna} onChange={(e) => setColuna(e.target.value)}
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="numeroMesa">Número</option>
                    <option value="status">Status</option>
                </select>

                <input
                    type="text"
                    placeholder={`Filtrar por ${coluna}...`}
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />

                <button
                    onClick={() => setStatusSelecionado("")}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: statusSelecionado === "" ? '#007bff' : '#f8f9fa',
                        color: statusSelecionado === "" ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}
                >
                    Todas ({mesasValidas.length})
                </button>

                {statusList.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusSelecionado(status)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: statusSelecionado === status ? '#007bff' : '#f8f9fa',
                            color: statusSelecionado === status ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        {status}
                    </button>
                ))}

                <button
                    onClick={() => router.push('/cadastrarMesa')}
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
                    ➕ Nova Mesa
                </button>
            </div>

            {/* LISTA DE MESAS */}
            <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>

                {mesasFiltradas.length > 0 ? (
                    mesasFiltradas.map(mesa => (
                        <div key={`mesa-${mesa.id}`} style={{
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>

                            <div style={{
                                width: '60px', height: '60px',
                                borderRadius: '50%', backgroundColor: '#007bff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '22px', color: 'white', margin: '0 auto 16px'
                            }}>
                                {mesa.numeroMesa}
                            </div>

                            <h3 style={{ textAlign: 'center', margin: 0 }}>Mesa #{mesa.numeroMesa}</h3>

                            <p style={{ textAlign: 'center', color: '#666' }}>
                                🟢 <strong>Status:</strong> {mesa.status}
                            </p>

                            <div style={{ textAlign: 'center', marginTop: 12 }}>

                                <button
                                    onClick={() => abrirQrModal(mesa)}
                                    style={{
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📷 Ver QR Code
                                </button>

                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', width: '100%' }}>Nenhuma mesa encontrada.</p>
                )}
            </div>
        </div>
    );
}
