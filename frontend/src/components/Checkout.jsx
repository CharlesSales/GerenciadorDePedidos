import applyPromotions from "../Promotions";

export default function Checkout({ items }) {
  const { total, discount, finalTotal } = applyPromotions(items);

  return (
    <div>
      <h2>Checkout</h2>
      <p>Total: R${total}</p>
      <p>Desconto: R${discount}</p>
      <p>Total Final: R${finalTotal}</p>
    </div>
  );
}


