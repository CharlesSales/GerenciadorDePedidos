'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import styles from "../app/page.module.css";
import Link from "next/link";
import { useCarrinho } from '@/context/CarrinhoContext';

// ✅ COMPONENTE INTERNO COM useSearchParams
function ConfirmacaoContent({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [obs, setObs] = useState("");
  const [enviado, setEnviado] = useState(false);

  const { user } = useAuth();
  const { limparCarrinho } = useCarrinho();

  const [restauranteID, setRestauranteID] = useState("null")
  const searchParams = useSearchParams();
  const id_mesa = searchParams.get('id_mesa');
  const restaurante_id = searchParams.get('id_restaurante');
  const router = useRouter();

  
  useEffect(() => {
    if (enviado) limparCarrinho();
  }, [enviado]);
  
  const itensParaBackend = pedidoConfirmado.map(item => {
    const produto = produtos.find(p => p.id_produto === item.id_produto);
    return {
      produto_id: item.id_produto,
      nome: produto?.nome || "Produto indefinido",
      quantidade: item.quantidade,
      preco: Number(item.preco_unitario || produto?.preco || 0),
      cozinha: produto?.cozinha,
      id_mesa,
      restaurante_id: produto?.restaurante || null
    };
  });
  
  const restauranteDaUrl = searchParams.get("restaurante");
  const restauranteDosItens = itensParaBackend?.[0]?.restaurante_id;
  const restauranteIdCalculado = restauranteDaUrl || restauranteDosItens || null;
  
  const restaurante = restaurante_id || restauranteID || restauranteIdCalculado
  console.log(`o id é ${restauranteIdCalculado}`)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
  const total = itensParaBackend.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const handleConfirmarPedido = async () => {
    if (enviado) return;
    console.log(itensParaBackend)
    if (!id_mesa || itensParaBackend.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um produto.");
      return;
    }

    if (restauranteIdCalculado) {
        setRestauranteID(restauranteIdCalculado); // 👈 Salva o ID
    }

    setEnviado(true);

    try {
      const response = await fetch(`${API_URL}/pedidosGeral/qrcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente,
          itens: itensParaBackend,
          obs,
          total,
          id_mesa,
          restauranteid: restauranteIdCalculado 
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
          🚀 Confirmação de Pedido
        </h2>

        {!enviado && (
          <>
            

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span>👤 Nome do Cliente:</span>
              <input
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                className="input-bright"
                style={{ width: "100%" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "20px" }}>
              <span>📝 Observações:</span>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "none",
                  height: "70px",
                }}
              />
            </label>

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
                  <li key={item.produto_id + '-' + idx}>
                    <strong>{item.nome}</strong> — {item.quantidade}x R$ {item.preco.toFixed(2)} =
                    <span> R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <h3 style={{ textAlign: "right", marginTop: "10px", color: "#2a9d8f" }}>
                💰 Total: R$ {total.toFixed(2)}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
             
              <button
                onClick={handleConfirmarPedido}
                style={{
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
              >
                ✅ Confirmar Pedido
              </button>
            </div>
          </>
        )}

        {enviado && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <div style={{ 
              fontSize: "80px", 
              marginBottom: "20px",
              animation: "bounce 1s ease-in-out infinite alternate"
            }}>
              🎉
            </div>
            
            <h3 style={{ 
              color: "#2a9d8f", 
              fontWeight: "bold", 
              fontSize: "28px",
              marginBottom: "16px"
            }}>
              Pedido enviado com sucesso!
            </h3>
            
            <div style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "30px",
              color: "#155724"
            }}>
              <p style={{ fontSize: "18px", margin: "0 0 10px 0", fontWeight: "600" }}>
                ✨ Obrigado por escolher nosso restaurante!
              </p>
              <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>
                👨‍🍳 Seu pedido foi recebido e está sendo preparado com carinho.
              </p>
              <p style={{ fontSize: "16px", margin: "0" }}>
                ⏰ Em breve será servido em sua mesa. Bom apetite!
              </p>
            </div>

            <div style={{ 
              fontSize: "14px", 
              color: "#666",
              fontStyle: "italic"
            }}>
              📱 Você pode fechar esta página ou fazer um novo pedido quando desejar.
            </div>

            <footer style={{ 
              marginTop: "40px", 
              color: "#888",
              fontSize: "14px",
              borderTop: "1px solid #eee",
              paddingTop: "20px"
            }}>
              © 2025 FoodFlow - Sistema de Pedidos
            </footer>
          </div>
        )}

       
      </div>

      {/* Estilos rápidos */}
      <style jsx>{`
        label {
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 6px;
        }
        .input-bright {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #bbb;
          background: #fff;
          transition: 0.3s;
        }
        .input-bright:focus {
          outline: none;
          border-color: #2a9d8f;
          box-shadow: 0 0 8px rgba(42, 157, 143, 0.3);
        }
      `}</style>
    </div>
  );
}

// ✅ COMPONENTE DE LOADING
function ConfirmacaoLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9f871, #f4a261, #2a9d8f)",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#ffffffee",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          padding: "40px",
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>
          🚚
        </div>
        <p style={{ fontSize: '18px', color: '#264653', fontWeight: 'bold' }}>
          Carregando confirmação...
        </p>
      </div>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL COM SUSPENSE
export default function Confirmacao({ pedidoConfirmado, produtos }) {
  return (
    <Suspense fallback={<ConfirmacaoLoading />}>
      <ConfirmacaoContent pedidoConfirmado={pedidoConfirmado} produtos={produtos} />
    </Suspense>
  );
}
