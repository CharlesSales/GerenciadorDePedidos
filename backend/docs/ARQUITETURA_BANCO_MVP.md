# Arquitetura do banco — MVP FoodFlow

O banco do MVP deve atender aos modulos ativos do backend: autenticacao de restaurante e funcionario, cargos, categorias, produtos, pedidos e couvert. Mesas, QR code, clientes cadastrados, enderecos reutilizaveis, retirada e recuperacao de senha ficam fora deste recorte.

O schema alvo esta em `docs/SCHEMA_MVP.sql`. Ele e um desenho para migracao; nao deve ser executado diretamente em uma base que ja possui dados.

## Relacionamentos

```text
restaurante 1 --- N funcionario
restaurante 1 --- N produtos
restaurante 1 --- N pedidos
cargo       1 --- N funcionario
categoria   1 --- N produtos
funcionario 1 --- N pedidos
pedidos     1 --- N pedido_produtos
produtos    1 --- N pedido_produtos
```

Todos os dados operacionais possuem ou alcancam um restaurante. Esse e o limite de isolamento que o backend ja usa por meio de `req.user.restauranteId`.

## Decisoes do MVP

- `pedidos` substitui a estrutura antiga `pedidos_geral`.
- `pedido_produtos` guarda os itens de cada pedido; nao use uma coluna de texto ou JSON para os itens.
- `status` e texto restrito por `CHECK`. A API ja trabalha com `pendente`, `preparando`, `pronto`, `entregue` e `cancelado`, portanto a tabela auxiliar `status` nao e necessaria.
- `cliente` e `casa` sao campos de snapshot no proprio pedido. Uma tabela de clientes/endereco so e necessaria quando o produto tiver cadastro, historico e multiplos enderecos por cliente.
- `pedido_produtos` salva `nome_produto` e `preco_unitario` no momento da compra, preservando o historico quando o cardapio mudar.
- `estoque` representa quantidade e nao disponibilidade booleana. Se a aplicacao nao controlar quantidade, o campo deve ser trocado por `disponivel boolean` no banco, validator e service.
- Categorias e cargos sao catalogos globais para manter o MVP pequeno.

## Ajustes obrigatorios no backend

O modulo de pedidos atual mistura dois modelos de banco: o repository tenta ler relacoes, enquanto o service insere um array `itens` na tabela `pedidos`. No schema normalizado, a criacao deve ser uma transacao:

1. Buscar os produtos do restaurante.
2. Calcular `preco_unitario`, `nome_produto` e `total` no servidor.
3. Inserir um registro em `pedidos`.
4. Inserir os registros correspondentes em `pedido_produtos`.

Nao confie no campo `total` ou no preco recebido do frontend.

Tambem ajuste `repositories/pedidoRepository.js` para refletir os campos reais do MVP:

- remover `mesa` de `camposLista`, `camposDetalhe` e relatorio;
- trocar `observacoes` por `obs`, ou renomear o campo no schema e fazer a mesma mudanca no service;
- para o join, usar `funcionario:funcionario(nome)` e `pedido_produtos(...)`;
- tratar `cliente` como texto, removendo `cliente:cliente(nome, telefone, cpf)`;
- criar pedido e itens em uma RPC/função SQL ou em um fluxo transacional apropriado.

A rota `GET /produtos/mesa/:id_restaurante/:id_mesa` tambem deve sair do MVP ou ser substituida por `GET /produtos/restaurante/:restauranteId`, pois nao existe entidade mesa neste modelo.

## Restricoes e indices

As restricoes evitam dados invalidos no proprio banco:

- usuario e e-mail de restaurante unicos;
- usuario de funcionario unico;
- produto unico por `(restaurante, nome)`;
- preco e total nunca negativos;
- quantidade de item sempre maior que zero;
- status limitado aos valores aceitos pela API.

Os indices de restaurante e de data/status de pedido atendem as listagens e relatorios atuais.

## Migracao segura

1. Fazer backup do banco atual.
2. Confirmar quais dados antigos de pedidos precisam ser preservados.
3. Criar as novas tabelas ou migrar os nomes/colunas com uma migration versionada.
4. Migrar produtos, funcionarios e restaurantes mantendo os IDs quando necessario.
5. Converter cada pedido antigo em um registro de `pedidos` e seus itens em `pedido_produtos`.
6. Atualizar o repository e o service de pedidos.
7. Testar dois restaurantes diferentes para garantir isolamento de dados.
8. Apenas depois remover tabelas legadas.
