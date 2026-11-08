// Retornei — painel de administração (fase de validação).

const FOUNDER_SPOTS = 50;
const NICHE_GOAL = 30; // meta de inscrições por nicho na validação
const GOALS = { conversion: 0.05, cpl: 10 }; // do plano: 5% ou mais; até R$ 10 por inscrição

const NICHES = { barbearia: "Barbearia", "estetica-automotiva": "Estética automotiva", geral: "Página geral" };
const METHODS = {
  "nao-lembro": "Não lembra, espera voltar",
  "whatsapp-manual": "Manda mensagem quando lembra",
  sistema: "Usa sistema ou app de agenda",
  outro: "Outro jeito",
};
const PAIN = new Set(["nao-lembro", "whatsapp-manual"]);

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const pct = (n) => `${Math.round(n * 100)}%`;
const DAY = 864e5;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const fmtDay = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDateTime = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const phoneFmt = (p) => { p = String(p || "").replace(/\D/g, ""); return p.length >= 10 ? `(${p.slice(0, 2)}) ${p.slice(2, p.length - 4)}-${p.slice(-4)}` : p; };

let password = null;
let demo = false;
let leads = [];
const filters = { period: "30", niche: "all", q: "" };

// ---------- Entrada ----------
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pwd = $("pwd").value;
  if (!pwd) { $("loginMsg").textContent = "Digite a senha do painel."; return; }
  $("enter").disabled = true; $("enter").textContent = "Entrando...";
  const ok = await load(pwd);
  $("enter").disabled = false; $("enter").textContent = "Entrar";
  if (ok) { password = pwd; $("pwd").value = ""; show(); }
});

$("demoBtn").addEventListener("click", () => { demo = true; leads = demoLeads(); show(); });

async function load(pwd) {
  try {
    const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pwd }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { $("loginMsg").textContent = data.error || "Não foi possível entrar agora."; return false; }
    leads = (data.leads || []).map(normalize);
    return true;
  } catch {
    $("loginMsg").textContent = "Sem conexão com o servidor. Tente de novo em instantes.";
    return false;
  }
}

function normalize(l) {
  return { ...l, created_at: new Date(l.created_at), tracking: l.tracking || {} };
}

function show() {
  $("login").hidden = true;
  $("dash").hidden = false;
  $("demoFlag").hidden = !demo;
  render();
}

$("logout").addEventListener("click", () => {
  password = null; demo = false; leads = [];
  $("dash").hidden = true; $("login").hidden = false; $("loginMsg").textContent = "";
  $("pwd").focus();
});

$("refresh").addEventListener("click", async () => {
  if (demo) { leads = demoLeads(); render(); return; }
  $("refresh").textContent = "Atualizando..."; $("refresh").disabled = true;
  const ok = await load(password);
  $("refresh").textContent = "Atualizar"; $("refresh").disabled = false;
  if (ok) render(); else { $("dash").hidden = true; $("login").hidden = false; }
});

// ---------- Filtros ----------
function bindSeg(id, key) {
  $(id).addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    filters[key] = b.dataset.v;
    $(id).querySelectorAll("button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
    render();
  });
  $(id).querySelectorAll("button").forEach((x) => { x.setAttribute("role", "radio"); x.setAttribute("aria-checked", x.classList.contains("on")); });
}
bindSeg("periodSeg", "period");
bindSeg("nicheSeg", "niche");
$("leadSearch").addEventListener("input", (e) => { filters.q = e.target.value; renderLeads(); });

function periodStart() {
  if (filters.period === "all") return new Date(0);
  return new Date(startOfDay(new Date()).getTime() - (Number(filters.period) - 1) * DAY);
}
const inPeriod = (l) => l.created_at >= periodStart();
const inNiche = (l) => filters.niche === "all" || l.niche === filters.niche;
const filtered = () => leads.filter((l) => inPeriod(l) && inNiche(l));

// ---------- Desenho ----------
function render() {
  renderKpis();
  renderDays();
  renderFunnel();
  renderMethods();
  renderNiches();
  renderSources();
  renderLeads();
}

function renderKpis() {
  const f = filtered();
  const todayCount = leads.filter((l) => inNiche(l) && l.created_at >= startOfDay(new Date())).length;
  const used = Math.min(leads.length, FOUNDER_SPOTS);
  const pain = f.filter((l) => PAIN.has(l.current_method)).length;
  const byCreative = group(f.filter((l) => l.tracking.utm_content), (l) => l.tracking.utm_content);
  const best = [...byCreative.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  $("kpis").innerHTML = `
    <div class="kpi hero"><p class="label">Vagas de fundador restantes</p><p class="value">${FOUNDER_SPOTS - used}</p>
      <p class="detail">${used} de ${FOUNDER_SPOTS} preenchidas</p><div class="meter"><i style="width:${(used / FOUNDER_SPOTS) * 100}%"></i></div></div>
    <div class="kpi"><p class="label">Inscrições no período</p><p class="value">${f.length}</p><p class="detail">Hoje: ${todayCount}</p></div>
    <div class="kpi"><p class="label">Têm a dor que resolvemos</p><p class="value">${f.length ? pct(pain / f.length) : "–"}</p><p class="detail">${pain} ${pain === 1 ? "pessoa" : "pessoas"} não lembram ou lembram na mão</p></div>
    <div class="kpi"><p class="label">Criativo que mais trouxe</p><p class="value" style="font-size:1.4rem;padding-top:6px">${best ? esc(best[0]) : "Sem rastreio"}</p><p class="detail">${best ? `${best[1].length} inscrições` : "Use utm_content nos links dos anúncios"}</p></div>`;
}

function renderDays() {
  const f = leads.filter(inNiche);
  let days = filters.period === "all"
    ? Math.min(90, Math.max(14, Math.ceil((Date.now() - Math.min(...f.map((l) => l.created_at), Date.now())) / DAY) + 1))
    : Math.max(14, Number(filters.period));
  days = Math.min(days, 90);
  const start = startOfDay(new Date()).getTime() - (days - 1) * DAY;
  const counts = Array.from({ length: days }, () => 0);
  f.forEach((l) => { const i = Math.floor((startOfDay(l.created_at).getTime() - start) / DAY); if (i >= 0 && i < days) counts[i]++; });
  const max = Math.max(...counts, 1);
  const every = days > 31 ? 7 : days > 14 ? 3 : 1;
  $("dayBars").innerHTML = counts.map((n, i) => {
    const d = new Date(start + i * DAY);
    return `<div class="daybar ${n ? "" : "zero"}" title="${fmtDay(d)}: ${n}"><b>${n || ""}</b><i style="height:${Math.round((n / max) * 130)}px"></i><small>${i % every === 0 || i === days - 1 ? fmtDay(d) : "&nbsp;"}</small></div>`;
  }).join("");
  $("dayBars").setAttribute("role", "img");
  $("dayBars").setAttribute("aria-label", `Inscrições por dia nos últimos ${days} dias: ${counts.reduce((a, b) => a + b, 0)} no total`);
}

// Funil: visitas e gasto digitados à mão, salvos neste navegador.
function readFunnel() { try { return JSON.parse(localStorage.getItem("retornei-funil") || "{}"); } catch { return {}; } }
function saveFunnel(v) { try { localStorage.setItem("retornei-funil", JSON.stringify(v)); } catch { /* sem armazenamento: só não lembra */ } }

function renderFunnel() {
  const saved = readFunnel();
  const keys = filters.niche === "all" ? ["barbearia", "estetica-automotiva"] : [filters.niche];
  $("funnel").innerHTML = keys.map((k) => {
    const v = saved[k] || {};
    return `<div class="funnel-row" data-k="${k}">
      <span class="funnel-name">${NICHES[k]}</span>
      <label>Visitas na página<input type="number" min="0" inputmode="numeric" data-f="visits" value="${v.visits ?? ""}"></label>
      <label>Gasto em anúncios (R$)<input type="number" min="0" step="0.01" inputmode="decimal" data-f="spend" value="${v.spend ?? ""}"></label>
      <label>Inscrições no período<input type="number" value="${leads.filter((l) => inPeriod(l) && l.niche === k).length}" disabled></label>
      <div class="funnel-out" data-out></div>
    </div>`;
  }).join("");
  $("funnel").querySelectorAll(".funnel-row").forEach(updateFunnelRow);
  $("funnel").oninput = (e) => {
    const rowEl = e.target.closest(".funnel-row"); if (!rowEl || !e.target.dataset.f) return;
    const all = readFunnel(); const k = rowEl.dataset.k;
    all[k] = { ...(all[k] || {}), [e.target.dataset.f]: e.target.value };
    saveFunnel(all); updateFunnelRow(rowEl);
  };
}
function updateFunnelRow(rowEl) {
  const k = rowEl.dataset.k;
  const visits = Number(rowEl.querySelector('[data-f="visits"]').value) || 0;
  const spend = Number(rowEl.querySelector('[data-f="spend"]').value) || 0;
  const n = leads.filter((l) => inPeriod(l) && l.niche === k).length;
  const out = [];
  if (visits) { const c = n / visits; out.push(`<span class="pill ${c >= GOALS.conversion ? "good" : c < 0.02 ? "bad" : ""}">Conversão ${(c * 100).toFixed(1)}% (meta 5%)</span>`); }
  if (spend && n) { const cpl = spend / n; out.push(`<span class="pill ${cpl <= GOALS.cpl ? "good" : cpl > 25 ? "bad" : ""}">${brl(cpl)} por inscrição (meta R$ 10)</span>`); }
  if (!out.length) out.push(`<span class="pill">Preencha visitas e gasto para ver conversão e custo</span>`);
  rowEl.querySelector("[data-out]").innerHTML = out.join("");
}

function renderMethods() {
  const f = filtered();
  const counts = Object.keys(METHODS).map((k) => [k, f.filter((l) => l.current_method === k).length]);
  const max = Math.max(...counts.map((c) => c[1]), 1);
  $("methodBars").innerHTML = counts.map(([k, n]) => `<div class="hbar ${PAIN.has(k) ? "" : "cold"}">
      <span>${METHODS[k]}</span><div class="track"><i style="width:${(n / max) * 100}%"></i></div>
      <span class="num">${n}${f.length ? ` <small style="color:var(--muted);font-weight:400">${pct(n / f.length)}</small>` : ""}</span></div>`).join("");
}

function group(arr, keyFn) {
  const m = new Map();
  arr.forEach((x) => { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
  return m;
}

function renderNiches() {
  const f = leads.filter(inPeriod);
  const rows = Object.keys(NICHES).map((k) => {
    const items = f.filter((l) => l.niche === k);
    const pain = items.filter((l) => PAIN.has(l.current_method)).length;
    const lastL = items.reduce((a, b) => (!a || b.created_at > a.created_at ? b : a), null);
    const goal = k === "geral" ? "" : `<div class="goal"><div class="meter"><i style="width:${Math.min(100, (items.length / NICHE_GOAL) * 100)}%"></i></div><span>${items.length}/${NICHE_GOAL}</span></div>`;
    return `<tr><td>${NICHES[k]}</td><td class="n">${items.length}</td><td class="n">${items.length ? pct(pain / items.length) : "–"}</td><td>${goal || '<span class="note" style="margin:0">Sem meta</span>'}</td><td>${lastL ? fmtDateTime(lastL.created_at) : "–"}</td></tr>`;
  }).join("");
  $("nicheTable").innerHTML = `<thead><tr><th>Nicho</th><th class="n">Inscrições</th><th class="n">Com a dor</th><th>Meta da validação</th><th>Última inscrição</th></tr></thead><tbody>${rows}</tbody>`;
}

function renderSources() {
  const f = filtered();
  const g = group(f, (l) => [l.tracking.utm_source || "", l.tracking.utm_campaign || "", l.tracking.utm_content || ""].join("|"));
  const rows = [...g.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, items]) => {
    const [src, camp, cont] = k.split("|");
    const label = src || (camp || cont ? "?" : "Direto ou sem rastreio");
    return `<tr><td>${esc(label)}</td><td>${esc(camp || "–")}</td><td>${esc(cont || "–")}</td><td class="n">${items.length}</td><td class="n">${pct(items.length / f.length)}</td></tr>`;
  }).join("");
  $("sourceTable").innerHTML = `<thead><tr><th>Origem</th><th>Campanha</th><th>Criativo</th><th class="n">Inscrições</th><th class="n">Do total</th></tr></thead>
    <tbody>${rows || '<tr class="empty-row"><td colspan="5">Nenhuma inscrição no período.</td></tr>'}</tbody>`;
}

function searchMatch(l) {
  const q = filters.q.trim().toLowerCase(); if (!q) return true;
  return (l.name || "").toLowerCase().includes(q) || String(l.whatsapp || "").includes(q.replace(/\D/g, "") || "##");
}

function renderLeads() {
  const f = filtered().filter(searchMatch).sort((a, b) => b.created_at - a.created_at);
  const shown = f.slice(0, 300);
  $("leadTable").innerHTML = `<thead><tr><th>Quando</th><th>Nome</th><th>WhatsApp</th><th>Nicho</th><th>Como lembra hoje</th><th>Origem</th></tr></thead>
    <tbody>${shown.map((l) => `<tr>
      <td>${fmtDateTime(l.created_at)}</td>
      <td>${esc(l.name)}</td>
      <td><a href="https://wa.me/55${esc(String(l.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener">${esc(phoneFmt(l.whatsapp))}</a></td>
      <td>${esc(NICHES[l.niche] || l.niche)}</td>
      <td><span class="tag ${PAIN.has(l.current_method) ? "pain" : ""}">${esc(METHODS[l.current_method] || l.current_method)}</span></td>
      <td>${esc([l.tracking.utm_source, l.tracking.utm_content].filter(Boolean).join(" / ") || "–")}</td>
    </tr>`).join("") || '<tr class="empty-row"><td colspan="6">Nenhuma inscrição com esses filtros.</td></tr>'}</tbody>`;
  if (f.length > shown.length) $("leadTable").insertAdjacentHTML("beforeend", `<tfoot><tr><td colspan="6" class="note">Mostrando as ${shown.length} mais recentes de ${f.length}. Baixe a planilha para ver todas.</td></tr></tfoot>`);
}

// Planilha (CSV com ponto e vírgula, abre direto no Excel em português)
$("exportCsv").addEventListener("click", () => {
  const f = filtered().filter(searchMatch).sort((a, b) => b.created_at - a.created_at);
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [["Data", "Nome", "WhatsApp", "Nicho", "Como lembra hoje", "Origem", "Campanha", "Criativo"].map(cell).join(";")]
    .concat(f.map((l) => [fmtDateTime(l.created_at), l.name, phoneFmt(l.whatsapp), NICHES[l.niche] || l.niche, METHODS[l.current_method] || l.current_method,
      l.tracking.utm_source, l.tracking.utm_campaign, l.tracking.utm_content].map(cell).join(";")));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `retornei-inscricoes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

// ---------- Dados de exemplo ----------
function demoLeads() {
  const names = ["Ricardo Alves", "Fábio Nunes", "Jorge Matos", "Wesley Pinto", "Daniel Rocha", "Alex Moura", "Paulo Sérgio", "Renato Dias", "Cláudio Reis", "Edson Lima",
    "Rogério Prado", "Fernando Luz", "Sérgio Melo", "Leandro Braga", "Márcio Teles", "Robson Viana", "Juliana Prado", "Carla Mendes", "Patrícia Souza", "Aline Costa"];
  const pick = (arr, w) => { let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < arr.length; i++) { r -= w[i]; if (r <= 0) return arr[i]; } return arr[0]; };
  const out = [];
  for (let i = 0; i < 41; i++) {
    const niche = pick(["barbearia", "estetica-automotiva", "geral"], [22, 12, 7]);
    const src = pick(["meta", "google", ""], [30, 6, 5]);
    const t = src ? { utm_source: src, utm_campaign: "validacao", utm_content: src === "meta" ? pick(["video-demo", "calculadora", "cliente-sumiu"], [5, 3, 2]) : "busca" } : {};
    const d = new Date(Date.now() - Math.floor(Math.pow(Math.random(), 0.7) * 20) * DAY - Math.floor(Math.random() * 10) * 36e5);
    out.push({ id: i, created_at: d, name: names[i % names.length], whatsapp: "119" + String(87650000 + i * 137).slice(0, 8), niche,
      current_method: pick(Object.keys(METHODS), [16, 17, 5, 3]), tracking: t });
  }
  return out;
}
