const PERMISSOES = {
  'admin': {
    produtos: true,
    pedidos: true,
    funcionarios: true,
    relatorios: true,
    configuracoes: true
  },
  'garcom': {
    produtos: true, // apenas visualizar
    pedidos: true,  // criar e gerenciar
    funcionarios: false,
    relatorios: false,
    configuracoes: false
  },
  'cozinheiro': {
    produtos: true, // apenas visualizar
    pedidos: true,  // apenas atualizar status
    funcionarios: false,
    relatorios: false,
    configuracoes: false
  }
};