-- Oclesio Araújo Jr Imóveis - Supabase Schema
-- Rode este arquivo uma única vez no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id int primary key default 1,
  agent_name text default 'Oclesio Araújo Jr',
  creci text default 'CRECI-AM 0000-F',
  phone text default '(92) 99999-9999',
  email text default 'contato@oclesioimoveis.com.br',
  hero_title text default 'Imóveis selecionados para uma vida <span>extraordinária</span>',
  hero_subtitle text default 'Assessoria imobiliária premium em Manaus para compra, venda, locação e captação de imóveis com estratégia, clareza e alto padrão de atendimento.',
  logo_url text,
  primary_color text default '#c99a43',
  updated_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  purpose text not null check (purpose in ('Venda','Aluguel')) default 'Venda',
  status text not null check (status in ('Disponível','Vendido','Alugado')) default 'Disponível',
  type text not null default 'Casa',
  price numeric default 0,
  condominium_fee numeric default 0,
  iptu numeric default 0,
  city text default 'Manaus',
  district text,
  address text,
  area numeric default 0,
  bedrooms int default 0,
  bathrooms int default 0,
  suites int default 0,
  parking int default 0,
  cover_url text,
  video_url text,
  map_url text,
  external_url text,
  description text,
  features text[] default '{}',
  featured boolean default false,
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
  property_id uuid references public.properties(id) on delete set null,
  name text,
  phone text,
  email text,
  message text,
  source text default 'site',
  created_at timestamptz default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.properties (title,purpose,status,type,price,city,district,area,bedrooms,bathrooms,suites,parking,description,featured)
values
('Casa Alto Padrão em Ponta Negra','Venda','Disponível','Casa',3200000,'Manaus','Ponta Negra',450,4,5,4,4,'Residência sofisticada em região nobre, ambientes amplos e acabamento premium.',true),
('Apartamento Premium no Adrianópolis','Aluguel','Disponível','Apartamento',5800,'Manaus','Adrianópolis',148,3,3,1,2,'Apartamento completo, localização estratégica e lazer de condomínio clube.',true),
('Terreno Comercial na Torquato Tapajós','Venda','Disponível','Terreno',890000,'Manaus','Flores',900,0,0,0,0,'Excelente área para investimento, com acesso rápido e vocação comercial.',true)
on conflict do nothing;

alter table public.site_settings enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Public read settings" on public.site_settings;
create policy "Public read settings" on public.site_settings for select using (true);
drop policy if exists "Admin manage settings" on public.site_settings;
create policy "Admin manage settings" on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read properties" on public.properties;
create policy "Public read properties" on public.properties for select using (true);
drop policy if exists "Admin manage properties" on public.properties;
create policy "Admin manage properties" on public.properties for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read images" on public.property_images;
create policy "Public read images" on public.property_images for select using (true);
drop policy if exists "Admin manage images" on public.property_images;
create policy "Admin manage images" on public.property_images for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public create leads" on public.leads;
create policy "Public create leads" on public.leads for insert with check (true);
drop policy if exists "Admin read leads" on public.leads;
create policy "Admin read leads" on public.leads for select using (auth.role() = 'authenticated');
