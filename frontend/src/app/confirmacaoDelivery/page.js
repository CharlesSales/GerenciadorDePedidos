'use client';
import { useCarrinho } from '@/context/CarrinhoContext';
import Confirmacao from '@/components/ConfirmacaoDelivery';

export default function Page() {
  const { carrinho, produtos } = useCarrinho();

  const produtosArray = Array.isArray(produtos) ? produtos : [produtos];

  return <Confirmacao pedidoConfirmado={carrinho} produtos={produtosArray} />;
}
