-- Dados exclusivamente locais para desenvolvimento e testes.
-- Senha de todos os usuarios abaixo: 123456

insert into public.restaurante (
  usuario, senha, nome_restaurante, estado, cidade, rua,
  numero_endereco, email, telefone_whatsapp, taxa_couvert
) values
  (
    'pizzaria_teste',
    '$2b$12$Ri.E2Fdnp7GWt8ICn0j00eh.TSL8ZKU/pRz/rRq9umsCVttw15o/e',
    'Pizzaria Sabor da Casa', 'SP', 'Sao Paulo', 'Rua das Flores',
    '100', 'contato@pizzariateste.local', '11999990001', true
  ),
  (
    'burger_teste',
    '$2b$12$Ri.E2Fdnp7GWt8ICn0j00eh.TSL8ZKU/pRz/rRq9umsCVttw15o/e',
    'Burger Lab', 'RJ', 'Rio de Janeiro', 'Avenida Central',
    '250', 'contato@burgerteste.local', '21999990002', false
  );

insert into public.cargo (nome_cargo) values
  ('Administrador'),
  ('Caixa'),
  ('Cozinheiro');

insert into public.categoria (categoria_nome) values
  ('Pizzas'),
  ('Bebidas'),
  ('Hamburgueres'),
  ('Acompanhamentos');

insert into public.funcionario (restaurante, cargo, nome, usuario, senha) values
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id from public.cargo where nome_cargo = 'Administrador'),
    'Joao da Silva', 'joao_pizzaria',
    '$2b$12$Ri.E2Fdnp7GWt8ICn0j00eh.TSL8ZKU/pRz/rRq9umsCVttw15o/e'
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id from public.cargo where nome_cargo = 'Cozinheiro'),
    'Maria Souza', 'maria_pizzaria',
    '$2b$12$Ri.E2Fdnp7GWt8ICn0j00eh.TSL8ZKU/pRz/rRq9umsCVttw15o/e'
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'burger_teste'),
    (select id from public.cargo where nome_cargo = 'Administrador'),
    'Carlos Lima', 'carlos_burger',
    '$2b$12$Ri.E2Fdnp7GWt8ICn0j00eh.TSL8ZKU/pRz/rRq9umsCVttw15o/e'
  );

insert into public.produtos (
  restaurante, categoria, nome, descricao, preco, estoque, cozinha, imagem
) values
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id from public.categoria where categoria_nome = 'Pizzas'),
    'Pizza Margherita', 'Molho de tomate, muçarela e manjericao', 49.90, 20, 'pizzaria', null
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id from public.categoria where categoria_nome = 'Pizzas'),
    'Pizza Calabresa', 'Muçarela, calabresa e cebola', 54.90, 15, 'pizzaria', null
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id from public.categoria where categoria_nome = 'Bebidas'),
    'Refrigerante Lata', 'Lata de 350 ml', 6.50, 50, 'bar', null
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'burger_teste'),
    (select id from public.categoria where categoria_nome = 'Hamburgueres'),
    'Burger Classico', 'Hamburguer, queijo, alface e tomate', 32.00, 30, 'cozinha', null
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'burger_teste'),
    (select id from public.categoria where categoria_nome = 'Acompanhamentos'),
    'Batata Frita', 'Porcao individual de batata frita', 12.00, 40, 'cozinha', null
  );

insert into public.pedidos (
  restaurante, funcionario_id, cliente, casa, obs, status, total, data_pedido
) values
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id_funcionario from public.funcionario where usuario = 'joao_pizzaria'),
    'Ana Oliveira', 'Rua A, 45', 'Sem cebola', 'entregue', 56.40, now() - interval '1 day'
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste'),
    (select id_funcionario from public.funcionario where usuario = 'joao_pizzaria'),
    'Pedro Santos', 'Rua B, 88', '', 'preparando', 54.90, now()
  ),
  (
    (select id_restaurante from public.restaurante where usuario = 'burger_teste'),
    (select id_funcionario from public.funcionario where usuario = 'carlos_burger'),
    'Luiza Costa', 'Avenida Brasil, 12', 'Ponto da carne: ao ponto', 'pendente', 44.00, now()
  );

insert into public.pedido_produtos (
  pedido_id, produto_id, nome_produto, preco_unitario, quantidade, observacao
) values
  (
    (select id_pedido from public.pedidos where cliente = 'Ana Oliveira'),
    (select id_produto from public.produtos where nome = 'Pizza Margherita' and restaurante = (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste')),
    'Pizza Margherita', 49.90, 1, 'Sem cebola'
  ),
  (
    (select id_pedido from public.pedidos where cliente = 'Ana Oliveira'),
    (select id_produto from public.produtos where nome = 'Refrigerante Lata' and restaurante = (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste')),
    'Refrigerante Lata', 6.50, 1, ''
  ),
  (
    (select id_pedido from public.pedidos where cliente = 'Pedro Santos'),
    (select id_produto from public.produtos where nome = 'Pizza Calabresa' and restaurante = (select id_restaurante from public.restaurante where usuario = 'pizzaria_teste')),
    'Pizza Calabresa', 54.90, 1, ''
  ),
  (
    (select id_pedido from public.pedidos where cliente = 'Luiza Costa'),
    (select id_produto from public.produtos where nome = 'Burger Classico' and restaurante = (select id_restaurante from public.restaurante where usuario = 'burger_teste')),
    'Burger Classico', 32.00, 1, 'Ao ponto'
  ),
  (
    (select id_pedido from public.pedidos where cliente = 'Luiza Costa'),
    (select id_produto from public.produtos where nome = 'Batata Frita' and restaurante = (select id_restaurante from public.restaurante where usuario = 'burger_teste')),
    'Batata Frita', 12.00, 1, ''
  );
