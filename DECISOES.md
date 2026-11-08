# Retornei: decisões do projeto

Resumo de tudo que foi decidido até 08/11/2026, para qualquer conversa nova retomar daqui.
Plano completo (fases, custos, cronograma): https://claude.ai/artifact/QXBJkjroNJ3KHYHyFa6SWg

## Como trabalhar com o Eduardo

- Ele não é programador. Explicar em linguagem simples, sem jargão, e dizer o porquê de cada passo.
- **Validar com ele antes de publicar** mudanças de texto, visual ou plano. Mostrar opções e uma recomendação.
- Captação de clientes só pela internet (anúncios Meta e Google). Nada que exija ligar ou visitar pessoas.
- Não usar o rosto nem o nome dele no site.

## O produto

App web (abre no navegador e pode ser "instalado" na tela do celular) que mostra todo dia quais clientes de um
negócio de serviço recorrente estão na hora de voltar, e deixa a mensagem de WhatsApp pronta para enviar com um toque.
Um painel mostra quanto dinheiro voltou por causa dos lembretes.

- **Público inicial:** barbearias e estética automotiva (lava-rápido, polimento, higienização).
- **Por que esse produto:** veio de pesquisa de dores. Corretores de imóveis e personal/nutricionista foram descartados
  (concorrência grátis ou mercado maduro). Lembrete de retorno ganhou por mostrar dinheiro recuperado e uso diário.
- **Concorrência a lembrar:** o AppBarber já tem "lembrete automático de retorno" dentro de um app completo de agenda;
  o Trinks começa em R$ 81/mês. Nosso diferencial: só isso, simples, para vários nichos, configurado sozinho em minutos.
- **WhatsApp:** o app abre o WhatsApp do próprio dono com a mensagem pronta (link wa.me). **Não** usar a API oficial
  no começo: a Meta cobra R$ 0,3217 por mensagem de marketing, o que come a margem. Envio automático pode virar plano extra
  com créditos à parte. Nada de APIs não oficiais (risco de banir o número do cliente).

## Preço e teste

- **Fundador:** R$ 19/mês, travado enquanto assinar, só para as **50 primeiras inscrições**.
- **Normal:** R$ 29/mês.
- **Teste:** 14 dias grátis **com cartão cadastrado** e cobrança automática no 15º dia.
  Obrigatório: mostrar data e valor da primeira cobrança no cadastro, avisar 2 dias antes pelo WhatsApp e no app
  (com o resultado do teste), cancelamento com um toque.
- **Pagamentos:** Asaas (assinatura recorrente no cartão). Pix Automático só depois de 6 meses de CNPJ.
- O preço em reais **não aparece** no site ainda; sai no lançamento.
- **Pré-venda** foi adiada: fazer para a lista de espera quando o app existir.

## Empresa

- Software por assinatura **não pode ser MEI**. Abrir **ME (SLU) no Simples Nacional**, CNAE 6203-1/00 ou 6202-3/00
  (o contador confirma), com Fator R para cair no Anexo III.
- Abrir só **depois** que a validação der certo e antes da primeira cobrança.

## Marca

- **Mascote:** bumerangue de madeira (âmbar) com rosto, faixas perto das pontas e trajetória tracejada verde que volta.
  Expressões: padrão, piscando (lembrete enviado), comemorando (cliente voltou). Nome sugerido para o personagem: Bumê.
- **Assinatura:** "Seu cliente de volta." (a frase "O que é bom, volta." foi descartada).
- **Cores:** tinta azul-petróleo `#123B4A`, verde "voltou" `#1E8C5E`, âmbar `#E3A33B` / `#F2B653`, fundo `#F2F6F5`.
- **Fonte:** Bricolage Grotesque em tudo (a Atkinson Hyperlegible saiu por causa do zero cortado).
- **No topo do site:** bumerangue solto, sem o quadrado. O quadrado escuro só nos ícones (aba e tela do celular).
- Arquivos em `marca/`, `favicon.svg`, `apple-touch-icon.png`, `manifest.webmanifest`.

## Site (página de captura)

| Endereço | Para quê |
| --- | --- |
| `/` | Página geral. Título: "Tem cliente que vinha sempre e sumiu. Você nem percebeu." |
| `/barbearia` | Título: "Tem cliente que cortava todo mês e sumiu. Você nem percebeu." |
| `/estetica-automotiva` | Título: "O carro que você lavou em agosto já está sujo de novo. E o dono foi para outro lugar." |
| `/app` | Protótipo navegável do app do cliente, com dados de exemplo |
| `/admin` | Painel do Eduardo, com senha |
| `/privacidade` | Política de privacidade da lista de espera |

- Cada nicho tem textos e demonstração animada próprios (configurados em `NICHES` no `app.js`).
- **Formulário com 3 itens:** nome, WhatsApp e "como você lembra seus clientes hoje?" (+ aceite). Sem e-mail e sem
  tamanho do negócio, para converter mais. Leva cerca de 13 segundos.
- **Botão:** "Quero testar grátis". Abaixo: "14 dias grátis quando lançar. Leva 20 segundos." e
  "Preço de fundador para as 50 primeiras inscrições."
- Calculadora de quanto dinheiro se perde, com botão "Quero recuperar esses clientes".
- Demonstração animada no celular: lembrar → mensagem → cliente responde → "Voltou" → mascote comemorando.

## Auditoria pela skill Revenue-Centric Design (@richardrx)

Feito: formulário menor, botões de toque, texto do botão, frase de risco, explicação do WhatsApp,
botão após a calculadora, perguntas antes do formulário, vagas de fundador.
Pendente:
- **Pixel do Meta + Vercel Analytics (+ Microsoft Clarity opcional)**: aguardando o Eduardo criar o Pixel.
- **Prova social** ("37 barbearias já estão na lista"): só com números reais, depois de umas 20 inscrições.
- **Contador de vagas de fundador** na página: junto com a prova social.

## Validação (Fase 1)

- 2 nichos, cerca de R$ 150 em anúncios no Meta por nicho, 7 a 10 dias, links com UTM
  (ex.: `/barbearia?utm_source=meta&utm_campaign=validacao&utm_content=video-demo`).
- **Seguir** se: 5%+ dos visitantes se inscrevem, até R$ 10 por inscrição, 30+ inscrições no nicho.
- **Repensar** se: abaixo de 2%, acima de R$ 25, menos de 10 inscrições. Trocar a mensagem antes de trocar a ideia.
- Meta de custo por assinante depois do lançamento: R$ 60 a R$ 80.

## Técnica

- **Hospedagem:** Vercel, publicando do GitHub `EduZRA/Retornei` (branch `main`). Time na Vercel: `edu-1e1e`.
- **Banco:** Supabase (região São Paulo). Tabela `leads` (script em `supabase/leads.sql`), com RLS ligado.
- **Funções:** `api/lead.js` (grava inscrição) e `api/admin.js` (confere a senha e lê inscrições).
- **Variáveis na Vercel:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (chave secreta `sb_secret_...`, vai só no cabeçalho
  `apikey`; a antiga service_role também funciona) e `ADMIN_PASSWORD`.
- Site estático (HTML, CSS e JS, sem build). App real planejado com Next.js + Supabase + PWA.

## Situação em 08/11/2026 e próximos passos

1. **Em andamento:** Eduardo configurando o Supabase e as 3 variáveis na Vercel, depois testar uma inscrição e o `/admin`.
2. Criar o Pixel do Meta e ligar a análise da Vercel.
3. Vídeos verticais para anúncios (stories/reels) a partir das 3 demonstrações (geral, barbearia, estética).
4. Rodar a validação (Fase 1) e acompanhar pelo `/admin`.
5. Se validar: abrir a ME, construir o app real (Fase 2) a partir do protótipo `/app`.
