# Site Corretor - Cloudflare Pages (rota admin corrigida)

## IMPORTANTE
Antes de enviar para o GitHub, apague os arquivos antigos do repositório, principalmente:
- `_redirects`
- `netlify.toml`
- `wrangler.toml`
- qualquer pasta antiga `/admin` que não seja a deste pacote

## Rotas
- Site: `/`
- Login do corretor: `/admin/`
- Alternativa: `/corretor.html`

## Cloudflare Pages
- Framework preset: None
- Build command: deixar vazio
- Output directory: `/` ou deixar vazio

## Supabase
Configure `assets/js/config.js` com:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Não use `service_role` no frontend.
