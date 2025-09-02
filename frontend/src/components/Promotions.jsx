export default function applyPromotions(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const discount = total > 100 ? 10 : 0;
  const finalTotal = total - discount;

  return { total, discount, finalTotal };
}
