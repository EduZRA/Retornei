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
    },
    calc: { clients: 200, ticket: 45, lost: 2 },
    back: { count: 14, money: 980 },
    due: [
      { name: "Rafael Souza", service: "Corte", days: 22, late: false,
        msg: "Fala, Rafael! Já faz 22 dias do seu último corte. Bora deixar na régua de novo? Tenho horário quinta e sexta à tarde.",
        reply: "Bora! Quinta às 16h tem?", value: 45 },
      { name: "Diego Lima", service: "Barba", days: 17, late: false,
        msg: "E aí, Diego! A barba já deve estar pedindo um trato. Quer que eu reserve um horário essa semana?",
        reply: "Opa, sexta de manhã pode ser?", value: 30 },
      { name: "Marcos Paulo", service: "Corte e barba", days: 41, late: true,
        msg: "Marcos, quanto tempo! Faz mais de um mês do último corte e barba. Separei um horário pra você sábado de manhã, serve?",
        reply: "Pô, verdade! Sábado 9h fechado.", value: 70 },
    ],
  },

  "estetica-automotiva": {
    copy: {
      headline: "O carro que você lavou em agosto já está sujo de novo. E o dono foi para outro lugar.",
      lead: "O Retornei avisa todo dia quais clientes da sua estética automotiva estão na hora de voltar e deixa a mensagem de WhatsApp pronta. Você só toca em enviar.",
      step1: "Nome, WhatsApp e o carro. Dá para importar de uma planilha ou dos seus contatos em poucos minutos.",
      step2: "Um toque depois da lavagem ou do polimento. O Retornei calcula quando aquele cliente costuma voltar.",
      step3: "Toda manhã aparece quem está na hora. A mensagem sai do seu número, com o seu jeito de falar.",
    },
    calc: { clients: 120, ticket: 90, lost: 3 },
    back: { count: 9, money: 1260 },
    due: [
      { name: "Juliana Prado", service: "Lavagem do Compass", days: 30, late: false,
        msg: "Oi, Juliana! Já faz um mês da última lavagem do Compass. Quer agendar para essa semana? Tenho horário quarta e sexta.",
        reply: "Quero sim! Sexta de manhã?", value: 90 },
      { name: "Carlos Mendes", service: "Higienização do Onix", days: 92, late: false,
        msg: "Carlos, tudo bem? Faz três meses da higienização do Onix. Bom momento para renovar. Posso reservar um horário?",
        reply: "Pode ser na semana que vem?", value: 150 },
      { name: "André Rocha", service: "Vitrificação da Hilux", days: 200, late: true,
        msg: "André, a vitrificação da Hilux já passou do prazo da manutenção. Vale fazer a revisão para manter a proteção. Quando fica bom pra você?",
        reply: "Verdade, nem lembrava. Quinta serve?", value: 300 },
    ],
  },
};

// Página principal (/): texto genérico para qualquer serviço recorrente.
// A demonstração mistura serviços de tipos diferentes para não puxar para um nicho.
NICHES.geral = {
  back: { count: 12, money: 1150 },
  due: [
    { name: "Rafael Souza", service: "Corte de cabelo", days: 22, late: false,
      msg: "Oi, Rafael! Já faz 22 dias do seu último corte. Quer agendar para essa semana? Tenho horário quinta e sexta.",
      reply: "Bora! Quinta às 16h tem?", value: 45 },
    { name: "Juliana Prado", service: "Lavagem do carro", days: 30, late: false,
      msg: "Oi, Juliana! Faz um mês da última lavagem do carro. Quer agendar para essa semana?",
      reply: "Quero sim! Sexta de manhã?", value: 90 },
    { name: "Paulo Henrique", service: "Limpeza do ar-condicionado", days: 190, late: true,
      msg: "Paulo, tudo bem? Faz mais de 6 meses da limpeza do ar-condicionado. Vale fazer antes do calor. Posso reservar um horário?",
      reply: "Verdade! Pode ser sábado?", value: 180 },
  ],
  copy: {
    headline: "Tem cliente que vinha sempre e sumiu. Você nem percebeu.",
    lead: "O Retornei avisa todo dia quais clientes estão na hora de voltar ao seu negócio e deixa a mensagem de WhatsApp pronta. Você só toca em enviar.",
    step1: "Nome e WhatsApp. Dá para importar de uma planilha ou dos seus contatos em poucos minutos.",
    step2: "Um toque depois de cada serviço. O Retornei calcula quando aquele cliente costuma voltar.",
    step3: "Toda manhã aparece quem está na hora. A mensagem sai do seu número, com o seu jeito de falar.",
  },
  calc: { clients: 150, ticket: 60, lost: 2 },
};

function detectNiche() {
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get("nicho");
  if (fromQuery && NICHES[fromQuery]) return fromQuery;
  const slug = location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (NICHES[slug]) return slug;
  return "geral";
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

// ---------- Exemplo do app (demonstração automática + uso livre) ----------
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function todayLabel() {
  const d = new Date();
  const text = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1).replace("-feira", "");
}
const nowTime = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const initials = (name) => name.split(" ").slice(0, 2).map((p) => p[0]).join("");

const $ = (id) => document.getElementById(id);
const screen = document.querySelector(".screen");
const list = $("dueList");
const dueCount = $("dueCount");
const dueLabel = $("dueLabel");
const backCountEl = $("backCount");
const backMoneyEl = $("backMoney");
const chat = $("chat");
const chatName = $("chatName");
const chatAvatar = $("chatAvatar");
const chatStatus = $("chatStatus");
const chatBody = $("chatBody");
const chatDraft = $("chatDraft");
const chatSend = $("chatSend");
const chatBack = $("chatBack");
const tap = $("tap");
const caption = $("phoneCaption");
const demoToggle = $("demoToggle");

$("screenDate").textContent = todayLabel();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Estado da tela
let rows = [];          // { c, li, action }
let back = { ...niche.back };
let current = null;     // linha com a conversa aberta

// A demonstração roda numa "sessão"; trocar o número cancela a que estiver rodando.
let session = 0;
class Cancelled extends Error {}
const wait = (ms, id) => new Promise((resolve, reject) => {
  setTimeout(() => (id === session ? resolve() : reject(new Cancelled())), ms);
});

function setCount() {
  const pending = rows.filter((r) => r.li.dataset.state === "pending").length;
  dueCount.textContent = pending;
  dueLabel.textContent = pending === 0 ? "clientes pendentes. Tudo em dia."
    : pending === 1 ? "cliente na hora de voltar" : "clientes na hora de voltar";
}

function setBack(count, money, animate) {
  backCountEl.textContent = count;
  if (!animate || reduceMotion) { backMoneyEl.textContent = brl(money); return; }
  const from = back.money;
  const start = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - start) / 700);
    backMoneyEl.textContent = brl(Math.round(from + (money - from) * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setRowState(row, state) {
  const { li, c } = row;
  li.dataset.state = state;
  li.classList.remove("is-late", "is-sent", "is-replied", "is-back");
  const meta = li.querySelector(".due-meta");
  if (meta) meta.textContent = `${c.service}, faz ${c.days} dias${c.late && state === "pending" ? ". Atrasado" : ""}`;
  const old = li.querySelector(".due-btn, .due-status");
  let action;
  if (state === "pending") {
    if (c.late) li.classList.add("is-late");
    action = document.createElement("button");
    action.type = "button";
    action.className = "due-btn";
    action.textContent = "Lembrar";
    action.setAttribute("aria-label", `Lembrar ${c.name}`);
    action.addEventListener("click", (e) => {
      if (e.isTrusted && demoOn) {
        const idx = rows.indexOf(row);
        takeOver();
        openChat(rows[idx]);
        return;
      }
      openChat(row);
    });
  } else {
    action = document.createElement("span");
    action.className = "due-status";
    const labels = { sent: "Enviado", replied: "Respondeu", back: "Voltou" };
    action.textContent = labels[state];
    li.classList.add(state === "sent" ? "is-sent" : state === "replied" ? "is-replied" : "is-back");
    if (!reduceMotion) { li.classList.remove("flash"); void li.offsetWidth; li.classList.add("flash"); }
  }
  old.replaceWith(action);
  row.action = action;
  setCount();
}

function buildList() {
  list.textContent = "";
  rows = niche.due.map((c) => {
    const li = document.createElement("li");
    li.className = "due";

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

    const placeholder = document.createElement("span");
    placeholder.className = "due-status";
    li.append(avatar, info, placeholder);
    list.append(li);

    const row = { c, li, action: placeholder };
    setRowState(row, "pending");
    return row;
  });
  back = { ...niche.back };
  setBack(back.count, back.money, false);
  setCount();
}

// ----- Conversa -----
function addMessage(kind, text) {
  const m = document.createElement("div");
  m.className = `msg msg-${kind}`;
  const t = document.createElement("span");
  t.textContent = text;
  const meta = document.createElement("span");
  meta.className = "msg-meta";
  meta.textContent = nowTime();
  if (kind === "out") {
    const ticks = document.createElement("span");
    ticks.className = "ticks";
    ticks.textContent = "✓✓";
    meta.append(ticks);
  }
  m.append(t, meta);
  chatBody.append(m);
  return m;
}

function showTyping() {
  const m = document.createElement("div");
  m.className = "msg msg-in msg-typing";
  m.setAttribute("aria-label", "digitando");
  m.innerHTML = "<i></i><i></i><i></i>";
  chatBody.append(m);
  chatStatus.textContent = "digitando...";
  return m;
}

function openChat(row, typed = false) {
  current = row;
  chatName.textContent = row.c.name;
  chatAvatar.textContent = initials(row.c.name);
  chatStatus.textContent = "online";
  chatBody.textContent = "";
  chatDraft.textContent = typed ? "" : row.c.msg;
  chatSend.disabled = false;
  chat.classList.add("is-open");
  chat.setAttribute("aria-hidden", "false");
  chatSend.tabIndex = 0;
  chatBack.tabIndex = 0;
  if (!typed) chatSend.focus({ preventScroll: true });
}

function closeChat() {
  chat.classList.remove("is-open");
  chat.setAttribute("aria-hidden", "true");
  chatSend.tabIndex = -1;
  chatBack.tabIndex = -1;
  const row = current;
  current = null;
  if (row && row.action && row.action.focus) row.action.focus({ preventScroll: true });
  return row;
}

function sendDraft() {
  if (!current || !chatDraft.textContent) return;
  addMessage("out", chatDraft.textContent);
  chatDraft.textContent = "";
  chatSend.disabled = true;
  setRowState(current, "sent");
}

// Uso livre: a resposta do cliente chega sozinha depois de enviar.
async function manualReply(row, id) {
  await wait(900, id);
  // As bolhas só aparecem se a conversa desse cliente ainda estiver aberta.
  const typing = current === row ? showTyping() : null;
  await wait(1300, id);
  if (typing) typing.remove();
  if (current === row) {
    chatStatus.textContent = "online";
    addMessage("in", row.c.reply);
  }
  setRowState(row, "replied");
  if (current !== row) {
    await wait(500, id);
    markBack(row);
  }
}

chatSend.addEventListener("click", (e) => {
  if (!e.isTrusted) return;
  if (demoOn && current) { stopDemo(YOUR_TURN); chatDraft.textContent = current.c.msg; }
  const row = current;
  sendDraft();
  if (row) manualReply(row, session).catch(() => {});
});

function handleBack() {
  if (demoOn) stopDemo(YOUR_TURN);
  const row = closeChat();
  if (row && row.li.dataset.state === "replied") {
    const id = session;
    wait(500, id).then(() => markBack(row)).catch(() => {});
  }
}

chatBack.addEventListener("click", (e) => {
  if (e.isTrusted) handleBack();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && current) handleBack();
});

function markBack(row) {
  setRowState(row, "back");
  const next = { count: back.count + 1, money: back.money + row.c.value };
  setBack(next.count, next.money, true);
  back = next;
}

// ----- Dedo da demonstração -----
function moveTapTo(el) {
  const s = screen.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  tap.style.transform = `translate(${r.left - s.left + r.width / 2}px, ${r.top - s.top + r.height / 2}px)`;
  tap.classList.add("is-visible");
}
async function press(el, id) {
  moveTapTo(el);
  await wait(800, id);
  tap.classList.remove("is-press");
  void tap.offsetWidth;
  tap.classList.add("is-press");
  await wait(220, id);
}

async function typeInto(el, text, id) {
  el.textContent = "";
  const step = Math.max(14, Math.min(30, 2600 / text.length));
  for (let i = 0; i < text.length; i += 2) {
    el.textContent = text.slice(0, i + 2);
    await wait(step, id);
  }
}

// Uma volta completa com um cliente.
async function demoCustomer(row, id) {
  await press(row.action, id);
  openChat(row, true);
  await wait(500, id);
  moveTapTo(chatDraft);
  await typeInto(chatDraft, row.c.msg, id);
  await wait(400, id);
  await press(chatSend, id);
  sendDraft();
  tap.classList.remove("is-visible");
  await wait(900, id);
  const typing = showTyping();
  await wait(1400, id);
  typing.remove();
  chatStatus.textContent = "online";
  addMessage("in", row.c.reply);
  setRowState(row, "replied");
  await wait(1800, id);
  await press(chatBack, id);
  closeChat();
  tap.classList.remove("is-visible");
  await wait(900, id);
  markBack(row);
  await wait(1800, id);
}

let demoOn = !reduceMotion;
const YOUR_TURN = "Agora é com você: toque em <strong>Lembrar</strong>, envie e veja o cliente voltar.";
let visible = false;

async function runDemo() {
  const id = ++session;
  closeChat();
  buildList();
  tap.classList.remove("is-visible");
  caption.innerHTML = "Demonstração do app. Toque em <strong>Lembrar</strong> para testar você mesmo.";
  demoToggle.textContent = "Pausar demonstração";
  try {
    while (true) {
      await wait(1400, id);
      await demoCustomer(rows[0], id);
      const late = rows.find((r) => r.c.late) || rows[rows.length - 1];
      await demoCustomer(late, id);
      await wait(2200, id);
      closeChat();
      buildList();
    }
  } catch (err) {
    if (!(err instanceof Cancelled)) throw err;
  }
}

function stopDemo(message) {
  session++;
  tap.classList.remove("is-visible");
  demoOn = false;
  caption.innerHTML = message;
  demoToggle.textContent = "Ver demonstração";
}

// Quando a pessoa toca de verdade, a demonstração para e a tela recomeça para ela usar.
function takeOver() {
  if (!demoOn) return;
  stopDemo(YOUR_TURN);
  closeChat();
  buildList();
}

demoToggle.addEventListener("click", () => {
  if (demoOn) {
    stopDemo("Demonstração pausada. Toque em <strong>Lembrar</strong> para testar você mesmo.");
  } else {
    demoOn = true;
    runDemo();
  }
});

buildList();
if (reduceMotion) {
  demoToggle.hidden = true;
  caption.innerHTML = "Toque em <strong>Lembrar</strong>, envie e veja o cliente voltar.";
} else if ("IntersectionObserver" in window) {
  // Só anima quando o celular está na tela.
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && demoOn) runDemo();
    else if (!visible && demoOn) session++;
  }, { threshold: 0.4 }).observe(screen);
} else {
  runDemo();
}

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

const pick = (name) => (form.querySelector(`input[name="${name}"]:checked`) || {}).value || "";

function validate() {
  let firstBad = null;
  const textChecks = [
    [form.elements.name, (v) => v.trim().length >= 2],
    [phone, (v) => v.replace(/\D/g, "").length >= 10],
  ];
  textChecks.forEach(([el, ok]) => {
    const good = ok(el.value);
    el.setAttribute("aria-invalid", good ? "false" : "true");
    if (!good && !firstBad) firstBad = el;
  });
  ["current_method"].forEach((group) => {
    const box = form.querySelector(`[data-group="${group}"]`);
    const good = pick(group) !== "";
    box.classList.toggle("is-invalid", !good);
    if (!good && !firstBad) firstBad = box.querySelector("input");
  });
  if (firstBad) {
    showMsg("Preencha nome, WhatsApp com DDD e escolha como você lembra seus clientes hoje.", "error");
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

// Ao escolher uma opção, tira o destaque de erro daquele grupo.
form.querySelectorAll(".choices input").forEach((input) => {
  input.addEventListener("change", () => input.closest(".choices").classList.remove("is-invalid"));
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const data = {
    name: form.elements.name.value.trim(),
    whatsapp: phone.value.replace(/\D/g, ""),
    current_method: pick("current_method"),
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
    submit.textContent = "Quero testar grátis";
  }
});
