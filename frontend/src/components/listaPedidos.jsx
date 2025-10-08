<div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
  {/* Coluna da esquerda */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {pedidosFiltrados
      .filter((_, index) => index % 2 === 0)
      .map(pedido => (
        <PedidoCard
          key={pedido.id_pedido}
          pedido={pedido}
          formatarData={formatarData}
          handleChangeStatus={handleChangeStatus}
        />
    ))}
  </div>

  {/* Coluna da direita */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {pedidosFiltrados
      .filter((_, index) => index % 2 !== 0)
      .map(pedido => (
        <PedidoCard
          key={pedido.id_pedido}
          pedido={pedido}
          formatarData={formatarData}
          handleChangeStatus={handleChangeStatus}
        />
    ))}
  </div>
</div>
