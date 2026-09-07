# RLS do Supabase

## Estado atual

O backend usa JWT proprio para autenticar usuarios, mas as consultas ao Supabase usam o cliente configurado com `SUPABASE_KEY`. O JWT proprio nao e automaticamente interpretado pelo PostgREST como `auth.uid()`.

Por isso, nao habilite politicas RLS genericas sem antes alinhar a identidade entre o backend e o Supabase. Caso contrario, as consultas podem ser bloqueadas ou as politicas podem nao proteger os dados como esperado.

## Estrategia recomendada

1. Criar usuarios no Supabase Auth ou definir uma estrategia de claims JWT compativel com o Supabase.
2. Associar o usuario autenticado ao restaurante.
3. Habilitar RLS nas tabelas:
   - `restaurante`
   - `funcionario`
   - `produtos`
   - `pedidos`
   - tabelas relacionadas a pedidos
4. Criar politicas de leitura, insercao, atualizacao e exclusao por restaurante.
5. Testar cada politica com usuarios de restaurantes diferentes.
6. Remover qualquer acesso amplo usado apenas durante a migracao.

## Exemplo conceitual

A politica deve permitir acesso quando o restaurante do registro for o mesmo restaurante associado ao usuario autenticado. A implementacao exata depende de onde essa associacao sera armazenada no Supabase Auth.

```sql
-- Exemplo conceitual. Ajustar antes de executar.
alter table public.produtos enable row level security;

create policy "usuario acessa produtos do proprio restaurante"
on public.produtos
for select
to authenticated
using (
  restaurante = public.restaurante_do_usuario(auth.uid())
);
```

Nao execute esse exemplo sem criar primeiro a funcao `restaurante_do_usuario` e confirmar o modelo de identidade.

## Protecao atual no backend

Enquanto a migracao para RLS nao for feita, o backend limita os dados pelo `restauranteId` presente no usuario autenticado em:

- funcionarios
- produtos
- pedidos
- atualizacao de couvert

Essa protecao deve continuar mesmo depois do RLS, funcionando como defesa em profundidade.

## Checklist antes de habilitar em producao

- [ ] Definir Supabase Auth ou claims compativeis.
- [ ] Confirmar tabelas e chaves estrangeiras reais.
- [ ] Criar policies por operacao.
- [ ] Testar leitura entre restaurantes.
- [ ] Testar insercao com restaurante adulterado.
- [ ] Testar atualizacao e exclusao entre restaurantes.
- [ ] Confirmar que o service role key nunca vai para o frontend.
- [ ] Rotacionar chaves expostas.
