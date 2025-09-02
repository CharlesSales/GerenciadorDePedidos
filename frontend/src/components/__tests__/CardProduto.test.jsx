import { render, screen, fireEvent } from '@testing-library/react';
import CardProduto from '../CardProduto';

const produtoMock = {
  id: 1,
  nome: 'Sushi de Salmão',
  imagem: 'sushi.png',
  valor: 29.9,
};

describe('CardProduto', () => {
  test('deve renderizar corretamente', () => {
    render(
      <CardProduto
        produto={produtoMock}
        quantidade={1}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        onClear={jest.fn()}
      />
    );

    expect(screen.getByText('Sushi de Salmão')).toBeInTheDocument();
    expect(screen.getByText('R$ 29.90')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument();
  });

  test('deve chamar onAdd quando clicar no botão +', () => {
    const onAdd = jest.fn();

    render(
      <CardProduto
        produto={produtoMock}
        quantidade={1}
        onAdd={onAdd}
        onRemove={jest.fn()}
        onClear={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test('deve calcular corretamente o total', () => {
    render(
      <CardProduto
        produto={produtoMock}
        quantidade={3}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        onClear={jest.fn()}
      />
    );

    expect(screen.getByText('R$ 89.70')).toBeInTheDocument();
  });
});
