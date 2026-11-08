# Retornei

Página de captura da lista de espera do Retornei, para a fase de validação com anúncios.

O Retornei mostra todo dia quais clientes de um negócio de serviço recorrente estão na hora de voltar e deixa a mensagem de WhatsApp pronta para enviar.

## O que tem aqui

| Arquivo | Para quê |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | A página. Um arquivo serve todos os nichos |
| `privacidade.html` | Política de privacidade da lista de espera |
| `api/lead.js` | Recebe o formulário e grava no Supabase |
| `supabase/leads.sql` | Cria a tabela de inscrições |
| `vercel.json` | Endereços por nicho |

## Endereços por nicho

- `/barbearia` (também é a página inicial `/`)
- `/estetica-automotiva`

Para criar um nicho novo: copie um bloco dentro de `NICHES` em `app.js`, troque os textos e os clientes de exemplo, e adicione o endereço em `vercel.json` e na lista `NICHES` de `api/lead.js`.

Nos anúncios, use parâmetros UTM para saber qual criativo trouxe cada inscrição, por exemplo:
`/barbearia?utm_source=meta&utm_campaign=validacao&utm_content=criativo-1`

## Colocar no ar (uma vez)

1. **Supabase:** crie uma conta grátis em supabase.com e um projeto novo. Abra **SQL Editor**, cole o conteúdo de `supabase/leads.sql` e clique em **Run**.
2. Ainda no Supabase, vá em **Project Settings > API** e copie a **Project URL** e a chave **service_role**.
3. **Vercel:** importe este repositório (Add New > Project). Não precisa mudar nenhuma configuração de build.
4. Em **Settings > Environment Variables** do projeto na Vercel, crie:
   - `SUPABASE_URL` = a Project URL
   - `SUPABASE_SERVICE_KEY` = a chave service_role
5. Faça um novo deploy (Deployments > Redeploy) para as variáveis valerem.
6. Teste: entre na página, preencha o formulário e confira a linha nova em **Table Editor > leads** no Supabase.

A chave service_role dá acesso total ao banco. Ela fica só na Vercel, nunca no código nem no front-end.

## Próximos passos

- Pixel do Meta e tag do Google Ads para medir conversões (o `app.js` já dispara o evento `Lead` quando eles existirem na página)
- Domínio próprio quando o nome estiver decidido
