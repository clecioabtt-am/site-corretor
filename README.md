# Site Corretor Premium - Cloudflare Pages + Supabase

Projeto estático, sem Netlify, pronto para publicar no Cloudflare Pages via GitHub.

## Como configurar
1. Crie um projeto no Supabase.
2. Abra o arquivo `supabase-schema.sql` e execute tudo no SQL Editor do Supabase.
3. Em Authentication > Users, crie o usuário do corretor.
4. Em Project Settings > API, copie `Project URL` e `anon public key`.
5. Cole esses dados em `assets/js/config.js`.
6. Faça commit no GitHub. O Cloudflare Pages fará o deploy automático.

## Cloudflare Pages
- Build command: deixe vazio
- Output directory: `/` ou deixe padrão se os arquivos estiverem na raiz
- Não usa `_redirects`
- Não usa `netlify.toml`

## Busca de imóveis na internet
Sem API paga, o sistema abre uma pesquisa estruturada no Google com os filtros escolhidos. Para anúncios externos, o corretor pode cadastrar o link do anúncio no painel.


Correção de rota administrativa: a área do corretor funciona em /admin/ e também em /admin.html. Não use arquivo _redirects neste projeto.
