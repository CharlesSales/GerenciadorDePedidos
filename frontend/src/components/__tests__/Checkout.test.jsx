import applyPromotions from "../Promotions";

test("Aplica desconto corretamente", () => {
  const items = [
    { name: "Produto A", price: 60 },
    { name: "Produto B", price: 50 },
  ];
  const result = applyPromotions(items);

  expect(result.discount).toBe(10);
  expect(result.finalTotal).toBe(100);
});