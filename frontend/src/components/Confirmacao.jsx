'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import styles from "../app/page.module.css"
import Link from "next/link";


export default function Confirmacao({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionario, setFuncionario] = useState("");
  const [casa, setCasa] = useState("");
  const [enviado, setEnviado] = useState(false);
  const router = useRouter()

  const itensParaBackend = Object.entries(pedidoConfirmado).map(
    ([produtoId, quantidade]) => {
      const produto = produtos.find(p => p.id_produto === parseInt(produtoId));
      return {
        produto_id: produto?.id_produto,
        nome: produto?.nome,
        quantidade,
        preco: Number(produto?.preco || 0),
        cozinha: produto?.cozinha
      };
    }
  );


  //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/funcionarios`)
      .then(res => res.json())
      .then(data => setFuncionarios(data))
      .catch(err => console.error("Erro ao carregar funcionários:", err));
  }, []);

  const total = itensParaBackend.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const handleConfirmarPedido = async () => {
    if (!cliente || !funcionario || !casa || itensParaBackend.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um produto.");
      return;
    }


    try {
      const itensAlmoco = itensParaBackend.filter(i => i.cozinha === "almoço");
      const itensAcaraje = itensParaBackend.filter(i => i.cozinha === "acaraje");
      const itensTotal = itensParaBackend


      if (itensAlmoco.length > 0) {
        await fetch(`${API_URL}/pedidosRestaurante`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente, funcionario, casa, itens: itensAlmoco, total })
        });
      }
      if (itensAcaraje.length > 0) {
        await fetch(`${API_URL}/pedidosAcaraje`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente, funcionario, casa, itens: itensAcaraje, total })
        });
      }
      if (itensTotal.length > 0) {
        await fetch (`${API_URL}/pedidosGeral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({cliente, funcionario, casa, itens: itensParaBackend, total})
        })
      
      }


      setEnviado(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar pedido");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#2d6a4f" }}>✅ Pedido Confirmado!</h2>

      {!enviado && (
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <label style={{ display: "block", marginBottom: "10px" }}>
            <span>👤 Nome do Cliente:</span>
            <input
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "10px" }}>
            <span>🧑‍🍳 Funcionário:</span>
            <select
              value={funcionario}
              onChange={e => setFuncionario(Number(e.target.value))}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map(f => (
                <option key={f.id_funcionario} value={f.id_funcionario}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: "20px" }}>
            <span>🏠 Número da casa:</span>
            <input
              type="text"
              value={casa}
              onChange={e => setCasa(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </label>

          <h3 style={{ marginBottom: "10px" }}>📋 Resumo do pedido:</h3>
          <div style={{ background: "#fff", padding: "15px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "20px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {itensParaBackend.map((item, idx) => (
                <li key={`${item.produto_id}-${idx}`} style={{ marginBottom: "8px" }}>
                  <strong>{item.nome}</strong> — {item.quantidade}x R$ {item.preco.toFixed(2)} = 
                  <span style={{ color: "#2d6a4f", fontWeight: "bold" }}> R$ {(item.preco * item.quantidade).toFixed(2)}</span>
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
          <Link href="/acaraje" className={styles.primary}>
            VER PEDIDOS
          </Link>
          <Link href="/" className={styles.primary}>
            VOLTAR PARA O INICIO
          </Link>          
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Acarajé da Mari</p>
      </footer>
    </div>
      )}
    </div>
  );
}

