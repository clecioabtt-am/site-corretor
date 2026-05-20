-- Correção completa e segura do banco para Arquipélago Imobiliária
create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.properties add column if not exists titulo text;
alter table public.properties add column if not exists title text default '';
alter table public.properties add column if not exists tipo text;
alter table public.properties add column if not exists finalidade text;
alter table public.properties add column if not exists status text default 'disponivel';
alter table public.properties add column if not exists cidade text default 'Manaus';
alter table public.properties add column if not exists bairro text;
alter table public.properties add column if not exists endereco text;
alter table public.properties add column if not exists valor numeric default 0;
alter table public.properties add column if not exists price numeric default 0;
alter table public.properties add column if not exists area numeric default 0;
alter table public.properties add column if not exists area_m2 numeric default 0;
alter table public.properties add column if not exists quartos integer default 0;
alter table public.properties add column if not exists banheiros integer default 0;
alter table public.properties add column if not exists vagas integer default 0;
alter table public.properties add column if not exists imagem text;
alter table public.properties add column if not exists image_url text;
alter table public.properties add column if not exists main_image_url text;
alter table public.properties add column if not exists descricao text;
alter table public.properties add column if not exists description text;
alter table public.properties add column if not exists destaque boolean default false;

alter table public.properties alter column title drop not null;
alter table public.properties alter column title set default '';
alter table public.properties alter column titulo set default '';

update public.properties set titulo = coalesce(titulo, title, 'Sem título');
update public.properties set title = coalesce(title, titulo, 'Sem título');
update public.properties set valor = coalesce(valor, price, 0);
update public.properties set price = coalesce(price, valor, 0);
update public.properties set area = coalesce(area, area_m2, 0);
update public.properties set area_m2 = coalesce(area_m2, area, 0);
update public.properties set imagem = coalesce(imagem, image_url, main_image_url, '');
update public.properties set image_url = coalesce(image_url, imagem, main_image_url, '');
update public.properties set main_image_url = coalesce(main_image_url, imagem, image_url, '');
update public.properties set descricao = coalesce(descricao, description, '');
update public.properties set description = coalesce(description, descricao, '');

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.site_config (
  id integer primary key default 1,
  site_title text,
  whatsapp text,
  creci text,
  hero_title text,
  hero_subtitle text,
  primary_color text,
  about_image_url text,
  updated_at timestamptz default now()
);

alter table public.site_config add column if not exists site_title text;
alter table public.site_config add column if not exists whatsapp text;
alter table public.site_config add column if not exists creci text;
alter table public.site_config add column if not exists hero_title text;
alter table public.site_config add column if not exists hero_subtitle text;
alter table public.site_config add column if not exists primary_color text;
alter table public.site_config add column if not exists about_image_url text default 'assets/img/oclesio-araujo-jr.png';
alter table public.site_config add column if not exists updated_at timestamptz default now();

insert into public.site_config (id, site_title, whatsapp, creci)
values (1, 'Arquipélago Imobiliária', '5592982452810', 'CRECI-AM 7423')
on conflict (id) do update set
  site_title = excluded.site_title,
  whatsapp = excluded.whatsapp,
  creci = excluded.creci,
  updated_at = now();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  tipo text,
  mensagem text,
  created_at timestamptz default now()
);

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.site_config enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Public read properties" on public.properties;
create policy "Public read properties" on public.properties for select using (true);
drop policy if exists "Authenticated manage properties" on public.properties;
create policy "Authenticated manage properties" on public.properties for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public read property images" on public.property_images;
create policy "Public read property images" on public.property_images for select using (true);
drop policy if exists "Authenticated manage property images" on public.property_images;
create policy "Authenticated manage property images" on public.property_images for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public read site config" on public.site_config;
create policy "Public read site config" on public.site_config for select using (true);
drop policy if exists "Authenticated manage site config" on public.site_config;
create policy "Authenticated manage site config" on public.site_config for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

drop policy if exists "Public insert leads" on public.leads;
create policy "Public insert leads" on public.leads for insert with check (true);
drop policy if exists "Authenticated read leads" on public.leads;
create policy "Authenticated read leads" on public.leads for select using (auth.role()='authenticated');

insert into storage.buckets (id, name, public)
values ('imoveis', 'imoveis', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read imoveis storage" on storage.objects;
create policy "Public read imoveis storage" on storage.objects for select using (bucket_id = 'imoveis');
drop policy if exists "Admin upload imoveis storage" on storage.objects;
create policy "Admin upload imoveis storage" on storage.objects for insert with check (auth.role()='authenticated' and bucket_id = 'imoveis');
drop policy if exists "Admin update imoveis storage" on storage.objects;
create policy "Admin update imoveis storage" on storage.objects for update using (auth.role()='authenticated' and bucket_id = 'imoveis');
drop policy if exists "Admin delete imoveis storage" on storage.objects;
create policy "Admin delete imoveis storage" on storage.objects for delete using (auth.role()='authenticated' and bucket_id = 'imoveis');
