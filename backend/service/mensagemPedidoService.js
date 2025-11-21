class MensagemPedidoService {
  
  // FORMATAR PEDIDO COMPLETO (FUNCIONÁRIO)
  static formatarPedidoCompleto(pedido, restaurante) {
    const itens = JSON.parse(pedido.pedidos || '[]');
    const dataHora = new Date(pedido.data_hora).toLocaleString('pt-BR');
    
    let mensagem = `🍽️ *NOVO PEDIDO - ${restaurante.nome_restaurante}*\n`;
    mensagem += `📅 ${dataHora}\n`;
    mensagem += `🆔 Pedido #${pedido.id_pedido}\n\n`;

    // Informações do pedido
    mensagem += `👤 *Cliente:* ${pedido.nome_cliente}\n`;
    if (pedido.funcionario) mensagem += `👨‍💼 *Funcionário:* ${pedido.funcionario}\n`;
    if (pedido.casa) mensagem += `🏠 *Casa:* ${pedido.casa}\n\n`;

    // Itens do pedido
    mensagem += `📦 *ITENS DO PEDIDO:*\n`;
    let subtotal = 0;

    itens.forEach((item, index) => {
      const preco = parseFloat(item.preco || 0);
      const quantidade = parseInt(item.quantidade || 1);
      const itemTotal = preco * quantidade;
      subtotal += itemTotal;

      mensagem += `${index + 1}. *${item.nome}*\n`;
      mensagem += `   Qtd: ${quantidade}x | Valor: R$ ${preco.toFixed(2)}\n`;
      mensagem += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
    });

    // Total
    mensagem += `💰 *TOTAL: R$ ${pedido.total.toFixed(2)}*\n\n`;

    // Observações
    if (pedido.detalhe) {
      mensagem += `📝 *Observações:* ${pedido.detalhe}\n\n`;
    }

    // Status
    mensagem += `📊 *Status:* ${pedido.status || 'Pendente'}\n`;
    mensagem += `💳 *Pagamento:* ${pedido.pag === 'pago' ? '✅ Pago' : '⏳ Pendente'}\n\n`;

    mensagem += `⏰ _Pedido recebido em ${dataHora}_`;

    return mensagem;
  }

  // 📱 FORMATAR PEDIDO DE CLIENTE (MESA/CASA)
  static formatarPedidoCliente(pedido, restaurante) {
    const itens = JSON.parse(pedido.pedidos || '[]');
    const dataHora = new Date(pedido.data_hora).toLocaleString('pt-BR');
    
    let mensagem = `🍽️ *NOVO PEDIDO CLIENTE - ${restaurante.nome_restaurante}*\n`;
    mensagem += `📅 ${dataHora}\n`;
    mensagem += `🆔 Pedido #${pedido.id_pedido}\n\n`;

    // Informações do cliente
    mensagem += `👤 *Cliente:* ${pedido.nome_cliente}\n`;
    if (pedido.mesa) mensagem += `🪑 *Mesa:* ${pedido.mesa}\n`;
    if (pedido.casa) mensagem += `🏠 *Casa:* ${pedido.casa}\n\n`;

    // Itens do pedido
    mensagem += `📦 *ITENS DO PEDIDO:*\n`;
    let subtotal = 0;

    itens.forEach((item, index) => {
      const preco = parseFloat(item.preco || 0);
      const quantidade = parseInt(item.quantidade || 1);
      const itemTotal = preco * quantidade;
      subtotal += itemTotal;

      mensagem += `${index + 1}. *${item.nome}*\n`;
      mensagem += `   Qtd: ${quantidade}x | Valor: R$ ${preco.toFixed(2)}\n`;
      mensagem += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
    });

    // Total
    mensagem += `💰 *TOTAL: R$ ${pedido.total.toFixed(2)}*\n\n`;

    // Observações
    if (pedido.detalhe) {
      mensagem += `📝 *Observações:* ${pedido.detalhe}\n\n`;
    }

    // Status
    mensagem += `📊 *Status:* ${pedido.status || 'Pendente'}\n`;
    mensagem += `💳 *Pagamento:* ${pedido.pag === 'pago' ? '✅ Pago' : '⏳ Pendente'}\n\n`;

    mensagem += `⏰ _Pedido recebido em ${dataHora}_`;

    return mensagem;
  }

}

export default MensagemPedidoService;