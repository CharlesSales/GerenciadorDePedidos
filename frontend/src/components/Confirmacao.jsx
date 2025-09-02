'use client';
import { useState, useEffect } from "react";

export default function Confirmacao({ pedidoConfirmado, produtos }) {
  const [cliente, setCliente] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionario, setFuncionario] = useState("");   
  const [casa, setCasa] = useState("")
  const [enviado, setEnviado] = useState(false);

  // Prepara os itens para enviar ao backend
  const itensParaBackend = Object.entries(pedidoConfirmado).map(
    ([produtoId, quantidade]) => {
      const produto = produtos.find(p => p.id_produto === parseInt(produtoId));
      return {
        produto_id: produto?.id_produto,
        nome: produto?.nome,
        quantidade,
        preco: Number(produto?.preco || 0)
      };
    }
  );

  useEffect(() => {
    fetch("http://localhost:3001/funcionario")
      .then(res => res.json())
      .then(data => setFuncionarios(data))
      .catch(err => console.error("Erro ao carregar funcionários:", err));
  }, []);


  // Calcula total geral
  const total = itensParaBackend.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const handleConfirmarPedido = async () => {
    const pedido = { cliente, funcionario, casa, itens: itensParaBackend, total };
    try {
      const res = await fetch("http://localhost:3001/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
      const data = await res.json();
      console.log("Pedido salvo:", data);
      setEnviado(true);
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
    }
  };

  return (
    <div>
      <h2>✅ Pedido Confirmado!</h2>

      {!enviado && (
        <div>
          <label>
            Nome do Cliente:
            <input
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
            />
          </label>

          <label>
            Funcionário:
            <select value={funcionario} onChange={e => setFuncionario(e.target.value)}>
              <option value="">Selecione um funcionário</option>
              {funcionarios.map(f => (
                <option key={f.id_funcionario} value={f.nome}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>


           <label>
            numero da casa:
            <input
              type="text"
              value={casa}
              onChange={e => setCasa(e.target.value)}
            />
          </label>

          <h3>Resumo do pedido:</h3>
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <ul>
              {itensParaBackend.map((item, idx) => (
                <li key={idx}>
                  {item.nome} - Quantidade: {item.quantidade} - Preço unitário: R$ {item.preco.toFixed(2)} - Total: R$ {(item.preco * item.quantidade).toFixed(2)}
                </li>
              ))}
            </ul>
            <h3>Total do pedido: R$ {total.toFixed(2)}</h3>
          </div>

          <button onClick={handleConfirmarPedido}>Enviar Pedido</button>
        </div>
      )}

      {enviado && <p>Pedido enviado com sucesso!</p>}
    </div>
  );
}
