import { render, screen, fireEvent } from "@testing-library/react";
import Cart from "./Cart";

test("Adiciona e remove itens do carrinho", () => {
  const handleUpdate = jest.fn();
  render(<Cart onUpdate={handleUpdate} />);

  const addButton = screen.getByText(/Adicionar Produto/i);
  fireEvent.click(addButton);

  expect(screen.getByText(/Produto - R\$10/i)).toBeInTheDocument();

  const removeButton = screen.getByText(/Remover/i);
  fireEvent.click(removeButton);

  expect(screen.queryByText(/Produto - R\$10/i)).not.toBeInTheDocument();
});