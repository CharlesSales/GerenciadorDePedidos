// components/MenuOpcoes.jsx
export default function MenuOpcoes({ onAlterarStatus }) {
  return (
    <ul
      style={{
        position: "absolute",
        top: "40px",
        right: "10px",
        listStyle: "none",
        margin: 0,
        padding: "10px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        minWidth: "150px",
        zIndex: 10
      }}
    >
      <li
        style={{ padding: "5px 10px", cursor: "pointer" }}
        onClick={onAlterarStatus}
      >
        Alterar status
      </li>
    </ul>
  );
}
