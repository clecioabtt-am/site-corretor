# Site Corretor — versão Cloudflare Pages

Projeto revisado para Cloudflare Pages.

## Configuração recomendada no Cloudflare Pages

- Framework preset: None
- Build command: deixar em branco
- Build output directory: `/` ou `.`
- Root directory: `/`

## Observações

- Arquivos do Netlify removidos.
- `_redirects` removido para evitar loop no Cloudflare Pages.
- O projeto é estático e pode subir sem variáveis de ambiente.
- A conexão com Supabase usa `assets/js/supabase-config.js`.

## Arquivos principais

- `index.html`: site público
- `admin.html`: painel do corretor
- `assets/js/supabase-config.js`: configuração pública do Supabase
- `assets/js/script.js`: integração do site com Supabase
- `assets/js/main.js`: menu e animações
