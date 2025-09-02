'use client';
import { useCarrinho } from '@/context/CarrinhoContext';
import Confirmacao from '@/components/Confirmacao';

export default function Page() {
  const { carrinho, produtos } = useCarrinho();

  return <Confirmacao pedidoConfirmado={carrinho} produtos={produtos} />;
}
