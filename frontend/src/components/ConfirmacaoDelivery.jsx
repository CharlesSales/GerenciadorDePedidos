'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import styles from "../app/page.module.css";
import Link from "next/link";
import { useCarrinho } from '@/context/CarrinhoContext';

export default function Confirmacao({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");
  const [referencia, setReferencia] = useState("");
  const [obs, setObs] = useState("");
  const [enviado, setEnviado] = useState(false);

  const { user } = useAuth();
  const { limparCarrinho } = useCarrinho();

  const restauranteId = user?.dados?.restaurante?.id_restaurante || null;

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
      cozinha: produto?.cozinha
    };
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
  const total = itensParaBackend.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const handleConfirmarPedido = async () => {
    if (enviado) return;

    if (!cliente || !logradouro || !numero || !bairro || !cidade || !complemento || itensParaBackend.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um produto.");
      return;
    }

    setEnviado(true);

    try {
      const response = await fetch(`${API_URL}/pedidosGeral/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente,
          logradouro,
          numero,
          bairro,
          cidade,
          complemento,
          referencia,
          itens: itensParaBackend,
          obs,
          total,
          restauranteid: restauranteId
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

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();

      setLogradouro(data.address.road || "");
      setBairro(data.address.suburb || data.address.neighbourhood || "");
      setCidade(data.address.city || data.address.town || "");
    }, () => {
      alert("Não foi possível obter sua localização.");
    });
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label>📍 Logradouro:</label>
                <input value={logradouro} onChange={e => setLogradouro(e.target.value)} className="input-bright" />
              </div>
              <div>
                <label>🏠 Número:</label>
                <input value={numero} onChange={e => setNumero(e.target.value)} className="input-bright" />
              </div>
              <div>
                <label>🏡 Bairro:</label>
                <input value={bairro} onChange={e => setBairro(e.target.value)} className="input-bright" />
              </div>
              <div>
                <label>🏙️ Cidade:</label>
                <input value={cidade} onChange={e => setCidade(e.target.value)} className="input-bright" />
              </div>
              <div>
                <label>🏢 Complemento:</label>
                <input value={complemento} onChange={e => setComplemento(e.target.value)} className="input-bright" />
              </div>
              <div>
                <label>📌 Referência:</label>
                <input value={referencia} onChange={e => setReferencia(e.target.value)} className="input-bright" />
              </div>
            </div>

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
                onClick={obterLocalizacao}
                style={{
                  padding: "12px",
                  backgroundColor: "#2a9d8f",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.3s",
                }}
              >
                📍 Usar minha localização atual
              </button>

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
            <h3 style={{ color: "#2a9d8f", fontWeight: "bold", fontSize: "22px" }}>
              🎉 Pedido enviado com sucesso!
            </h3>   
            <div style={{ marginTop: "20px", backgroundColor: 'transparent' }}>
              <Link href={`/cardapioCliente?restaurante=${restauranteId}`} className={styles.primary} style={{backgroundColor: 'transparent', color: '#ff4d4d'}}>Ver Produtos</Link>
              <Link href="/" className={styles.primary} style={{ marginLeft: '10px', backgroundColor: 'transparent', color: '#ff4d4d' }}>
                Acompanhar Entrega
              </Link>
            </div>
            <footer style={{ marginTop: "40px", color: "#555" }}>
              © 2025 FoodFlow
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
