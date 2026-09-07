-- Schema alvo do MVP FoodFlow.
-- Nao execute este arquivo diretamente sobre o banco atual: ele descreve a
-- estrutura final e deve ser aplicado por uma migracao com backup dos dados.
-- Este MVP nao possui mesas nem atendimento por QR code.

create table public.restaurante (
  id_restaurante bigint generated always as identity primary key,
  usuario text not null unique,
  senha text not null,
  nome_restaurante text not null,
  estado varchar(2) not null,
  cidade text not null,
  rua text not null,
  numero_endereco text not null,
  email text not null unique,
  telefone_whatsapp text,
  taxa_couvert boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Cargo descreve a funcao do funcionario. Ele nao concede permissao por si so;
-- no backend, o restaurante e sempre administrador e o middleware decide acesso.
create table public.cargo (
  id bigint generated always as identity primary key,
  nome_cargo text not null unique
);

-- Categorias globais mantem o MVP simples. Quando for necessario que cada
-- restaurante crie categorias proprias, esta tabela deve receber restaurante_id.
create table public.categoria (
  id bigint generated always as identity primary key,
  categoria_nome text not null unique
);

create table public.funcionario (
  id_funcionario bigint generated always as identity primary key,
  restaurante bigint not null references public.restaurante(id_restaurante),
  cargo bigint not null references public.cargo(id),
  nome text not null,
  usuario text not null unique,
  senha text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.produtos (
  id_produto bigint generated always as identity primary key,
  restaurante bigint not null references public.restaurante(id_restaurante),
  categoria bigint not null references public.categoria(id),
  nome text not null,
  descricao text not null,
  preco numeric(12, 2) not null check (preco >= 0),
  estoque integer not null default 0 check (estoque >= 0),
  cozinha text not null default '',
  imagem text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint produtos_nome_restaurante_unique unique (restaurante, nome)
);

-- Pedido armazena os dados fornecidos pelo backend atual. Cliente e endereco
-- (campo casa) sao snapshots do pedido; o MVP nao precisa de tabelas de cliente
-- ou endereco enquanto nao houver cadastro e historico de clientes.
create table public.pedidos (
  id_pedido bigint generated always as identity primary key,
  restaurante bigint not null references public.restaurante(id_restaurante),
  funcionario_id bigint not null references public.funcionario(id_funcionario),
  cliente text not null,
  casa text not null,
  obs text not null default '',
  status text not null default 'pendente'
    check (status in ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
  total numeric(12, 2) not null check (total >= 0),
  data_pedido timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- O preco e o nome sao copiados para preservar o historico: mudar o produto
-- depois nao pode alterar um pedido ja realizado.
create table public.pedido_produtos (
  id_pedido_produto bigint generated always as identity primary key,
  pedido_id bigint not null references public.pedidos(id_pedido) on delete cascade,
  produto_id bigint not null references public.produtos(id_produto),
  nome_produto text not null,
  preco_unitario numeric(12, 2) not null check (preco_unitario >= 0),
  quantidade integer not null check (quantidade > 0),
  observacao text not null default ''
);

create index idx_funcionario_restaurante on public.funcionario(restaurante);
create index idx_produtos_restaurante on public.produtos(restaurante);
create index idx_pedidos_restaurante_data on public.pedidos(restaurante, data_pedido desc);
create index idx_pedidos_restaurante_status on public.pedidos(restaurante, status);
create index idx_pedido_produtos_pedido on public.pedido_produtos(pedido_id);
