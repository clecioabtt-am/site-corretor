-- Execute este SQL no Supabase > SQL Editor antes de testar o painel.
alter table site_config add column if not exists footer_text text;
alter table site_config add column if not exists agent_url text;
alter table site_config add column if not exists mostrar_agent boolean default true;
update site_config set footer_text = null where footer_text = '© 2026 Ricardo Almeida · Corretor de Imóveis · CRECI 123456-F';
