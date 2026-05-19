-- Projeto Oclesio Araújo Jr Imóveis - Supabase completo
-- Rode este arquivo uma única vez no SQL Editor do Supabase.
create extension if not exists "pgcrypto";

create table if not exists public.site_config (
  id int primary key default 1,
  site_title text default 'Oclesio Araújo Jr Imóveis',
  whatsapp text default '5592982452810',
  creci text default 'CRECI-AM 7423',
  hero_title text default 'Especializado em imóveis residenciais e comerciais',
  hero_subtitle text default 'Excelência, confiança e atendimento personalizado para encontrar o imóvel ideal.',
  primary_color text default '#2f5877',
  logo_url text,
  updated_at timestamptz default now()
);
insert into public.site_config (id, whatsapp, creci) values (1, '5592982452810', 'CRECI-AM 7423') on conflict (id) do nothing;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null default 'Casa',
  finalidade text not null default 'venda' check (finalidade in ('venda','aluguel')),
  status text not null default 'disponivel' check (status in ('disponivel','vendido','alugado')),
  cidade text default 'Manaus',
  bairro text,
  endereco text,
  valor numeric default 0,
  area numeric default 0,
  quartos int default 0,
  banheiros int default 0,
  vagas int default 0,
  imagem text,
  descricao text,
  destaque boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  telefone text not null,
  email text,
  tipo text,
  finalidade text,
  mensagem text,
  created_at timestamptz default now()
);

-- Bucket público para fotos dos imóveis
insert into storage.buckets (id, name, public)
values ('imoveis', 'imoveis', true)
on conflict (id) do update set public = true;

alter table public.site_config enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Public read site config" on public.site_config;
create policy "Public read site config" on public.site_config for select using (true);
drop policy if exists "Admin manage site config" on public.site_config;
create policy "Admin manage site config" on public.site_config for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public read properties" on public.properties;
create policy "Public read properties" on public.properties for select using (true);
drop policy if exists "Admin manage properties" on public.properties;
create policy "Admin manage properties" on public.properties for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public read property images" on public.property_images;
create policy "Public read property images" on public.property_images for select using (true);
drop policy if exists "Admin manage property images" on public.property_images;
create policy "Admin manage property images" on public.property_images for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public insert leads" on public.leads;
create policy "Public insert leads" on public.leads for insert with check (true);
drop policy if exists "Admin read leads" on public.leads;
create policy "Admin read leads" on public.leads for select using (auth.role()='authenticated');

drop policy if exists "Public read imoveis storage" on storage.objects;
create policy "Public read imoveis storage" on storage.objects for select using (bucket_id = 'imoveis');
drop policy if exists "Admin upload imoveis storage" on storage.objects;
create policy "Admin upload imoveis storage" on storage.objects for insert with check (auth.role()='authenticated' and bucket_id = 'imoveis');
drop policy if exists "Admin update imoveis storage" on storage.objects;
create policy "Admin update imoveis storage" on storage.objects for update using (auth.role()='authenticated' and bucket_id = 'imoveis');
drop policy if exists "Admin delete imoveis storage" on storage.objects;
create policy "Admin delete imoveis storage" on storage.objects for delete using (auth.role()='authenticated' and bucket_id = 'imoveis');

-- Observação: este arquivo NÃO cadastra imóveis de exemplo.
-- Assim, os bairros começam com 0 imóveis e os números sobem conforme o corretor cadastra imóveis no painel.
