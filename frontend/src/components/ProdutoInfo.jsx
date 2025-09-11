// components/ProdutoInfo.jsx
export default function ProdutoInfo({ nome, preco, imagem }) {
  return (
    <>
      <img
        src={imagem}
        alt={nome}
        style={{ width: '100%', borderRadius: '6px' }}
      />
      <h2 className="text-lg font-semibold">{nome}</h2>
      <p className="text-gray-600">R$ {preco.toFixed(2)}</p>
    </>
  );
}
