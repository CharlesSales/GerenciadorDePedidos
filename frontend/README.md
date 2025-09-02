# Gerenciador de Pedidos - Frontend

Este é o frontend do projeto **Gerenciador de Pedidos**, desenvolvido com **Next.js** e **React**. Ele permite que os usuários visualizem o cardápio, adicionem produtos ao carrinho, finalizem pedidos e enviem os dados para o backend.


## Tecnologias Utilizadas

- **Next.js** - Framework React para SSR e roteamento.
- **React** - Biblioteca para construção de interfaces.
- **Context API** - Para gerenciamento global do carrinho.
- **Fetch API** - Para comunicação com o backend.
- **CSS inline / módulos CSS** - Estilização dos componentes.


## Estrutura do Projeto
```
frontend/
├── app/
│ ├── carrinho/ # Página do carrinho de compras
│ ├── pedido/ # Página de confirmação e listagem de pedidos
│ └── componentes/ # Componentes reutilizáveis (CardProduto, Status, etc.)
├── context/
│ └── CarrinhoContext.js # Contexto global do carrinho
├── package.json
└── next.config.js
```

## Funcionalidades

- Exibição de produtos do cardápio.
- Adição, remoção e atualização da quantidade de produtos no carrinho.
- Visualização do resumo do pedido e cálculo do total.
- Seleção de funcionário e número da casa no momento da confirmação do pedido.
- Envio do pedido para o backend via API REST.
- Feedback visual de confirmação de envio.


## Como Rodar Localmente

1. Clone o repositório:

```
git clone <URL_DO_REPOSITORIO>
cd gerenciador-pedidos/frontend
```
Instale as dependências:
```
npm install
```

Rode o frontend:

```
npm run dev
```

Abra no navegador em:
http://localhost:3000
Certifique-se de que o backend esteja rodando e acessível em http://localhost:3001.

Próximos Passos
    - Colocar o frontend em produção usando Vercel, Netlify ou outro serviço compatível com Next.js.
    - Integrar autenticação e segurança para pedidos.
    - Melhorar responsividade e experiência do usuário.
    - Implementar cache ou otimizações de performance para produtos e pedidos.