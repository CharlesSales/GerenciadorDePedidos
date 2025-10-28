'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import styles from "../app/page.module.css"
import Link from "next/link";
import { useCarrinho } from '@/context/CarrinhoContext'

export default function Confirmacao({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [mesa, setMesa ] = useState("")
  const [casa, setCasa] = useState("");
  const [obs, setObs] = useState("");
  const [enviado, setEnviado] = useState(false);

  const { user, token } = useAuth(); // usuario logado
//   const router = useRouter();

  const { limparCarrinho } = useCarrinho();

  // Se o usuário logado for funcionário, já marcamos ele
//   const funcionarioId = user?.tipo === 'funcionario' ? user.dados?.id_funcionario : null;
  const restauranteId = user?.dados?.restaurante?.id_restaurante || null;

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
      cozinha: produto?.cozinha
    };
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  const total = itensParaBackend.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const handleConfirmarPedido = async () => {
    if (!cliente || !mesa || !casa || itensParaBackend.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um produto.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/pedidosGeral/cliente`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}` // se precisar autenticação
        },
        body: JSON.stringify({
          cliente,
          mesa, 
          casa,
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

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#2d6a4f" }}>✅ Pedido Confirmado!</h2>

      {!enviado && (
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <label style={{ display: "block", marginBottom: "10px" }}>
            <span>👤 Numero no QR code:</span>
            <input
              type="text"
              value={mesa}
              onChange={e => setMesa(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>
          
          <label style={{ display: "block", marginBottom: "10px" }}>
            <span>👤 Nome do Cliente:</span>
            <input
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>

          {/* {funcionarioId && (
            <p style={{ marginBottom: "20px" }}>🧑‍🍳 Funcionário: {user.dados.nome}</p>
          )}

          {funcionarioId && (
            <p style={{ marginBottom: "20px" }}>🧑‍🍳 Restaurante: {user.dados?.restaurante?.id_restaurante}</p>
          )} */}

          <label style={{ display: "block", marginBottom: "20px" }}>
            <span>🏠 Número da casa:</span>
            <input
              type="text"
              value={casa}
              onChange={e => setCasa(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "20px" }}>
            <span>🏠 Detalhe do pedido:</span>
            <input
              type="text"
              value={obs}
              onChange={e => setObs(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>

          <h3 style={{ marginBottom: "10px" }}>📋 Resumo do pedido:</h3>
          <div style={{ background: "#fff", padding: "15px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "20px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {itensParaBackend.map((item, idx) => (
                <li key={item.produto_id + '-' + idx}>
                  <strong>{item.nome}</strong> — {item.quantidade}x R$ {item.preco.toFixed(2)} = 
                  <span> R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <h3 style={{ textAlign: "right", marginTop: "10px" }}>💰 Total: R$ {total.toFixed(2)}</h3>
          </div>

          <button
            onClick={handleConfirmarPedido}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2d6a4f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            🚀 Enviar Pedido
          </button>
        </div>
      )}

      {enviado && (
        <div className={styles.page}>
          <p style={{ textAlign: "center", color: "#2d6a4f", fontWeight: "bold", fontSize: "18px" }}>
            🎉 Pedido enviado com sucesso!
          </p>
          <main className={styles.main}>
            <div className={styles.ctas}>
              <Link href="/pedidos_geral" className={styles.primary}>VER PEDIDOS</Link>
              <Link href="/" className={styles.primary}>VOLTAR PARA O INICIO</Link>          
            </div>
          </main>
          <footer className={styles.footer}>
            <p>© 2025 FoodFlow </p>
          </footer>
        </div>
      )}
    </div>
  );
}
