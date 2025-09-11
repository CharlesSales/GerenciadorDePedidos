// components/StatusPagamento.jsx
export default function StatusPagamento({ status }) {
  const corFundo = status === "pago" ? "#d4edda" : "#f8d7da";
  const corTexto = status === "pago" ? "#155724" : "#721c24";

  return (
    <p style={{ backgroundColor: corFundo, color: corTexto, padding: "2px 5px", borderRadius: "4px" }}>
      <strong>Status de pagamento:</strong> {status}
    </p>
  );
}
