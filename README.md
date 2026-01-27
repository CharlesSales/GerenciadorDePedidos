# FoodFlow - Sistema de Gestão de Pedidos

## Descrição do Projeto

O **FoodFlow** é uma plataforma completa para gestão de pedidos de restaurantes e estabelecimentos alimentícios, disponível em versões **web e mobile**. O sistema oferece múltiplas interfaces para diferentes tipos de operação (mesa, delivery, acarajé) e inclui funcionalidades avançadas de administração, relatórios e gestão de funcionários.

A aplicação é desenvolvida com arquitetura moderna, utilizando **Next.js** no frontend, **Node.js/Express** no backend, e **Supabase** como banco de dados, oferecendo uma solução robusta e escalável para estabelecimentos de qualquer porte.

## Principais Funcionalidades

### 🍽️ Gestão de Pedidos
- **Pedidos por Mesa**: Interface dedicada para atendimento presencial
- **Pedidos para Delivery**: Sistema otimizado para entregas
- **Pedidos de Acarajé**: Interface especializada para venda de acarajé
- **Gestão Geral de Pedidos**: Visualização unificada de todos os pedidos

### 👥 Gestão de Usuários e Permissões
- **Sistema de Autenticação**: Login seguro com JWT
- **Gestão de Funcionários**: Cadastro e gerenciamento de equipe
- **Controle de Cargos**: Diferentes níveis de acesso (Admin, Funcionário, etc.)
- **Gestão de Restaurantes**: Multi-tenant para diferentes estabelecimentos

### 📊 Administração Avançada
- **Dashboard Administrativo**: Interface completa para gestores
- **Relatórios Detalhados**: Análise de vendas e performance
- **Gestão de Produtos**: CRUD completo de cardápio
- **Gestão de Categorias**: Organização do cardápio
- **Gestão de Mesas**: Controle de ocupação e atendimento

### 🛒 Experiência do Cliente
- **Cardápios Interativos**: Interface amigável para diferentes contextos
- **Carrinho de Compras**: Sistema intuitivo de seleção
- **Confirmação de Pedidos**: Feedback visual e confirmação
- **Status em Tempo Real**: Acompanhamento do pedido via WebSocket

### 🔧 Funcionalidades Técnicas
- **Aplicativo Mobile**: Versão nativa disponível para Android
- **Integração com WhatsApp**: Envio automático de mensagens via Zapi
- **Sistema de Retirada**: Controle de pedidos para viagem
- **Upload de Imagens**: Suporte para imagens de produtos
- **Responsividade Completa**: Interface adaptada para todos os dispositivos

## Tecnologias Utilizadas

### Frontend
- **Next.js 16** - Framework React com renderização SSR/SSG
- **React 19** - Biblioteca para construção de interfaces
- **React Hooks** - useState, useEffect, useContext
- **Context API** - Gerenciamento de estado global
- **Socket.IO Client** - Comunicação em tempo real
- **React Dropzone** - Upload de arquivos
- **CSS Modules** - Estilização componentizada

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express 5** - Framework web para APIs REST
- **Supabase** - Backend as a Service (Database + Auth)
- **Socket.IO** - Comunicação em tempo real bidirecional
- **JWT** - Autenticação e autorização segura
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **QRCode** - Geração de códigos QR
- **CORS** - Controle de acesso entre domínios

### Banco de Dados
- **Supabase (PostgreSQL)** - Banco de dados relacional em nuvem
- **Row Level Security** - Segurança em nível de linha
- **Real-time Subscriptions** - Atualizações em tempo real

### DevOps & Deploy
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de containers
- **PostgreSQL 15 Alpine** - Banco de dados local para desenvolvimento

## Estrutura do Projeto

```
FoodFlow-web/
├── docker-compose.yaml          # Orquestração de containers
├── README.md                    # Documentação principal
│
├── backend/                     # API REST e WebSocket Server
│   ├── dockerfile              # Container do backend
│   ├── server.js               # Servidor principal Express
│   ├── supabaseClient.js       # Cliente Supabase
│   ├── package.json            # Dependências do backend
│   │
│   ├── config/                 # Configurações
│   │   └── zapiConfig.js       # Config integração WhatsApp
│   │
│   ├── controllers/            # Lógica de negócio
│   │   ├── auth.js             # Autenticação
│   │   ├── pedidos*.js         # Gestão de pedidos
│   │   ├── produtos.js         # Gestão de produtos
│   │   ├── funcionarios.js     # Gestão de funcionários
│   │   ├── relatorios.js       # Relatórios e analytics
│   │   └── ...
│   │
│   ├── middleware/             # Middlewares
│   │   ├── auth.js             # Validação JWT
│   │   ├── permissoes.js       # Controle de acesso
│   │   └── restaurante.js      # Multi-tenant
│   │
│   ├── routes/                 # Definição de rotas
│   │   ├── auth.js
│   │   ├── pedidos*.js
│   │   ├── produtos.js
│   │   └── ...
│   │
│   └── service/                # Serviços externos
│       ├── mensagemPedidoService.js
│       └── zapiService.js      # Integração WhatsApp
│
├── frontend/                   # Interface Next.js
│   ├── dockerfile              # Container do frontend
│   ├── package.json            # Dependências do frontend
│   ├── next.config.mjs         # Configuração Next.js
│   ├── eslint.config.mjs       # Configuração ESLint
│   │
│   ├── public/                 # Arquivos estáticos
│   │
│   └── src/
│       ├── app/                # App Router Next.js
│       │   ├── layout.js       # Layout principal
│       │   ├── page.js         # Página inicial
│       │   ├── globals.css     # Estilos globais
│       │   │
│       │   ├── admin/          # Dashboard administrativo
│       │   ├── login/          # Autenticação
│       │   ├── funcionario/    # Área do funcionário
│       │   │
│       │   ├── cardapio*/      # Interfaces de cardápio
│       │   ├── carrinho*/      # Carrinho de compras
│       │   ├── confirmacao*/   # Confirmação de pedidos
│       │   │
│       │   ├── pedidos*/       # Gestão de pedidos
│       │   ├── produtos/       # Gestão de produtos
│       │   ├── gestao*/        # Módulos administrativos
│       │   ├── cadastrar*/     # Formulários de cadastro
│       │   ├── atualizar*/     # Formulários de edição
│       │   │
│       │   ├── relatorios/     # Relatórios e dashboards
│       │   └── status/         # Status de pedidos
│       │
│       ├── components/         # Componentes reutilizáveis
│       │   ├── Header.jsx
│       │   ├── Loading.jsx
│       │   ├── CardProduto.jsx
│       │   ├── PedidoCard.jsx
│       │   ├── Lista*.jsx      # Componentes de listagem
│       │   ├── Cadastrar*.jsx  # Componentes de cadastro
│       │   └── ...
│       │
│       ├── context/            # Context API
│       └── utils/              # Utilitários
```

## Instalação e Setup

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **Docker** e **Docker Compose** (para ambiente containerizado)
- **Conta Supabase** (para banco de dados em produção)

### 🐳 Setup com Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone <URL_DO_REPOSITORIO>
cd FoodFlow-web
```

2. **Configure as variáveis de ambiente:**
   - Crie arquivos `.env` conforme necessário
   - Configure credenciais do Supabase
   - Configure integração WhatsApp (opcional)

3. **Execute com Docker Compose:**
```bash
docker-compose up --build
```

4. **Acesse as aplicações:**
   - **Frontend:** http://localhost:3000
   - **Backend:** http://localhost:3001
   - **PostgreSQL:** localhost:5432

### 🔧 Setup Manual

#### Backend

1. **Instale as dependências:**
```bash
cd backend
npm install
```

2. **Configure o ambiente:**
```bash
# Crie um arquivo .env com:
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
JWT_SECRET=sua_chave_jwt
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

3. **Execute o servidor:**
```bash
npm run dev    # Desenvolvimento com nodemon
# ou
npm start      # Produção
```

#### Frontend

1. **Instale as dependências:**
```bash
cd frontend
npm install
```

2. **Configure o ambiente:**
```bash
# Crie um arquivo .env.local com:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
```

3. **Execute o frontend:**
```bash
npm run dev    # Desenvolvimento com Turbopack
# ou
npm run build && npm start  # Produção
```


## Principais Rotas da API

### 🔐 Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário autenticado

### 🍽️ Gestão de Produtos
- `GET /produtos` - Lista todos os produtos
- `POST /produtos` - Cadastra novo produto
- `PUT /produtos/:id` - Atualiza produto
- `DELETE /produtos/:id` - Remove produto
- `GET /categorias` - Lista categorias

### 📋 Gestão de Pedidos
- `GET /pedidos` - Lista pedidos gerais
- `POST /pedidos` - Cria novo pedido
- `PUT /pedidos/:id` - Atualiza pedido
- `GET /pedidos-restaurante` - Pedidos do restaurante
- `GET /pedidos-acaraje` - Pedidos de acarajé
- `GET /pedidos-geral` - Todos os pedidos

### 👥 Gestão de Funcionários
- `GET /funcionarios` - Lista funcionários
- `POST /funcionarios` - Cadastra funcionário
- `PUT /funcionarios/:id` - Atualiza funcionário
- `DELETE /funcionarios/:id` - Remove funcionário

### 🏢 Gestão de Restaurantes
- `GET /restaurante` - Dados do restaurante
- `POST /restaurante` - Cadastra restaurante
- `PUT /restaurante/:id` - Atualiza restaurante

### 🪑 Gestão de Mesas
- `GET /mesa` - Lista mesas
- `POST /mesa` - Cadastra mesa
- `PUT /mesa/:id` - Atualiza mesa
- `DELETE /mesa/:id` - Remove mesa

### 📊 Relatórios
- `GET /relatorios/vendas` - Relatório de vendas
- `GET /relatorios/produtos` - Relatório de produtos
- `GET /relatorios/funcionarios` - Relatório de funcionários

### 📱 Integração WhatsApp (Zapi)
- `POST /zapi/send-message` - Enviar mensagem
- `GET /zapi/status` - Status da integração

## Funcionalidades Avançadas

### 🔄 WebSocket (Socket.IO)
- **Pedidos em Tempo Real**: Atualizações instantâneas de pedidos
- **Notificações**: Alertas em tempo real para novos pedidos
- **Status Updates**: Mudanças de status propagadas automaticamente

### 🔐 Sistema de Permissões
- **Role-Based Access Control (RBAC)**
- **Níveis de Acesso**: Admin, Gerente, Funcionário, Cliente
- **Multi-tenant**: Suporte para múltiplos restaurantes

### 📱 Integrações Externas
- **WhatsApp Business**: Envio automático de confirmações
- **Upload de Imagens**: Suporte para fotos de produtos
- **QR Codes**: Geração para pedidos e mesas

## Fluxo de Uso da Aplicação

### 👤 Para Administradores
1. **Login** no sistema com credenciais administrativas
2. **Dashboard**: Visualização geral de vendas e pedidos
3. **Gestão de Produtos**: Cadastro e edição do cardápio
4. **Gestão de Funcionários**: Controle de equipe e permissões
5. **Relatórios**: Análise de performance e vendas
6. **Configurações**: Setup do restaurante e integrações

### 🍽️ Para Funcionários
1. **Login** com credenciais de funcionário
2. **Recebimento de Pedidos**: Interface para novos pedidos
3. **Gestão de Status**: Atualização do andamento dos pedidos
4. **Comunicação**: Notificações automáticas via WhatsApp

### 🛒 Para Clientes
1. **Acesso ao Cardápio**: Visualização de produtos disponíveis
2. **Carrinho de Compras**: Seleção e customização de itens
3. **Finalização**: Confirmação e envio do pedido
4. **Acompanhamento**: Status em tempo real do pedido

## Configurações Importantes

### Supabase Setup
```sql
-- Tabelas principais criadas automaticamente
-- Configurar Row Level Security (RLS)
-- Configurar triggers para notificações em tempo real
```

### Variáveis de Ambiente

#### Backend (.env)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# WhatsApp (Zapi)
ZAPI_TOKEN=your-zapi-token
ZAPI_INSTANCE_ID=your-instance-id

# Server
PORT=3001
NODE_ENV=production
```

#### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy e Produção

### 🚀 Deploy Recomendado

#### Frontend (Vercel)
```bash
# Deploy automático conectando repositório GitHub
# Configurar variáveis de ambiente na dashboard Vercel
# Build command: npm run build
# Output directory: .next
```

#### Backend (Railway/Render)
```bash
# Deploy via Docker ou Node.js
# Configurar variáveis de ambiente
# Configurar health check endpoint
```

#### Banco de Dados
- **Supabase**: Já em produção (recomendado)
- **PostgreSQL**: Hospedagem própria ou serviços como AWS RDS

### 📦 Build para Produção

#### Construir containers Docker:
```bash
# Build de todos os serviços
docker-compose build

# Build específico
docker build -t foodflow-backend ./backend
docker build -t foodflow-frontend ./frontend
```

#### Build do Frontend:
```bash
cd frontend
npm run build
npm start
```

## Contribuição

### 🤝 Como Contribuir

1. **Fork** o repositório
2. **Clone** sua fork: `git clone <sua-fork-url>`
3. **Branch** para feature: `git checkout -b feature/nova-funcionalidade`
4. **Commit** mudanças: `git commit -m "Adiciona nova funcionalidade"`
5. **Push** para branch: `git push origin feature/nova-funcionalidade`
6. **Pull Request** para branch main

### 📋 Padrões de Código
- **ESLint**: Configurado para Next.js
- **Commits**: Mensagens em português, descritivas
- **Components**: PascalCase para componentes React
- **Files**: camelCase para arquivos JavaScript

## Roadmap

### 🔮 Próximas Funcionalidades

- [ ] **Pagamentos Online**: Integração Stripe/PayPal
- [ ] **Delivery Tracking**: Rastreamento em tempo real
- [ ] **Analytics Avançados**: Dashboard com métricas detalhadas
- [ ] **Multi-idioma**: Internacionalização (i18n)
- [ ] **API Externa**: Integração com delivery partners
- [ ] **Impressão Automática**: Integração com impressoras térmicas
- [ ] **Programa de Fidelidade**: Sistema de pontos e recompensas

### 🛠️ Melhorias Técnicas

- [ ] **Tests**: Cobertura de testes automatizados
- [ ] **CI/CD**: Pipeline automático de deploy
- [ ] **Monitoring**: Logs e métricas de performance
- [ ] **Cache**: Redis para otimização
- [ ] **CDN**: Otimização de assets estáticos

## Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Desenvolvedor:** Henrique Salles  
**Email:** salleshenrique13@gmail.com  
**LinkedIn:** [Henrique Salles](https://linkedin.com/in/henrique-salles)

---

**FoodFlow** - Transformando a gestão de pedidos em restaurantes com tecnologia moderna e interface intuitiva. 🍽️✨
