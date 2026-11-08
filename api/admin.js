// Painel de administração: confere a senha e devolve as inscrições da lista de espera.
// Roda na Vercel. A chave do Supabase fica só aqui, nunca no navegador.
//
// Variáveis de ambiente (painel da Vercel):
//   ADMIN_PASSWORD        senha do painel (use uma longa, só sua)
//   SUPABASE_URL          igual à usada em /api/lead
//   SUPABASE_SERVICE_KEY  igual à usada em /api/lead

const crypto = require("crypto");

function samePassword(given, expected) {
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON inválido." }); }
  }
  body = body || {};

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(503).json({ error: "A senha do painel ainda não foi configurada na Vercel (ADMIN_PASSWORD)." });

  if (!body.password || !samePassword(body.password, expected)) {
    await pause(900); // atrasa tentativas de adivinhar a senha
    return res.status(401).json({ error: "Senha incorreta." });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(503).json({ error: "O Supabase ainda não foi ligado (SUPABASE_URL e SUPABASE_SERVICE_KEY)." });

  try {
    const query = "select=id,created_at,name,whatsapp,current_method,niche,tracking&order=created_at.desc&limit=5000";
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/leads?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      console.error("Supabase recusou a leitura:", r.status, await r.text());
      return res.status(502).json({ error: "Não foi possível ler as inscrições agora." });
    }
    return res.status(200).json({ leads: await r.json() });
  } catch (err) {
    console.error("Falha ao falar com o Supabase:", err);
    return res.status(502).json({ error: "Não foi possível ler as inscrições agora." });
  }
};
