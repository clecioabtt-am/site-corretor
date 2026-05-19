# Oclesio Araújo Jr Imóveis

Projeto estático premium compatível com Cloudflare Pages + GitHub Auto Deploy + Supabase.

## Como publicar
1. Suba todos os arquivos na raiz do repositório GitHub.
2. No Cloudflare Pages, conecte o repositório.
3. Build command: deixe vazio.
4. Output directory: `/` ou deixe vazio.
5. Deploy.

## Supabase
1. Crie um projeto Supabase.
2. SQL Editor > New Query.
3. Cole e rode `supabase/supabase-schema.sql`.
4. Authentication > Users > Add user para criar o usuário do corretor.
5. Em `assets/js/config.js`, cole:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## Rotas
- Site: `/`
- Anuncie seu imóvel: `/anuncie.html`
- Área do corretor: `/admin/`

## Importante
Não existe `_redirects`, `netlify.toml` ou dependência Netlify neste projeto.
