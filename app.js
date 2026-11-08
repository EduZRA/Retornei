// Retornei — página de captura
// Uma página, vários nichos: o texto e o exemplo do app mudam pela URL
// (/barbearia, /estetica-automotiva) ou por ?nicho=...

const NICHES = {
  barbearia: {
    copy: {
      headline: "Tem cliente que cortava todo mês e sumiu. Você nem percebeu.",
      lead: "O Retornei avisa todo dia quem está na hora de voltar para a sua barbearia e deixa a mensagem de WhatsApp pronta. Você só toca em enviar.",
      step1: "Nome e WhatsApp. Dá para importar de uma planilha ou dos seus contatos em poucos minutos.",
      step2: "Um toque depois do corte. O Retornei calcula quando aquele cliente costuma voltar.",
      step3: "Toda manhã aparece quem está na hora. A mensagem sai do seu número, com o seu jeito de falar.",
      businessLabel: "Nome da barbearia",
    },
    calc: { clients: 200, ticket: 45, lost: 2 },
    back: { count: 14, money: 980 },
    due: [
      { name: "Rafael Souza", service: "Corte", days: 22, late: false,
        msg: "Fala, Rafael! Já faz 22 dias do seu último corte. Bora deixar na régua de novo? Tenho horário quinta e sexta à tarde." },
      { name: "Diego Lima", service: "Barba", days: 17, late: false,
        msg: "E aí, Diego! A barba já deve estar pedindo um trato. Quer que eu reserve um horário essa semana?" },
      { name: "Marcos Paulo", service: "Corte e barba", days: 41, late: true,
        msg: "Marcos, quanto tempo! Faz mais de um mês do último corte e barba. Separei um horário pra você sábado de manhã, serve?" },
    ],
  },

  "estetica-automotiva": {
    copy: {
      headline: "O carro que você lavou em agosto já está sujo de novo. E o dono foi para outro lugar.",
      lead: "O Retornei avisa todo dia quais clientes da sua estética automotiva estão na hora de voltar e deixa a mensagem de WhatsApp pronta. Você só toca em enviar.",
      step1: "Nome, WhatsApp e o carro. Dá para importar de uma planilha ou dos seus contatos em poucos minutos.",
      step2: "Um toque depois da lavagem ou do polimento. O Retornei calcula quando aquele cliente costuma voltar.",
      step3: "Toda manhã aparece quem está na hora. A mensagem sai do seu número, com o seu jeito de falar.",
      businessLabel: "Nome da estética automotiva",
    },
    calc: { clients: 120, ticket: 90, lost: 3 },
    back: { count: 9, money: 1260 },
    due: [
      { name: "Juliana Prado", service: "Lavagem do Compass", days: 30, late: false,
        msg: "Oi, Juliana! Já faz um mês da última lavagem do Compass. Quer agendar para essa semana? Tenho horário quarta e sexta." },
      { name: "Carlos Mendes", service: "Higienização do Onix", days: 92, late: false,
        msg: "Carlos, tudo bem? Faz três meses da higienização do Onix. Bom momento para renovar. Posso reservar um horário?" },
      { name: "André Rocha", service: "Vitrificação da Hilux", days: 200, late: true,
        msg: "André, a vitrificação da Hilux já passou do prazo da manutenção. Vale fazer a revisão para manter a proteção. Quando fica bom pra você?" },
    ],
  },
};

function detectNiche() {
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get("nicho");
  if (fromQuery && NICHES[fromQuery]) return fromQuery;
  const slug = location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (NICHES[slug]) return slug;
  return "barbearia";
}

const nicheKey = detectNiche();
const niche = NICHES[nicheKey];
document.body.dataset.niche = nicheKey;

// ---------- Texto do nicho ----------
document.querySelectorAll("[data-copy]").forEach((el) => {
  const text = niche.copy[el.dataset.copy];
  if (text) el.textContent = text;
});
const nicheField = document.getElementById("nicheField");
if (nicheField) nicheField.value = nicheKey;

// ---------- Exemplo do app ----------
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function todayLabel() {
  const d = new Date();
  const text = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1).replace("-feira", "");
}

const list = document.getElementById("dueList");
const dueCount = document.getElementById("dueCount");
const dueLabel = document.getElementById("dueLabel");
const bubble = document.getElementById("bubble");
const bubbleTo = document.getElementById("bubbleTo");
const bubbleText = document.getElementById("bubbleText");
const bubbleClose = document.getElementById("bubbleClose");
const backCountEl = document.getElementById("backCount");
const backMoneyEl = document.getElementById("backMoney");

document.getElementById("screenDate").textContent = todayLabel();
backCountEl.textContent = niche.back.count;
backMoneyEl.textContent = brl(niche.back.money);

let pending = niche.due.length;
let lastButton = null;

function updateCount() {
  dueCount.textContent = pending;
  dueLabel.textContent = pending === 1 ? "cliente na hora de voltar" : "clientes na hora de voltar";
  if (pending === 0) dueLabel.textContent = "clientes pendentes. Tudo em dia.";
}

function initials(name) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("");
}

niche.due.forEach((c) => {
  const li = document.createElement("li");
  li.className = "due" + (c.late ? " is-late" : "");

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initials(c.name);

  const info = document.createElement("div");
  const name = document.createElement("p");
  name.className = "due-name";
  name.textContent = c.name;
  const meta = document.createElement("p");
  meta.className = "due-meta";
  meta.textContent = `${c.service}, faz ${c.days} dias${c.late ? ". Atrasado" : ""}`;
  info.append(name, meta);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "due-btn";
  btn.textContent = "Lembrar";
  btn.setAttribute("aria-label", `Lembrar ${c.name}`);
  btn.addEventListener("click", () => {
    if (li.classList.contains("is-sent")) return;
    bubbleTo.textContent = c.name;
    bubbleText.textContent = c.msg;
    bubble.hidden = false;
    lastButton = btn;
    bubbleClose.focus();
    li.classList.remove("is-late");
    li.classList.add("is-sent");
    btn.textContent = "Enviado";
    btn.setAttribute("aria-label", `Lembrete enviado para ${c.name}`);
    pending -= 1;
    updateCount();
  });

  li.append(avatar, info, btn);
  list.append(li);
});
updateCount();

function closeBubble() {
  bubble.hidden = true;
  if (lastButton) lastButton.focus();
}
bubbleClose.addEventListener("click", closeBubble);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !bubble.hidden) closeBubble();
});

// ---------- Calculadora ----------
const calcClients = document.getElementById("calcClients");
const calcTicket = document.getElementById("calcTicket");
const calcLost = document.getElementById("calcLost");
const calcLostOut = document.getElementById("calcLostOut");
const calcResult = document.getElementById("calcResult");

calcClients.value = niche.calc.clients;
calcTicket.value = niche.calc.ticket;
calcLost.value = niche.calc.lost;

function updateCalc() {
  const clients = Math.max(0, Number(calcClients.value) || 0);
  const ticket = Math.max(0, Number(calcTicket.value) || 0);
  const lost = Number(calcLost.value) || 0;
  calcLostOut.textContent = lost;
  calcResult.textContent = brl(clients * (lost / 10) * ticket);
}
[calcClients, calcTicket, calcLost].forEach((el) => el.addEventListener("input", updateCalc));
updateCalc();

// ---------- Lista de espera ----------
const form = document.getElementById("leadForm");
const submit = document.getElementById("leadSubmit");
const msg = document.getElementById("formMsg");
const phone = form.elements.whatsapp;

// Guarda de onde a pessoa veio (anúncio, campanha) para comparar nichos e criativos.
const params = new URLSearchParams(location.search);
const tracking = {};
["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach((k) => {
  if (params.get(k)) tracking[k] = params.get(k).slice(0, 200);
});

phone.addEventListener("input", () => {
  const d = phone.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  phone.value = out;
});

function showMsg(text, kind) {
  msg.textContent = text;
  msg.className = "form-msg " + (kind === "ok" ? "is-ok" : "is-error");
}

function validate() {
  let firstBad = null;
  const checks = [
    [form.elements.name, (v) => v.trim().length >= 2],
    [phone, (v) => v.replace(/\D/g, "").length >= 10],
    [form.elements.size, (v) => v !== ""],
    [form.elements.current_method, (v) => v !== ""],
  ];
  checks.forEach(([el, ok]) => {
    const good = ok(el.value);
    el.setAttribute("aria-invalid", good ? "false" : "true");
    if (!good && !firstBad) firstBad = el;
  });
  if (firstBad) {
    showMsg("Preencha nome, WhatsApp com DDD e as duas escolhas para entrar na lista.", "error");
    firstBad.focus();
    return false;
  }
  if (!form.elements.consent.checked) {
    showMsg("Marque a caixa de aceite para receber o aviso do lançamento.", "error");
    form.elements.consent.focus();
    return false;
  }
  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const data = {
    name: form.elements.name.value.trim(),
    whatsapp: phone.value.replace(/\D/g, ""),
    business: form.elements.business.value.trim(),
    size: form.elements.size.value,
    current_method: form.elements.current_method.value,
    niche: nicheKey,
    website: form.elements.website.value, // armadilha para robôs
    tracking,
  };

  submit.disabled = true;
  submit.textContent = "Enviando...";
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    nicheField.value = nicheKey;
    showMsg("Você está na lista. Avisamos pelo WhatsApp quando o teste grátis abrir.", "ok");
    submit.textContent = "Inscrição feita";
    if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_category: nicheKey });
    if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { niche: nicheKey });
  } catch (err) {
    showMsg("Não foi possível enviar agora. Confira sua conexão e tente de novo em instantes.", "error");
    submit.disabled = false;
    submit.textContent = "Entrar na lista de espera";
  }
});
