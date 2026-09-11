
create type public.forma_pagamento as enum ('pix','debito','credito','dinheiro','boleto','transferencia');
create type public.status_lancamento as enum ('pago','pendente','atrasado');
create type public.origem_lancamento as enum ('fixa','variavel','cartao');
create type public.tipo_conta as enum ('conta_bancaria','carteira','pix','debito','credito','boleto','transferencia');
create type public.status_projeto as enum ('planejando','em_andamento','concluido','cancelado');
create type public.status_fatura as enum ('aberta','fechada','paga');
create type public.frequencia as enum ('mensal','anual','parcelada','personalizada');

create or replace function public.update_updated_at_column() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql set search_path = public;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  tipo text not null default 'despesa',
  cor text not null default '#38bdf8',
  created_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  tipo public.tipo_conta not null default 'conta_bancaria',
  instituicao text,
  saldo_inicial numeric(14,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  emissor text,
  limite_total numeric(14,2) not null default 0,
  dia_fechamento int not null default 1,
  dia_vencimento int not null default 10,
  cor text not null default '#0b1220',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  descricao text,
  data_inicio date,
  data_fim date,
  orcamento numeric(14,2) not null default 0,
  status public.status_projeto not null default 'planejando',
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.fixed_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  category_id uuid references public.categories(id) on delete set null,
  valor_previsto numeric(14,2) not null default 0,
  dia_vencimento int not null default 10,
  frequencia public.frequencia not null default 'mensal',
  mes_inicio int not null default 1,
  ano_inicio int not null default 2026,
  mes_fim int,
  ano_fim int,
  parcelas_total int,
  forma_pagamento public.forma_pagamento not null default 'pix',
  account_id uuid references public.accounts(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  mes_ref int not null,
  ano_ref int not null,
  data_fechamento date,
  data_vencimento date,
  status public.status_fatura not null default 'aberta',
  data_pagamento date,
  account_id uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (card_id, mes_ref, ano_ref)
);

create table public.card_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  descricao text not null,
  data_compra date not null default current_date,
  valor_total numeric(14,2) not null default 0,
  parcelas int not null default 1,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  cancelada boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  descricao text not null,
  origem public.origem_lancamento not null default 'variavel',
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  valor numeric(14,2) not null default 0,
  data_gasto date,
  data_vencimento date,
  data_pagamento date,
  mes_ref int not null,
  ano_ref int not null,
  forma_pagamento public.forma_pagamento not null default 'pix',
  account_id uuid references public.accounts(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  fixed_bill_id uuid references public.fixed_bills(id) on delete cascade,
  card_purchase_id uuid references public.card_purchases(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  parcela_num int,
  parcela_total int,
  status public.status_lancamento not null default 'pendente',
  observacoes text,
  comprovante_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index entries_fixed_bill_month on public.entries (fixed_bill_id, mes_ref, ano_ref) where fixed_bill_id is not null;
create index entries_period on public.entries (user_id, ano_ref, mes_ref);

create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  descricao text not null,
  valor numeric(14,2) not null default 0,
  data_recebimento date,
  mes_ref int not null,
  ano_ref int not null,
  categoria text,
  account_id uuid references public.accounts(id) on delete set null,
  recebido boolean not null default true,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.categories, public.subcategories, public.accounts, public.cards, public.projects, public.fixed_bills, public.invoices, public.card_purchases, public.entries, public.incomes to authenticated;
grant all on public.categories, public.subcategories, public.accounts, public.cards, public.projects, public.fixed_bills, public.invoices, public.card_purchases, public.entries, public.incomes to service_role;

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.accounts enable row level security;
alter table public.cards enable row level security;
alter table public.projects enable row level security;
alter table public.fixed_bills enable row level security;
alter table public.invoices enable row level security;
alter table public.card_purchases enable row level security;
alter table public.entries enable row level security;
alter table public.incomes enable row level security;

create policy "own categories" on public.categories for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subcategories" on public.subcategories for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own accounts" on public.accounts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cards" on public.cards for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own projects" on public.projects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own fixed_bills" on public.fixed_bills for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own invoices" on public.invoices for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own card_purchases" on public.card_purchases for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own entries" on public.entries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own incomes" on public.incomes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger fixed_bills_updated before update on public.fixed_bills for each row execute function public.update_updated_at_column();
create trigger entries_updated before update on public.entries for each row execute function public.update_updated_at_column();

create or replace function public.seed_user_defaults()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cat record;
  cat_moradia uuid; cat_alim uuid; cat_saude uuid; cat_pets uuid; cat_transp uuid; cat_pessoal uuid; cat_impostos uuid;
  acc_pix uuid; card_mc uuid;
begin
  if uid is null then return; end if;
  if exists (select 1 from public.categories where user_id = uid) then return; end if;

  insert into public.categories (user_id, nome, tipo, cor) values
    (uid,'Moradia','despesa','#38bdf8'),
    (uid,'Alimentação','despesa','#a78bfa'),
    (uid,'Saúde','despesa','#34d399'),
    (uid,'Pets','despesa','#fbbf24'),
    (uid,'Transporte','despesa','#fb7185'),
    (uid,'Pessoal','despesa','#f472b6'),
    (uid,'Lazer','despesa','#60a5fa'),
    (uid,'Viagens','despesa','#22d3ee'),
    (uid,'Educação','despesa','#818cf8'),
    (uid,'Impostos','despesa','#f59e0b'),
    (uid,'Outros','despesa','#94a3b8'),
    (uid,'Salário','receita','#34d399'),
    (uid,'Extra','receita','#38bdf8');

  select id into cat_moradia from public.categories where user_id = uid and nome = 'Moradia';
  select id into cat_alim from public.categories where user_id = uid and nome = 'Alimentação';
  select id into cat_saude from public.categories where user_id = uid and nome = 'Saúde';
  select id into cat_pets from public.categories where user_id = uid and nome = 'Pets';
  select id into cat_transp from public.categories where user_id = uid and nome = 'Transporte';
  select id into cat_pessoal from public.categories where user_id = uid and nome = 'Pessoal';
  select id into cat_impostos from public.categories where user_id = uid and nome = 'Impostos';

  insert into public.subcategories (user_id, category_id, nome) values
    (uid,cat_moradia,'Compras de casa'),
    (uid,cat_alim,'Verduras'),
    (uid,cat_alim,'Frutas'),
    (uid,cat_alim,'Carne'),
    (uid,cat_alim,'Supermercado'),
    (uid,cat_saude,'Médico do Pietro'),
    (uid,cat_saude,'Exames'),
    (uid,cat_saude,'Farmácia'),
    (uid,cat_pessoal,'Unha'),
    (uid,cat_pessoal,'Cabelo'),
    (uid,cat_pessoal,'Manutenção de gel'),
    (uid,cat_pets,'Ração'),
    (uid,cat_pets,'Veterinário'),
    (uid,cat_transp,'Combustível'),
    (uid,cat_transp,'Aplicativos'),
    (uid,cat_transp,'Manutenção');

  insert into public.accounts (user_id, nome, tipo, instituicao) values
    (uid,'Conta corrente','conta_bancaria','Banco'),
    (uid,'Carteira','carteira',null);
  select id into acc_pix from public.accounts where user_id = uid and nome = 'Conta corrente';

  insert into public.cards (user_id, nome, emissor, limite_total, dia_fechamento, dia_vencimento, cor)
    values (uid,'Mastercard','Mastercard',5000,28,10,'#0b1220')
    returning id into card_mc;

  insert into public.fixed_bills (user_id, nome, category_id, valor_previsto, dia_vencimento, frequencia, mes_inicio, ano_inicio, forma_pagamento, account_id) values
    (uid,'Água',cat_moradia,0,10,'mensal',9,2026,'pix',acc_pix),
    (uid,'Luz',cat_moradia,0,10,'mensal',9,2026,'pix',acc_pix),
    (uid,'IPTU',cat_impostos,0,10,'anual',1,2026,'boleto',acc_pix),
    (uid,'DAS-MEI',cat_impostos,0,20,'mensal',9,2026,'boleto',acc_pix),
    (uid,'Claro',cat_moradia,0,15,'mensal',9,2026,'debito',acc_pix),
    (uid,'Vero',cat_moradia,0,15,'mensal',9,2026,'debito',acc_pix);
end;
$$;

grant execute on function public.seed_user_defaults() to authenticated;
