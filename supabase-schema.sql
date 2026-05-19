create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id int primary key default 1,
  site_name text default 'Ricardo Almeida',
  site_subtitle text default 'Corretor de imóveis · CRECI 123456-F',
  logo_text text default 'RA',
  whatsapp text default '5592999999999',
  hero_title text default 'Imóveis selecionados para uma vida extraordinária',
  hero_subtitle text default 'Soluções imobiliárias personalizadas para quem busca exclusividade, segurança e os melhores investimentos.',
  updated_at timestamptz default now(),
  constraint one_settings_row check (id = 1)
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  purpose text not null default 'venda' check (purpose in ('venda','aluguel')),
  type text not null default 'Casa',
  status text not null default 'disponivel' check (status in ('disponivel','vendido','alugado')),
  price numeric default 0,
  city text,
  neighborhood text,
  address text,
  area numeric default 0,
  bedrooms int default 0,
  bathrooms int default 0,
  garage int default 0,
  image_url text,
  gallery_urls text[] default '{}',
  external_url text,
  description text,
  features text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  name text,
  phone text,
  email text,
  message text,
  created_at timestamptz default now()
);

alter table public.site_settings enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select using (true);
drop policy if exists "Authenticated can manage settings" on public.site_settings;
create policy "Authenticated can manage settings" on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties" on public.properties for select using (true);
drop policy if exists "Authenticated can manage properties" on public.properties;
create policy "Authenticated can manage properties" on public.properties for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Anyone can create leads" on public.leads;
create policy "Anyone can create leads" on public.leads for insert with check (true);
drop policy if exists "Authenticated can read leads" on public.leads;
create policy "Authenticated can read leads" on public.leads for select using (auth.role() = 'authenticated');

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.properties (title,purpose,type,status,price,city,neighborhood,area,bedrooms,bathrooms,garage,image_url,description,features)
values
('Casa contemporânea em condomínio','venda','Casa','disponivel',1250000,'Manaus','Ponta Negra',280,4,5,3,'assets/img/property-luxury-1.svg','Residência premium com área gourmet e acabamento sofisticado.',array['Condomínio fechado','Área gourmet','Piscina']),
('Apartamento alto padrão com vista','aluguel','Apartamento','disponivel',8500,'Manaus','Adrianópolis',160,3,4,2,'assets/img/property-luxury-2.svg','Apartamento com varanda ampla e lazer completo.',array['Varanda','Mobiliado','Lazer completo'])
on conflict do nothing;
