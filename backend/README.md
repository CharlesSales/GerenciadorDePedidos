# Gerenciador de Pedidos - Backend

Este é o backend do projeto **Gerenciador de Pedidos**, desenvolvido com **Node.js**, **Express** e **PostgreSQL**. Ele gerencia produtos, pedidos e funcionários, oferecendo APIs REST para comunicação com o frontend.

---

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript no servidor.
- **Express** - Framework para criação de APIs REST.
- **PostgreSQL** - Banco de dados relacional.
- **CORS** - Para permitir requisições do frontend.
- **Fetch / JSON** - Comunicação entre frontend e backend.

---

## Estrutura do Projeto
```
backend/
├── server.js # Servidor Express principal
├── package.json
└── README.md
```
---
## Rotas Disponíveis

### Produtos
- `GET /produtos` - Lista todos os produtos.
- `POST /produtos` - Cadastra um novo produto.  
  **Body JSON**:  
  ```json
  {
    "nome": "Produto X",
    "descricao": "Descrição do produto",
    "preco": 10.50,
    "estoque": 100
  }

  ```

### Pedidos
- `GET /pedidos` - Lista todos os pedidos.

- `POST /pedidos` - Salva um novo pedido.
**Body JSON**:

```json
    {
    "cliente": "Nome do Cliente",
    "funcionario": "Nome do Funcionário",
    "casa": "Número da casa",
    "itens": [
        { "produto_id": 1, "nome": "Produto X", "quantidade": 2, "preco": 10.50 }
    ],
    "total": 21.00
    }
```

### Funcionários
- `GET /funcionario` - Lista todos os funcionários cadastrados.

---

# Como Rodar Localmente
Clone o repositório:
```
git clone <URL_DO_REPOSITORIO>
cd gerenciador-pedidos/backend
```

Instale as dependências:
```
npm install
```

Configure a conexão com o PostgreSQL no server.js:
```
const pool = new Pool({
  user: 'user',
  host: 'host',
  database: 'GerenciadorDePedidos',
  password: 'SUA_SENHA',
  port: 5432,
});
```

Rode o servidor:
```
node server.js
```

O backend estará disponível em:
http://localhost:3001

---

# Próximos Passos

Colocar o backend em produção usando Render, Railway ou outro serviço compatível.
Implementar autenticação e autorização para funcionários.
Criar validações e tratamento de erros mais robustos.
Implementar logs e monitoramento de pedidos.
Adicionar endpoints adicionais conforme necessidade (ex: atualização de produtos, exclusão de pedidos).