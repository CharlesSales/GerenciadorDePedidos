// components/FiltroData.jsx
export default function FiltroData({ filtroData, setFiltroData }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        Filtrar por dia:{" "}
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
      </label>
    </div>
  );
}
