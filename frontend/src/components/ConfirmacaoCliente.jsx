'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import styles from "../app/page.module.css"
import Link from "next/link";
import { useCarrinho } from '@/context/CarrinhoContext'

export default function Confirmacao({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [mesa, setMesa] = useState("")
  const [casa, setCasa] = useState("");
  const [obs, setObs] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [opcaoRetirada, setOpcaoRetirada] = useState()
  const [opcoesList, setOpcoesList] = useState([])

  const { user, token } = useAuth();
  const { limparCarrinho } = useCarrinho();

  const [restauranteID, setRestauranteID] = useState("null")
  const searchParams = useSearchParams();

  useEffect(() => {
    if (enviado) limparCarrinho();
  }, [enviado]);

  // Preparar itens para backend
  const itensParaBackend = pedidoConfirmado.map(item => {
    const produto = produtos.find(p => p.id_produto === item.id_produto);
    return {
      produto_id: item.id_produto,
      nome: produto?.nome || "Produto indefinido",
      quantidade: item.quantidade,
      preco: Number(item.preco_unitario || produto?.preco || 0),
      cozinha: produto?.cozinha,
      restaurante_id: produto?.restaurante || restauranteDaUrl || null

    };
  });

  const restauranteDaUrl = searchParams.get("restaurante");
  const restauranteDosItens = itensParaBackend?.[0]?.restaurante_id;
  const restauranteIdCalculado = restauranteDaUrl || restauranteDosItens || null;

  console.log(`o id é ${restauranteIdCalculado}`)
  console.log(`A opção de retirada é ${opcaoRetirada}`)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/retirada`);
        const data = await res.json();
        setOpcoesList(data.map(r => ({ id: r.id, nome: r.tipo_retirada?.trim() || "" })));
      } catch (err) {
        console.error('Erro ao carregar opções', err);
      }
    };
    fetchCategorias();
  }, []);


  const total = itensParaBackend.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const handleConfirmarPedido = async () => {
    if (!cliente || itensParaBackend.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um produto.");
      return;
    }

    if (restauranteIdCalculado) {
      setRestauranteID(restauranteIdCalculado);
    }
    if (!restauranteIdCalculado) {
      alert('Não ta chegando o id')
    }

    try {
      const response = await fetch(`${API_URL}/pedidosGeral/cliente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente,
          mesa,
          casa,
          itens: itensParaBackend,
          obs,
          total,
          restauranteid: parseInt(restauranteIdCalculado),
          opcaoRetirada: opcaoRetirada && opcaoRetirada !== "" ? parseInt(opcaoRetirada) : null
        })
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Resposta não é JSON:", text);
        alert("Erro ao enviar pedido: resposta inesperada do servidor");
        return;
      }

      if (!response.ok) {
        alert(`Erro ao enviar pedido: ${data.error || data.message}`);
        return;
      }

      console.log("Pedido enviado com sucesso:", data);
      setEnviado(true);

    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Erro ao enviar pedido");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9f871, #f4a261, #2a9d8f)",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#ffffffee",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          padding: "30px 40px",
          backdropFilter: "blur(8px)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#264653", fontSize: "26px", marginBottom: "25px" }}>
          🍽️ Confirmação de Pedido
        </h2>

        {!enviado && (
          <>
            {/* ✅ SEÇÃO DE DADOS DO CLIENTE */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label>👤 Nome do Cliente:</label>
                <input
                  value={cliente}
                  onChange={e => setCliente(e.target.value)}
                  className="input-bright"
                  placeholder="Digite seu nome"
                />
              </div>

              {/* <div>
                <label>🏠 Casa:</label>
                <input 
                  value={casa} 
                  onChange={e => setCasa(e.target.value)} 
                  className="input-bright" 
                  placeholder="Número da casa"
                />
              </div> */}

              {/* <div>
                <label>🪑 Mesa:</label>
                <input 
                  value={mesa} 
                  onChange={e => setMesa(e.target.value)} 
                  className="input-bright" 
                  placeholder="Número da mesa"
                />
              </div> */}
            </div>

            {/* ✅ SELECT DE OPÇÃO DE RETIRADA */}
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span>📋 Tipo de Retirada:</span>
              <select
                value={opcaoRetirada}
                onChange={(e) => setOpcaoRetirada(e.target.value)}
                className="input-bright"
                style={{ width: "100%" }}
              >
                <option value="">Selecione uma opção</option>
                {opcoesList.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.nome}
                  </option>
                ))}
              </select>
            </label>

            {/* ✅ OBSERVAÇÕES */}
            <label style={{ display: "block", marginBottom: "20px" }}>
              <span>📝 Observações:</span>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Observações adicionais do pedido..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "none",
                  height: "70px",
                  fontFamily: "inherit"
                }}
              />
            </label>

            {/* ✅ RESUMO DO PEDIDO */}
            <div
              style={{
                background: "#fefae0",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #e9c46a",
                marginBottom: "25px",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#264653" }}>📋 Resumo do Pedido</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {itensParaBackend.map((item, idx) => (
                  <li key={item.produto_id + '-' + idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: idx < itensParaBackend.length - 1 ? "1px solid #f0f0f0" : "none"
                  }}>
                    <span>
                      <strong>{item.nome}</strong> — {item.quantidade}x R$ {item.preco.toFixed(2)}
                    </span>
                    <span style={{ fontWeight: "bold" }}>
                      R$ {(item.quantidade * item.preco).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <h3 style={{ textAlign: "right", marginTop: "10px", color: "#2a9d8f", fontSize: "20px" }}>
                💰 Total: R$ {total.toFixed(2)}
              </h3>
            </div>

            {/* ✅ BOTÃO DE CONFIRMAÇÃO */}
            <button
              onClick={handleConfirmarPedido}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#e76f51",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#d63384"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#e76f51"}
            >
              ✅ Confirmar Pedido
            </button>
          </>
        )}

        {/* ✅ TELA DE SUCESSO */}
        {enviado && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'bounce 1s infinite' }}>
              🎉
            </div>
            <h3 style={{ color: "#2a9d8f", fontWeight: "bold", fontSize: "24px", marginBottom: "20px" }}>
              Pedido enviado com sucesso!
            </h3>
            <p style={{ color: "#555", marginBottom: "30px", fontSize: "16px" }}>
              Seu pedido foi recebido e está sendo preparado. Obrigado pela preferência!
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/pedidos_geral"
                style={{
                  backgroundColor: "#2a9d8f",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "0.3s"
                }}
              >
                📋 Ver Pedidos
              </Link>
              <Link
                href={`/cardapioCliente?restaurante=${restauranteID}`}
                style={{
                  backgroundColor: "#e76f51",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "0.3s"
                }}
              >
                🏠 Voltar ao Início
              </Link>
            </div>

            <footer style={{ marginTop: "40px", color: "#555", fontSize: "14px" }}>
              © 2025 FoodFlow - Sistema de Gestão de Pedidos
            </footer>
          </div>
        )}
      </div>

      {/* ✅ ESTILOS CSS INLINE */}
      <style jsx>{`
        label {
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .input-bright {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #bbb;
          background: #fff;
          transition: 0.3s;
          font-size: 14px;
          font-family: inherit;
        }
        
        .input-bright:focus {
          outline: none;
          border-color: #2a9d8f;
          box-shadow: 0 0 8px rgba(42, 157, 143, 0.3);
        }
        
        .input-bright:hover {
          border-color: #888;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        /* ✅ RESPONSIVIDADE */
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Confirmacao({ pedidoConfirmado, produtos }) {
  return (
    <Suspense fallback={<ConfirmacaoLoading />}>
      <ConfirmacaoContent pedidoConfirmado={pedidoConfirmado} produtos={produtos} />
    </Suspense>
  );
}