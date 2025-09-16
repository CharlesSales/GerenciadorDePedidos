// components/ProdutoInfo.jsx
export default function ProdutoInfo({ nome, preco, imagem, pequeno }) {
  return (
    <div>
      <img
        src={imagem}
        alt={nome}
        style={{
          width: pequeno ? '100px' : '120px',
          height: pequeno ? '100px' : '120px',
          borderRadius: '8px',
          objectFit: 'cover',
          margin: '0 auto 6px auto'
        }}
      />
      <h4 style={{ fontSize: pequeno ? '14px' : '16px', margin: '4px 0' }}>{nome}</h4>
      <p style={{ fontSize: pequeno ? '12px' : '14px', color: '#333', margin: 0 }}>
        R$ {preco.toFixed(2)}
      </p>
    </div>
  );
}
