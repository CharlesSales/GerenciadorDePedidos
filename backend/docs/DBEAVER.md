# Conexao local no DBeaver

O arquivo `docker-compose.yml` sobe um PostgreSQL local chamado `foodflow-db` e executa `SCHEMA_MVP.sql` na primeira criacao do banco.

## Subir o banco

Na raiz do backend, com o Docker Desktop aberto:

```powershell
docker compose up -d
docker compose ps
```

O status do container deve ficar como `healthy`.

## Criar a conexao

No DBeaver:

1. Clique em **New Database Connection**.
2. Escolha **PostgreSQL**.
3. Preencha os dados abaixo.
4. Clique em **Test Connection** e depois em **Finish**.

| Campo | Valor |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `foodflow` |
| Username | `foodflow` |
| Password | `foodflow_dev` |

Se o DBeaver solicitar o driver PostgreSQL, aceite o download do driver oficial.

## Validar o schema

Abra um SQL Editor na conexao `foodflow` e execute:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

As tabelas esperadas sao `restaurante`, `cargo`, `categoria`, `funcionario`, `produtos`, `pedidos` e `pedido_produtos`.

## Dados iniciais de teste

O Compose tambem executa `docs/SEED_MVP.sql` na primeira criacao. Ele cria dois restaurantes, cinco produtos, tres funcionarios e tres pedidos.

| Tipo | Usuario | Senha |
| --- | --- | --- |
| Restaurante | `pizzaria_teste` | `123456` |
| Restaurante | `burger_teste` | `123456` |
| Funcionario administrador | `joao_pizzaria` | `123456` |
| Funcionario | `maria_pizzaria` | `123456` |
| Funcionario administrador | `carlos_burger` | `123456` |

Essas credenciais sao exclusivamente para o banco local de desenvolvimento.

## Reiniciar do zero

Os scripts em `docker-entrypoint-initdb.d` so executam quando o volume esta vazio. Para recriar o banco local depois de alterar `SCHEMA_MVP.sql`:

```powershell
docker compose down -v
docker compose up -d
```

Este comando apaga somente o volume local `foodflow_postgres_data` e todos os dados de teste.
