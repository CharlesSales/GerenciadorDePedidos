import { render, screen } from "@testing-library/react";
import Status from "../Status";

test("Renderiza status corretamente", () => {
  render(<Status status="Pago" />);
  expect(screen.getByText(/Pago/i)).toBeInTheDocument();
});