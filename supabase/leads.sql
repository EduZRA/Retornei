-- Tabela da lista de espera do Retornei.
-- Cole no Supabase: SQL Editor > New query > Run.

create table if not exists public.leads (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  name           text not null,
  whatsapp       text not null,
  business       text,
  size           text,                 -- não é mais pedido no formulário
  current_method text not null,
  niche          text not null,
  tracking       jsonb not null default '{}'::jsonb,
  user_agent     text
);

-- Segurança: ninguém de fora lê ou escreve direto na tabela.
-- Só as funções /api/lead e /api/admin acessam, usando a chave secreta (que ignora estas regras).
alter table public.leads enable row level security;

-- Consulta útil para acompanhar o teste por nicho e por anúncio:
-- select niche, tracking->>'utm_content' as criativo, count(*)
-- from public.leads group by 1, 2 order by 3 desc;
