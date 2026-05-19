# Oclesio Araújo Jr - Site Premium Imobiliário

Projeto estático 100% compatível com Cloudflare Pages + Supabase.

## Como publicar
1. Envie todos os arquivos para um repositório GitHub.
2. No Cloudflare Pages, conecte o repositório.
3. Build command: deixe vazio.
4. Build output directory: `/` ou deixe vazio.
5. Deploy.

## Supabase
1. Abra o arquivo `supabase/supabase-schema.sql`.
2. Cole no SQL Editor do Supabase e clique em Run.
3. Crie um usuário em Authentication > Users.
4. Copie `config.example.js` para `config.js`.
5. Preencha `url` e `anonKey`.

## Login administrativo
Acesse `/admin/`.

## Observação sobre busca na internet
Sem API externa, o projeto usa uma busca assistida que monta links de pesquisa avançada no Google/Bing com base nos filtros selecionados. Isso evita scraping irregular e mantém o projeto estável no Cloudflare.
