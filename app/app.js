// Retornei — protótipo do app do cliente.
// Dados de exemplo de uma barbearia, só na memória (recarregar volta ao início).

const DAY = 864e5;
const today = new Date(); today.setHours(0, 0, 0, 0);
const daysAgo = (n) => new Date(today.getTime() - n * DAY);
const diffDays = (a, b) => Math.round((a - b) / DAY);
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
const first = (n) => n.trim().split(/\s+/)[0];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------- Estado ----------
const state = {
  business: "Barbearia do Zé",
  template: "Fala, {nome}! Já faz {dias} dias do seu último {servico}. Bora marcar? Tenho horário essa semana.",
  services: [
    { id: "corte", name: "Corte", cycle: 21, price: 45 },
    { id: "barba", name: "Barba", cycle: 15, price: 30 },
    { id: "combo", name: "Corte e barba", cycle: 21, price: 70 },
    { id: "sobr", name: "Sobrancelha", cycle: 30, price: 15 },
  ],
  clients: [],
  // Resultados do mês antes de abrir o protótipo (para a tela não começar zerada)
  month: { sent: 23, back: 14, money: 980 },
  weeks: [3, 5, 4, 6, 5], // clientes que voltaram por lembrete nas 5 semanas anteriores
  weekNow: 0,
};

let nextId = 1;
function addClient(name, phone, serviceId, ago, extra = {}) {
  const svc = svc_(serviceId);
  const c = { id: nextId++, name, phone, optOut: false, reminder: null,
    visits: [{ date: daysAgo(ago), service: serviceId, price: svc.price, fromReminder: false }], ...extra };
  state.clients.push(c);
  return c;
}
const svc_ = (id) => state.services.find((s) => s.id === id) || state.services[0];

addClient("Rafael Souza", "11912340001", "corte", 22);
addClient("Diego Lima", "11912340002", "barba", 17);
addClient("Marcos Paulo", "11912340003", "combo", 41);
addClient("Lucas Ferreira", "11912340004", "corte", 24);
addClient("João Vitor", "11912340005", "sobr", 33);
addClient("Gustavo Lima", "11912340006", "combo", 30);
addClient("Thiago Rocha", "11912340007", "barba", 13);
addClient("Pedro Henrique", "11912340008", "combo", 18);
addClient("Felipe Costa", "11912340009", "corte", 19);
addClient("Bruno Alves", "11912340010", "corte", 12);
addClient("André Santos", "11912340011", "corte", 5);
addClient("Caio Martins", "11912340012", "corte", 2);
addClient("Vinícius Gomes", "11912340013", "corte", 26, { reminder: { date: daysAgo(3), status: "sent" } });
addClient("Matheus Ribeiro", "11912340014", "barba", 1);

// ---------- Regras ----------
const last = (c) => c.visits[c.visits.length - 1];
const nextDate = (c) => new Date(last(c).date.getTime() + svc_(last(c).service).cycle * DAY);
const sinceLast = (c) => diffDays(today, last(c).date);

function classify(c) {
  if (c.optOut) return "optout";
  if (c.reminder && c.reminder.status === "sent" && c.reminder.date >= last(c).date) return "waiting";
  const d = diffDays(nextDate(c), today); // negativo = passou do prazo
  if (d <= 0) return d <= -7 ? "late" : "due";
  if (d <= 7) return "soon";
  return "ok";
}

function message(c) {
  return state.template
    .replaceAll("{nome}", first(c.name))
    .replaceAll("{dias}", sinceLast(c))
    .replaceAll("{servico}", svc_(last(c).service).name.toLowerCase());
}

// ---------- Interface ----------
const view = document.getElementById("view");
const sheet = document.getElementById("sheet");
const sheetTitle = document.getElementById("sheetTitle");
const sheetBody = document.getElementById("sheetBody");
const backdrop = document.getElementById("backdrop");
const toastEl = document.getElementById("toast");
const toastText = document.getElementById("toastText");
let tab = "hoje";
let lastFocus = null;

const dateLabel = today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
document.getElementById("todayLabel").textContent = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1).replace("-feira", "");

function toast(html, ms = 2600) {
  toastText.innerHTML = html;
  toastEl.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { toastEl.hidden = true; }, ms);
}

function openSheet(title, html, onReady) {
  lastFocus = document.activeElement;
  toastEl.hidden = true;
  sheetTitle.textContent = title;
  sheetBody.innerHTML = html;
  sheet.hidden = false;
  backdrop.hidden = false;
  if (onReady) onReady(sheetBody);
  const f = sheetBody.querySelector("[autofocus], input, button, textarea, select");
  if (f) f.focus();
}
function closeSheet() {
  sheet.hidden = true;
  backdrop.hidden = true;
  sheetBody.innerHTML = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
backdrop.addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

function row(c, right, extraClass = "") {
  return `<li class="row ${extraClass}">
    <span class="avatar" aria-hidden="true">${esc(initials(c.name))}</span>
    <div><p class="name">${esc(c.name)}</p><p class="meta">${right.meta}</p></div>
    ${right.action}
  </li>`;
}

// ---------- Tela: Hoje ----------
function renderHoje() {
  const due = state.clients.filter((c) => ["due", "late"].includes(classify(c)))
    .sort((a, b) => nextDate(a) - nextDate(b));
  const waiting = state.clients.filter((c) => classify(c) === "waiting");
  const soon = state.clients.filter((c) => classify(c) === "soon").sort((a, b) => nextDate(a) - nextDate(b));

  let html = `<h1>Hoje</h1><p class="sub"><strong>${due.length}</strong> ${due.length === 1 ? "cliente na hora de voltar" : "clientes na hora de voltar"}</p>`;

  if (due.length) {
    html += `<ul class="list" style="margin-top:14px">` + due.map((c) => {
      const late = classify(c) === "late";
      return row(c, {
        meta: `${esc(svc_(last(c).service).name)}, faz ${sinceLast(c)} dias${late ? ". Atrasado" : ""}`,
        action: `<button class="btn btn-go" type="button" data-remind="${c.id}" aria-label="Lembrar ${esc(c.name)}">Lembrar</button>`,
      }, late ? "is-late" : "");
    }).join("") + `</ul>`;
  } else {
    html += `<div class="empty" style="margin-top:14px"><img src="/marca/mascote-pisca.svg" alt="" width="64" height="64"><p><strong>Tudo em dia por hoje.</strong></p><p>Amanhã cedo aparece quem estiver na hora.</p></div>`;
  }

  if (waiting.length) {
    html += `<h2>Aguardando resposta</h2><ul class="list">` + waiting.map((c) => row(c, {
      meta: `Lembrete enviado há ${plural(diffDays(today, c.reminder.date), "dia", "dias")}`,
      action: `<button class="btn btn-soft" type="button" data-came="${c.id}">Voltou</button>`,
    }, "is-sent")).join("") + `</ul>`;
  }

  if (soon.length) {
    html += `<h2>Próximos 7 dias</h2><ul class="list">` + soon.map((c) => {
      const d = diffDays(nextDate(c), today);
      return row(c, {
        meta: `${esc(svc_(last(c).service).name)}, na hora de voltar em ${plural(d, "dia", "dias")}`,
        action: "",
      });
    }).join("") + `</ul>`;
  }
  view.innerHTML = html;
}

function openReminder(c) {
  openSheet(`Lembrar ${first(c.name)}`, `
    <p class="hint" style="margin-bottom:8px">Para ${esc(c.name)}, ${esc(formatPhone(c.phone))}</p>
    <div class="wa-bubble" id="msgText">${esc(message(c))}</div>
    <div class="actions">
      <button class="btn btn-go btn-block" type="button" id="sendNow">Enviar pelo WhatsApp</button>
      <button class="btn btn-ghost" type="button" id="editMsg">Mudar a mensagem padrão</button>
      <button class="btn btn-ghost" type="button" id="optOut" style="color:var(--muted)">Não lembrar mais este cliente</button>
    </div>
    <p class="hint" style="margin-top:10px">No app de verdade, este botão abre o seu WhatsApp com a mensagem já escrita. Você só toca em enviar.</p>`, (b) => {
    b.querySelector("#sendNow").addEventListener("click", () => {
      c.reminder = { date: new Date(today), status: "sent" };
      state.month.sent += 1;
      closeSheet();
      render();
      toast(`<span>Lembrete enviado para <strong>${esc(first(c.name))}</strong>. Quando ele vier, toque em Voltou.</span>`);
    });
    b.querySelector("#editMsg").addEventListener("click", () => { closeSheet(); go("ajustes"); });
    b.querySelector("#optOut").addEventListener("click", () => {
      c.optOut = true; closeSheet(); render();
      toast(`<span>${esc(first(c.name))} não vai mais aparecer nos lembretes.</span>`);
    });
  });
}

// ---------- Registrar atendimento ----------
function openVisit(preselectId = null) {
  const svcChips = state.services.map((s, i) => `<label class="chip"><input type="radio" name="svc" value="${s.id}" ${i === 0 ? "checked" : ""}><span>${esc(s.name)}</span></label>`).join("");
  openSheet("Registrar atendimento", `
    <label class="field"><span>Cliente</span><input class="search" id="pickSearch" type="search" placeholder="Buscar pelo nome" autocomplete="off"></label>
    <div class="pick-list" id="pickList" role="listbox" aria-label="Clientes"></div>
    <div class="field"><span>Serviço</span><div class="chips">${svcChips}</div></div>
    <label class="field"><span>Valor (R$)</span><input id="visitPrice" type="number" inputmode="numeric" min="0" step="5" value="${state.services[0].price}"></label>
    <button class="btn btn-go btn-block" type="button" id="saveVisit">Registrar atendimento</button>
    <p class="hint" id="visitErr" role="alert" style="margin-top:8px"></p>`, (b) => {
    let picked = preselectId;
    const list = b.querySelector("#pickList");
    const search = b.querySelector("#pickSearch");
    const price = b.querySelector("#visitPrice");
    const drawList = () => {
      const q = search.value.trim().toLowerCase();
      const items = state.clients.filter((c) => !q || c.name.toLowerCase().includes(q))
        .sort((a, b) => (b.id === picked) - (a.id === picked) || a.name.localeCompare(b.name));
      list.innerHTML = items.map((c) => `<button type="button" class="row as-button" role="option" aria-pressed="${c.id === picked}" aria-selected="${c.id === picked}" data-pick="${c.id}">
          <span class="avatar" aria-hidden="true">${esc(initials(c.name))}</span>
          <span><span class="name" style="display:block">${esc(c.name)}</span><span class="meta">${classify(c) === "waiting" ? "Recebeu lembrete" : "Último: " + esc(svc_(last(c).service).name)}</span></span>
        </button>`).join("") || `<p class="hint">Nenhum cliente com esse nome.</p>`;
    };
    const useLastService = (c) => {
      const svcInput = b.querySelector(`input[name=svc][value="${last(c).service}"]`);
      if (svcInput) { svcInput.checked = true; price.value = svc_(svcInput.value).price; }
    };
    if (picked) useLastService(state.clients.find((x) => x.id === picked));
    drawList();
    search.addEventListener("input", drawList);
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pick]"); if (!btn) return;
      picked = Number(btn.dataset.pick);
      useLastService(state.clients.find((x) => x.id === picked));
      drawList();
    });
    b.querySelectorAll("input[name=svc]").forEach((r) => r.addEventListener("change", () => { price.value = svc_(r.value).price; }));
    b.querySelector("#saveVisit").addEventListener("click", () => {
      if (!picked) { b.querySelector("#visitErr").textContent = "Escolha o cliente na lista para registrar."; search.focus(); return; }
      const c = state.clients.find((x) => x.id === picked);
      const sid = b.querySelector("input[name=svc]:checked").value;
      const value = Math.max(0, Number(price.value) || 0);
      const fromReminder = classify(c) === "waiting";
      c.visits.push({ date: new Date(today), service: sid, price: value, fromReminder });
      if (c.reminder) c.reminder.status = fromReminder ? "back" : c.reminder.status;
      closeSheet();
      if (fromReminder) {
        state.month.back += 1; state.month.money += value; state.weekNow += 1;
        toast(`<span><strong>${esc(first(c.name))}</strong> voltou! <strong>+${brl(value)}</strong> este mês pelos lembretes.</span>`, 3200);
      } else {
        toast(`<span>Atendimento registrado. ${esc(first(c.name))} entra na lista daqui a ${svc_(sid).cycle} dias.</span>`);
      }
      render();
    });
  });
}

// ---------- Tela: Clientes ----------
let clientQuery = "";
function renderClientes() {
  const q = clientQuery.trim().toLowerCase();
  const items = state.clients.filter((c) => !q || c.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  view.innerHTML = `<h1>Clientes</h1><p class="sub">${plural(state.clients.length, "cliente cadastrado", "clientes cadastrados")}</p>
    <div class="toolbar">
      <input class="search" id="clientSearch" type="search" placeholder="Buscar pelo nome" value="${esc(clientQuery)}" aria-label="Buscar cliente">
      <button class="btn btn-go" type="button" id="newClient">Novo</button>
    </div>
    <button class="btn btn-soft btn-block" type="button" id="importBtn" style="font-size:.95rem;padding:12px">Importar de uma planilha</button>
    <ul class="list" style="margin-top:12px">${items.map((c) => {
      const k = classify(c); const d = diffDays(nextDate(c), today);
      const when = k === "optout" ? "Sem lembretes" : k === "waiting" ? "Aguardando resposta" : d <= 0 ? "Na hora de voltar" : `Volta em ${plural(d, "dia", "dias")}`;
      return row(c, { meta: `${esc(svc_(last(c).service).name)} há ${plural(sinceLast(c), "dia", "dias")}. ${when}`, action: "" },
        k === "late" ? "is-late" : "");
    }).join("") || `<li class="empty">Nenhum cliente com esse nome.</li>`}</ul>`;
  const s = view.querySelector("#clientSearch");
  s.addEventListener("input", () => { clientQuery = s.value; const pos = s.selectionStart; renderClientes(); const n = view.querySelector("#clientSearch"); n.focus(); n.setSelectionRange(pos, pos); });
  view.querySelector("#newClient").addEventListener("click", openNewClient);
  view.querySelector("#importBtn").addEventListener("click", openImport);
}

function formatPhone(d) {
  d = String(d).replace(/\D/g, "");
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d;
}

function openNewClient() {
  const svcChips = state.services.map((s, i) => `<label class="chip"><input type="radio" name="nsvc" value="${s.id}" ${i === 0 ? "checked" : ""}><span>${esc(s.name)}</span></label>`).join("");
  const whenChips = [["0", "Hoje"], ["7", "Semana passada"], ["30", "Mês passado"]].map(([v, l], i) => `<label class="chip"><input type="radio" name="nwhen" value="${v}" ${i === 0 ? "checked" : ""}><span>${l}</span></label>`).join("");
  openSheet("Novo cliente", `
    <label class="field"><span>Nome</span><input id="nName" autocomplete="off" maxlength="60"></label>
    <label class="field"><span>WhatsApp com DDD</span><input id="nPhone" type="tel" inputmode="tel" placeholder="(11) 91234-5678" maxlength="16"></label>
    <div class="field"><span>Último serviço</span><div class="chips">${svcChips}</div></div>
    <div class="field"><span>Quando foi?</span><div class="chips">${whenChips}</div></div>
    <button class="btn btn-go btn-block" type="button" id="saveClient">Salvar cliente</button>
    <p class="hint" id="nErr" role="alert" style="margin-top:8px"></p>`, (b) => {
    b.querySelector("#saveClient").addEventListener("click", () => {
      const name = b.querySelector("#nName").value.trim();
      const phone = b.querySelector("#nPhone").value.replace(/\D/g, "");
      if (name.length < 2 || phone.length < 10) { b.querySelector("#nErr").textContent = "Preencha o nome e o WhatsApp com DDD."; return; }
      addClient(name, phone, b.querySelector("input[name=nsvc]:checked").value, Number(b.querySelector("input[name=nwhen]:checked").value));
      closeSheet(); render();
      toast(`<span><strong>${esc(first(name))}</strong> cadastrado. O Retornei avisa quando for a hora de lembrar.</span>`);
    });
  });
}

function openImport() {
  openSheet("Importar de uma planilha", `
    <p style="margin-bottom:10px">Salve sua planilha como <strong>CSV</strong> com duas colunas: <strong>nome</strong> e <strong>WhatsApp</strong>. Uma linha por cliente.</p>
    <label class="field"><span>Arquivo CSV</span><input id="csvFile" type="file" accept=".csv,text/csv"></label>
    <button class="btn btn-soft btn-block" type="button" id="useSample">Usar uma planilha de exemplo</button>
    <p class="hint" id="impMsg" role="status" style="margin-top:8px"></p>`, (b) => {
    const done = (rows) => {
      let n = 0;
      rows.forEach(([name, phone]) => {
        const p = String(phone || "").replace(/\D/g, "");
        if (name && name.trim().length > 1 && p.length >= 10) { addClient(name.trim(), p, "corte", 10 + (n * 7) % 30); n++; }
      });
      if (!n) { b.querySelector("#impMsg").textContent = "Não encontrei linhas com nome e WhatsApp. Confira se são duas colunas."; return; }
      closeSheet(); render();
      toast(`<span><strong>${plural(n, "cliente importado", "clientes importados")}</strong>. Ajuste o último serviço de cada um quando atender.</span>`);
    };
    b.querySelector("#useSample").addEventListener("click", () => done([["Ricardo Nunes", "11998760001"], ["Samuel Prado", "11998760002"], ["Renan Duarte", "11998760003"], ["Igor Teixeira", "11998760004"], ["Otávio Mello", "11998760005"]]));
    b.querySelector("#csvFile").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => done(String(r.result).split(/\r?\n/).map((l) => l.split(/[;,]/)).filter((x) => x.length >= 2 && !/nome/i.test(x[0])));
      r.readAsText(f);
    });
  });
}

// ---------- Tela: Resultados ----------
function renderResultados() {
  const m = state.month;
  const rate = m.sent ? Math.round((m.back / m.sent) * 100) : 0;
  const active = state.clients.filter((c) => !c.optOut).length;
  const weeks = [...state.weeks, state.weekNow + 2];
  const max = Math.max(...weeks, 1);
  const labels = ["5 sem.", "4 sem.", "3 sem.", "2 sem.", "1 sem.", "Esta"];
  view.innerHTML = `<h1>Resultados</h1><p class="sub">Este mês, por causa dos lembretes</p>
    <div class="kpis">
      <div class="kpi money"><img src="/marca/mascote-comemora.svg" alt="" width="58" height="58">
        <div><p class="label">Dinheiro que voltou</p><p class="value">${brl(m.money)}</p></div></div>
      <div class="kpi"><p class="label">Clientes que voltaram</p><p class="value">${m.back}</p></div>
      <div class="kpi"><p class="label">Lembretes enviados</p><p class="value">${m.sent}</p></div>
      <div class="kpi"><p class="label">Taxa de retorno</p><p class="value">${rate}%</p></div>
      <div class="kpi"><p class="label">Clientes ativos</p><p class="value">${active}</p></div>
    </div>
    <h2>Clientes que voltaram por semana</h2>
    <div class="bars" role="img" aria-label="Clientes que voltaram por semana: ${weeks.join(", ")}">
      ${weeks.map((v, i) => `<div class="bar ${i === weeks.length - 1 ? "now" : ""}"><b>${v}</b><i style="height:${Math.round((v / max) * 90)}px"></i><small>${labels[i]}</small></div>`).join("")}
    </div>
    <p class="hint" style="margin-top:10px">Conta como "voltou" quem recebeu um lembrete e teve atendimento registrado depois dele.</p>`;
}

// ---------- Tela: Ajustes ----------
function renderAjustes() {
  view.innerHTML = `<h1>Ajustes</h1>
    <label class="field" style="margin-top:14px"><span>Nome do negócio</span><input id="bizInput" value="${esc(state.business)}" maxlength="40"></label>
    <h2>Mensagem padrão</h2>
    <label class="field"><span class="hint" style="font-weight:400">Use {nome}, {dias} e {servico}. Cada cliente recebe com os dados dele.</span>
      <textarea id="tplInput" maxlength="400">${esc(state.template)}</textarea></label>
    <p class="hint">Exemplo para ${esc(state.clients[0].name)}:</p>
    <div class="preview-msg" id="tplPreview">${esc(message(state.clients[0]))}</div>
    <h2>Serviços e prazo de retorno</h2>
    <div class="list" id="svcList">${state.services.map((s) => `<div class="svc">
      <span class="svc-name">${esc(s.name)}</span>
      <label>Volta em (dias)<input type="number" min="1" max="365" value="${s.cycle}" data-svc="${s.id}" data-k="cycle"></label>
      <label>Valor (R$)<input type="number" min="0" step="5" value="${s.price}" data-svc="${s.id}" data-k="price"></label>
    </div>`).join("")}</div>
    <p class="hint" style="margin-top:10px">O prazo diz quando o cliente aparece na lista Hoje. Se ele costuma voltar a cada 3 semanas, use 21 dias.</p>
    <h2>Seus dados</h2>
    <p class="hint">Os clientes cadastrados são seus. Só você vê, e dá para exportar ou apagar tudo quando quiser.</p>`;
  view.querySelector("#bizInput").addEventListener("input", (e) => { state.business = e.target.value || "Seu negócio"; document.getElementById("bizName").textContent = state.business; });
  view.querySelector("#tplInput").addEventListener("input", (e) => { state.template = e.target.value; view.querySelector("#tplPreview").textContent = message(state.clients[0]); });
  view.querySelectorAll("#svcList input").forEach((inp) => inp.addEventListener("input", () => {
    const s = svc_(inp.dataset.svc); const v = Number(inp.value); if (v >= (inp.dataset.k === "cycle" ? 1 : 0)) s[inp.dataset.k] = v;
  }));
}

// ---------- Navegação ----------
const renderers = { hoje: renderHoje, clientes: renderClientes, resultados: renderResultados, ajustes: renderAjustes };
function render() { renderers[tab](); }
function go(t) {
  tab = t;
  document.querySelectorAll(".tab[data-tab]").forEach((b) => {
    const on = b.dataset.tab === t;
    b.classList.toggle("is-active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  render();
  view.scrollTop = 0; window.scrollTo(0, 0);
}
document.querySelectorAll(".tab[data-tab]").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));
document.querySelector('[data-action="novo-atendimento"]').addEventListener("click", () => openVisit());

view.addEventListener("click", (e) => {
  const r = e.target.closest("[data-remind]");
  if (r) return openReminder(state.clients.find((c) => c.id === Number(r.dataset.remind)));
  const v = e.target.closest("[data-came]");
  if (v) return openVisit(Number(v.dataset.came));
});

go("hoje");
