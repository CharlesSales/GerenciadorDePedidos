import { useState } from "react";

export default function Cart({ onUpdate }) {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    const updated = [...items, item];
    setItems(updated);
    onUpdate(updated);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onUpdate(updated);
  };

  return (
    <div>
      <h2>Carrinho</h2>
      <button onClick={() => addItem({ name: "Produto", price: 10 })}>
        Adicionar Produto
      </button>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            {item.name} - R${item.price}
            <button onClick={() => removeItem(i)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}