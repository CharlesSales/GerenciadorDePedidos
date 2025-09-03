# GerenciadorDePedidos
Descrição do Projeto

O Gerenciador de Pedidos é uma aplicação web para gerenciar pedidos de produtos, com interface para selecionar produtos, informar cliente e funcionário responsável, e enviar pedidos para o backend. O sistema possui funcionalidades de carrinho de compras, resumo de pedidos, envio para banco de dados e listagem de pedidos.

O backend utiliza Node.js, Express e PostgreSQL, enquanto o frontend é desenvolvido em Next.js com React Hooks e Context API.

Funcionalidades
  - Listagem de produtos do cardápio.
  - Adicionar produtos ao carrinho.
  - Aumentar, diminuir ou remover produtos do carrinho.
  - Preenchimento de informações do pedido:
      * Nome do cliente
      * Funcionário responsável (seleção dinâmica)
      * Número da casa
  - Cálculo automático do total do pedido.
  - Envio do pedido para o banco de dados.
  - Confirmação visual do pedido.
  - Listagem de pedidos salvos no banco.

Tecnologias Utilizadas

Frontend:
  - Next.js
  - React
  - React Hooks (useState, useEffect)
  - Context API para gerenciamento global do carrinho

Backend:
  - Node.js
  - Express
  - PostgreSQL
  - pg (driver PostgreSQL)
  - CORS e JSON parsing

Banco de Dados:
  - Tabela produtos: id, nome, descrição, preço, estoque
  - Tabela pedidos: id, nome_cliente, nome_funcionario, itens (JSON), total, data_hora
  - Tabela funcionario: id, nome

## Estrutura do Projeto
```
gerenciador-pedidos/
├── backend/
│ ├── server.js # Servidor Express
│ ├── package.json
├── frontend/
│ ├── app/
│ │ ├── carrinho/ # Página do carrinho
│ │ ├── pedido/ # Página de confirmação e listagem
│ │ └── components/ # Componentes reutilizáveis (CardProduto, Status, etc.)
│ ├── context/
│ │ └── CarrinhoContext.js
│ ├── package.json
├── README.md
```

Instalação e Setup
# Backend

1. Instale as dependências:

```
cd backend
npm install
```

2. Configure o PostgreSQL (GerenciadorDePedidos) e ajuste os dados de conexão no server.js:
```
const pool = new Pool({
  user: 'user',
  host: 'host',
  database: 'database',
  password: 'senha',
  port: 5432,
});
```

3. Execute o servidor:
```
node server.js
```

4. O backend estará disponível em http://localhost:3001.

# Frontend

1. Instale as dependências:
```
cd frontend
npm install
```

2. Execute o frontend:
```
npm run dev
```

O frontend estará disponível em http://localhost:3000.


Rotas do Backend

- GET /produtos – Lista todos os produtos
- POST /produtos – Cadastra um novo produto
- GET /pedidos – Lista todos os pedidos
- POST /pedidos – Salva um novo pedido
- GET /funcionario – Lista todos os funcionários

Considerações Finais

- Todos os pedidos são salvos no banco de dados PostgreSQL.
- A aplicação utiliza fetch para comunicação entre frontend e backend.
- Componentes como Confirmacao e CardProduto são utilizados para modularização e reutilização.
- O projeto pode ser estendido com autenticação de usuários, filtros de pedidos e dashboards de vendas.

## Próximos Passos

O próximo passo do projeto é colocá-lo em **produção**, garantindo que o backend e o frontend fiquem disponíveis online.  
Algumas ações que podem ser realizadas incluem:

- Hospedar o backend em um serviço como **Heroku**, **Render** ou **AWS**.
- Hospedar o frontend em **Vercel**, **Netlify** ou outro serviço de hospedagem compatível com Next.js.
- Configurar variáveis de ambiente e conexões com o banco de dados.
- Garantir segurança, autenticação e backups.
- Testar o aplicativo em diferentes dispositivos e navegadores.

Após a produção, será possível acessar o sistema de gerenciamento de pedidos de qualquer lugar e em tempo real.
