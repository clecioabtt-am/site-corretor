-- Projeto Oclesio Araújo Jr Imóveis - Supabase completo
create extension if not exists "pgcrypto";

create table if not exists public.site_config (
  id int primary key default 1,
  site_title text default 'Oclesio Araújo Jr Imóveis',
  whatsapp text default '5592999999999',
  hero_title text default 'Especializado em imóveis residenciais e comerciais',
  hero_subtitle text default 'Excelência, confiança e atendimento personalizado para encontrar o imóvel ideal.',
  primary_color text default '#2f5877',
  logo_url text,
  updated_at timestamptz default now()
);
insert into public.site_config (id) values (1) on conflict (id) do nothing;

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

insert into public.properties (titulo,tipo,finalidade,status,cidade,bairro,valor,area,quartos,banheiros,vagas,imagem,descricao,destaque) values
('Casa à venda em Ponta Negra','Casa','venda','disponivel','Manaus','Ponta Negra',3200000,450,4,6,4,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','Casa ampla com piscina, área gourmet e acabamento premium.',true),
('Apartamento à venda em Aleixo','Apartamento','venda','disponivel','Manaus','Aleixo',3000000,384,4,5,3,'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80','Apartamento sofisticado com vista privilegiada e alto padrão.',true),
('Terreno à venda em Ponta Negra','Terreno','venda','disponivel','Manaus','Ponta Negra',230000,250,0,0,0,'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80','Terreno em localização estratégica para investimento.',true),
('Apartamento para locação em Nossa Senhora das Graças','Apartamento','aluguel','disponivel','Manaus','Nossa Senhora das Graças',3600,70,2,2,1,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80','Apartamento confortável e bem localizado.',false)
on conflict do nothing;
