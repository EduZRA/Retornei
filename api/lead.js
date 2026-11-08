// Recebe uma inscrição da lista de espera e grava no Supabase.
// Roda como Função Serverless da Vercel. Sem dependências: usa a API REST do Supabase.
//
// Variáveis de ambiente (configurar no painel da Vercel):
//   SUPABASE_URL          ex.: https://abcdefgh.supabase.co
//   SUPABASE_SERVICE_KEY  chave secreta do projeto, sb_secret_... (ou a antiga service_role). Nunca no front-end

const NICHES = ["geral", "barbearia", "estetica-automotiva"];
const METHODS = ["nao-lembro", "whatsapp-manual", "sistema", "outro"];

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

// Chave secreta nova (sb_secret_...) vai só no cabeçalho apikey.
// A chave antiga service_role (um JWT, começa com "eyJ") também vai como Bearer.
const supabaseAuth = (key) => (key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key });

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON inválido." }); }
  }
  body = body || {};

  // Armadilha para robôs: pessoas não veem esse campo.
  if (body.website) return res.status(200).json({ ok: true });

  const lead = {
    name: clean(body.name, 80),
    whatsapp: clean(body.whatsapp, 20).replace(/\D/g, ""),
    business: clean(body.business, 80) || null,
    current_method: clean(body.current_method, 30),
    niche: clean(body.niche, 40),
    tracking: body.tracking && typeof body.tracking === "object" ? body.tracking : {},
    user_agent: clean(req.headers["user-agent"], 300),
  };

  const problems = [];
  if (lead.name.length < 2) problems.push("name");
  if (lead.whatsapp.length < 10 || lead.whatsapp.length > 13) problems.push("whatsapp");
  if (!METHODS.includes(lead.current_method)) problems.push("current_method");
  if (!NICHES.includes(lead.niche)) lead.niche = "geral";
  if (problems.length) return res.status(400).json({ error: "Campos inválidos.", fields: problems });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados.");
    return res.status(503).json({ error: "Lista de espera ainda não configurada." });
  }

  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/leads`, {
      method: "POST",
      headers: {
        ...supabaseAuth(key),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });
    if (!r.ok) {
      console.error("Supabase recusou o lead:", r.status, await r.text());
      return res.status(502).json({ error: "Não foi possível salvar agora." });
    }
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Falha ao falar com o Supabase:", err);
    return res.status(502).json({ error: "Não foi possível salvar agora." });
  }
};
