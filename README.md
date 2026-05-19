# Site Premium para Corretor de Imóveis

Projeto estático ajustado para **Cloudflare Pages**.

## Publicação no Cloudflare Pages

1. Crie ou acesse seu repositório no GitHub.
2. Envie todos os arquivos desta pasta para o repositório.
3. No Cloudflare, acesse **Workers & Pages > Create > Pages**.
4. Escolha **Connect to Git** e selecione o repositório.
5. Configure assim:
   - **Framework preset:** None / Nenhum
   - **Build command:** deixe vazio
   - **Build output directory:** `/` ou deixe como raiz do projeto
6. Clique em **Save and Deploy**.

## Compatibilidade Cloudflare

- Arquivos e atributos específicos de hospedagem anterior foram removidos.
- O formulário funciona pelo JavaScript do projeto, sem dependência de recurso exclusivo de plataforma.
- O contato continua funcionando pelo JavaScript do projeto, com envio para WhatsApp e tentativa de gravação no Supabase.
- Os arquivos `_headers` e `_redirects` foram mantidos porque são compatíveis com Cloudflare Pages.

## Onde editar

- Texto principal: `index.html`
- Cores e visual: `assets/css/style.css`
- Animações simples: `assets/js/main.js`
- Integração Supabase: `assets/js/supabase-config.js`
- WhatsApp padrão: edite o número no painel/Supabase ou no código, se necessário.
