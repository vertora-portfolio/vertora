import './style.css';
import data from './content.json';
import { icon } from './icons.js';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters = data.chapters;
const socio = (id) => data.socios.find((s) => s.id === id);
const nf = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const brl = (n, d = 0) => 'R$ ' + nf(n, d);

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/** **negrito**, *itálico* e [[referência]] (vira chip com explicação). */
function fmt(s = '') {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[\[(.+?)\]\]/g, (_, r) => `<button type="button" class="ref" data-ref="${r}">${r}</button>`);
}
const refKeys = Object.keys(data.refs).sort((a, b) => b.length - a.length);
function refText(r) {
  if (data.refs[r]) return data.refs[r];
  const k = refKeys.find((key) => r.startsWith(key));
  return k ? data.refs[k] : 'Referência citada no portfólio.';
}
const ownersText = (ids) => ids.map((id) => { const s = socio(id); return `${s.curto} · ${s.funcao}`; }).join('  —  ');
const siteUrl = () => data.site.url + (location.hash && location.hash !== '#60s' ? location.hash : '');

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch { toast('Não foi possível copiar. Copie manualmente: ' + text); }
}

/* ---------- ações globais ---------- */
async function share() {
  const url = siteUrl();
  if (navigator.share) {
    try { await navigator.share({ title: data.site.shareTitle, text: data.site.shareText, url }); } catch { /* cancelado */ }
  } else {
    copyText(url, 'Link copiado');
  }
}
function openDialog(d) { if (!d.open) d.showModal(); }
function closeDialog(d) { if (d.open) d.close(); }

/* ---------- blocos ---------- */
const B = {};
B.heading = (b) => `<h2 class="sec-label" data-reveal><span>${esc(b.text)}</span></h2>`;
B.text = (b) => `<p class="lead" data-reveal>${fmt(b.text)}</p>`;
B.quote = (b) => `<blockquote class="quote" data-reveal><p>${fmt(b.text)}</p></blockquote>`;
B.callout = (b) => `<aside class="callout" data-reveal>${icon(b.icon || 'Info')}<div>${b.title ? `<h3>${esc(b.title)}</h3>` : ''}<p>${fmt(b.text)}</p></div></aside>`;
B.chips = (b) => `<ul class="chips" data-reveal>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

B.cards = (b) => `<ul class="cards ${b.compact ? 'cards--compact' : ''} cards--${b.style}">${b.items.map((it, i) => `
  <li class="card" data-reveal>
    ${b.style === 'numbered' ? `<span class="card-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>` : ''}
    <span class="card-ic">${icon(it.icon)}</span>
    <h3>${esc(it.title)}</h3><p>${fmt(it.text)}</p>
  </li>`).join('')}</ul>`;

B.list = (b) => `${b.intro ? `<p class="lead" data-reveal>${fmt(b.intro)}</p>` : ''}<ul class="list list--${b.style}" data-reveal>${b.items.map((i) => `<li>${b.style === 'check' ? icon('Check') : '<span class="dot" aria-hidden="true"></span>'}<span>${fmt(i)}</span></li>`).join('')}</ul>`;

B.legal = (b) => `<details class="legal" data-reveal><summary>${icon('Scale')}<span>${esc(b.title || 'Ver base legal')}</span>${icon('ChevronRight', 'chev')}</summary><div class="legal-body">${b.items.map((i) => `<p>${fmt(i)}</p>`).join('')}</div></details>`;

B.timeline = (b) => `<div class="timeline" data-timeline data-reveal>
  <p class="hint">${esc(b.hint || '')}</p>
  <ol class="tl-track" role="list">${b.items.map((it, i) => `<li><button type="button" class="tl-node" aria-pressed="${i === 0}" data-i="${i}" aria-label="Etapa ${i + 1}: ${esc(it.title)}">${String(i + 1).padStart(2, '0')}</button></li>`).join('')}</ol>
  <div class="tl-fill" aria-hidden="true"><span></span></div>
  <div class="tl-panel" aria-live="polite"></div>
  <script type="application/json">${JSON.stringify(b.items).replace(/</g, '\\u003c')}</script>
</div>`;

B.carousel = (b) => `<div class="carousel" data-carousel data-reveal>
  <ul class="car-track" tabindex="0" aria-label="Serviços — deslize para o lado">${b.items.map((it, i) => `
    <li class="car-card" aria-label="${i + 1} de ${b.items.length}">
      <span class="car-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="card-ic">${icon(it.icon)}</span>
      <h3>${esc(it.title)}</h3><p>${fmt(it.text)}</p>
    </li>`).join('')}</ul>
  <div class="car-ctrl">
    <button type="button" class="icon-btn car-prev" aria-label="Serviço anterior">${icon('ChevronLeft')}</button>
    <div class="car-dots">${b.items.map((it, i) => `<button type="button" class="car-dot" aria-label="Ir para ${esc(it.title)}" aria-current="${i === 0}" data-i="${i}"></button>`).join('')}</div>
    <button type="button" class="icon-btn car-next" aria-label="Próximo serviço">${icon('ChevronRight')}</button>
  </div>
</div>`;

B.plans = (b) => `<div class="plans" data-plans data-reveal>
  <div class="plan-tabs" role="tablist" aria-label="Planos">${b.plans.map((p, i) => `
    <button type="button" role="tab" id="tab-${p.id}" aria-controls="panel-${p.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="plan-tab ${p.featured ? 'is-featured' : ''}">
      <span class="pt-name">${esc(p.name)}</span><span class="pt-aud">${esc(p.audience)}</span>
    </button>`).join('')}</div>
  ${b.plans.map((p, i) => `
  <section role="tabpanel" id="panel-${p.id}" aria-labelledby="tab-${p.id}" class="plan-panel ${p.featured ? 'plan-panel--featured' : ''}" ${i === 0 ? '' : 'hidden'}>
    ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
    <p class="kicker">${esc(p.audience)}</p>
    <h3>${esc(p.name)}</h3>
    <p class="plan-tag">${esc(p.tagline)}</p>
    <ul class="list list--check">${p.items.map((x) => `<li>${icon('Check')}<span>${fmt(x)}</span></li>`).join('')}</ul>
  </section>`).join('')}
</div>`;

function countAttrs(it) {
  if (it.countTo === undefined) return '';
  return `data-count="${it.countTo}" data-dec="${it.decimals || 0}" data-prefix="${esc(it.prefix || '')}" data-suffix="${esc(it.suffix || '')}"`;
}
function finalValue(it) {
  if (it.countTo === undefined) return esc(it.value);
  return esc((it.prefix || '') + nf(it.countTo, it.decimals || 0) + (it.suffix || ''));
}
B.kpis = (b) => `<ul class="kpis">${b.items.map((it) => `
  <li class="kpi" data-reveal><span class="kpi-v ${it.small ? 'kpi-v--sm' : ''}" ${countAttrs(it)}>${finalValue(it)}</span><span class="kpi-l">${fmt(it.label)}</span></li>`).join('')}</ul>`;

B.clauses = (b) => `<ol class="clauses" data-reveal>${b.items.map((c) => `<li><span class="cl-label">${esc(c.label)})</span><p>${fmt(c.text)}</p></li>`).join('')}</ol>`;

B.flip = (b) => `<p class="hint" data-reveal>${esc(b.hint)}</p><ul class="flips">${b.items.map((it) => `
  <li data-reveal><button type="button" class="flip" aria-pressed="false">
    <span class="flip-inner">
      <span class="flip-face flip-front"><span class="kicker">Quem faz?</span><span class="flip-act">${esc(it.activity)}</span><span class="flip-cue">${icon('RotateCcw')} Ver resposta</span></span>
      <span class="flip-face flip-back" aria-hidden="true"><span class="kicker">Quem executa</span><span class="flip-who">${esc(it.who)}</span><span class="flip-basis">${icon('Scale')} ${esc(it.basis)}</span></span>
    </span>
  </button></li>`).join('')}</ul>`;

B.facts = (b) => `<dl class="facts" data-reveal>${b.items.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${fmt(f.text)}</dd></div>`).join('')}</dl>`;

/* --- rosca dos sócios --- */
B.donut = (b) => {
  const n = data.socios.length, R = 100, r = 62, cx = 120, cy = 120;
  const pt = (rad, a) => [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
  const tones = ['var(--gold)', 'var(--gold-deep)', 'var(--gold-light)'];
  const slices = data.socios.map((s, i) => {
    const a0 = (i / n) * 2 * Math.PI + 0.012, a1 = ((i + 1) / n) * 2 * Math.PI - 0.012;
    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0);
    const am = (a0 + a1) / 2, [lx, ly] = pt((R + r) / 2, am);
    const d = `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${r},${r} 0 0 0 ${x3.toFixed(2)},${y3.toFixed(2)}Z`;
    return `<g class="slice" data-id="${s.id}" role="button" tabindex="0" aria-label="${esc(s.nome)}, ${esc(s.funcao)}, 100.000 quotas, 11,11%" style="--dx:${(Math.sin(am) * 7).toFixed(2)}px;--dy:${(-Math.cos(am) * 7).toFixed(2)}px">
      <path d="${d}" fill="${tones[i % 3]}"/><text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle">${s.iniciais}</text></g>`;
  }).join('');
  return `<div class="donut" data-donut data-reveal>
    <p class="hint">${esc(b.hint)}</p>
    <div class="donut-wrap">
      <svg viewBox="0 0 240 240" class="donut-svg" aria-label="Gráfico de rosca: 9 fatias iguais de 11,11%">${slices}
        <text x="120" y="114" text-anchor="middle" class="d-big">9</text><text x="120" y="136" text-anchor="middle" class="d-small">sócios · 900.000 quotas</text></svg>
    </div>
    <div class="donut-info" aria-live="polite"><p class="muted">Cada fatia é um sócio: <strong>100.000 quotas · 11,11%</strong>.</p></div>
    <ul class="donut-legend">${data.socios.map((s) => `<li><button type="button" data-id="${s.id}" aria-pressed="false"><span class="av">${s.iniciais}</span>${esc(s.curto)}</button></li>`).join('')}</ul>
  </div>`;
};

/* --- organograma --- */
B.org = (b) => {
  const person = (id, area) => { const s = socio(id); return `<button type="button" class="org-p" data-person="${id}"><span class="org-area">${esc(area || s.funcao)}</span><span class="org-name">${esc(s.curto)}</span>${icon('ChevronRight', 'chev')}</button>`; };
  const dirs = [['ra', 'Jurídico'], ['ph', 'Governança e Compliance'], ['iso', 'ESG e Sustentabilidade'], ['ns', 'Financeiro'], ['jis', 'Marketing e Identidade'], ['ea', 'Relações Institucionais'], ['lm', 'Portfólio Digital']];
  return `<div class="org" data-reveal>
    <p class="hint">${esc(b.hint)}</p>
    <div class="org-top"><span class="kicker">Reunião de Sócios</span><span>9 sócios · instância máxima</span></div>
    <div class="org-line" aria-hidden="true"></div>
    <div class="org-mid">${person('pp', 'Sócio-Administrador')}${person('as', 'Secretaria')}</div>
    <div class="org-line" aria-hidden="true"></div>
    <p class="org-cap">7 diretorias · funções internas, sem poder de representação</p>
    <div class="org-dirs">${dirs.map(([id, a]) => person(id, a)).join('')}</div>
  </div>`;
};

/* --- quóruns --- */
const dots = (k, n = 9) => `<span class="qdots" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < k ? 'on' : ''}"></i>`).join('')}</span>`;
B.quorumTable = () => `<ul class="qcards">${data.quorum.levels.map((l) => `
  <li class="qcard" data-reveal><div class="qc-head"><h3>${esc(l.name)} <small>${esc(l.pct)}</small></h3><span class="qc-need"><strong>${l.needed}</strong> de 9</span></div>
  ${dots(l.needed)}<p>${esc(l.matters)}</p></li>`).join('')}</ul>`;

B.quorumSim = () => `<div class="qsim" data-qsim data-reveal>
  <label class="field-label" for="qsim-matter">1. Escolha a matéria</label>
  <select id="qsim-matter" class="select">${data.quorum.matters.map((m, i) => `<option value="${i}">${esc(m.label)}</option>`).join('')}</select>
  <p class="qsim-need"></p>
  <p class="field-label" id="qsim-vote-l">2. Toque nos sócios para votar</p>
  <ul class="qsim-voters" aria-labelledby="qsim-vote-l">${data.socios.map((s) => `<li><button type="button" class="voter" data-id="${s.id}" aria-pressed="false"><span class="av">${s.iniciais}</span><span class="v-name">${esc(s.curto)}</span><span class="v-vote">Não</span></button></li>`).join('')}</ul>
  <div class="qsim-tools"><button type="button" class="btn btn--ghost btn--sm" data-all="1">Todos votam sim</button><button type="button" class="btn btn--ghost btn--sm" data-all="0">Limpar votos</button></div>
  <div class="qbar" aria-hidden="true"><span class="qbar-fill"></span><span class="qbar-mark"></span></div>
  <p class="qsim-count"></p>
  <div class="qsim-result" aria-live="polite"></div>
</div>`;

B.accordion = (b) => `<div class="acc">${b.items.map((it) => `
  <details class="acc-item" data-reveal><summary><span><span class="acc-t">${esc(it.title)}</span>${it.subtitle ? `<span class="acc-s">${esc(it.subtitle)}</span>` : ''}</span>${icon('ChevronRight', 'chev')}</summary>
  <div class="acc-body">${it.intro ? `<p class="acc-intro">${fmt(it.intro)}</p>` : ''}
  ${it.numbered ? `<ol class="acc-ol">${it.lines.map((l, i) => `<li><span class="acc-n">${i + 1}ª</span><span>${fmt(l)}</span></li>`).join('')}</ol>` : `<ul class="acc-ul">${it.lines.map((l) => `<li>${fmt(l)}</li>`).join('')}</ul>`}
  </div></details>`).join('')}</div>`;

B.steps = (b) => `<ol class="steps">${b.items.map((s, i) => `<li data-reveal><span class="st-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(s.title)}</h3><p>${fmt(s.text)}</p></div></li>`).join('')}</ol>`;

B.risks = (b) => `<ul class="risks">${b.items.map((r) => {
  const hi = r.level === 'Alto';
  return `<li class="risk ${hi ? 'risk--hi' : 'risk--md'}" data-reveal><span class="risk-lvl">${icon(hi ? 'TriangleAlert' : 'CircleDot')}Risco ${esc(r.level.toLowerCase())}</span><h3>${esc(r.risk)}</h3><p><strong>Resposta:</strong> ${fmt(r.response)}</p></li>`;
}).join('')}</ul>`;

B.indicators = (b) => {
  const st = (s) => s === 'Adotado' ? ['ok', 'CircleCheck'] : s === 'Monitorado' ? ['mon', 'Eye'] : ['plan', 'Clock'];
  return `<ul class="inds">${b.items.map((it) => { const [c, ic] = st(it.status); return `<li class="ind" data-reveal><span class="ind-name">${esc(it.name)}</span><span class="ind-goal">Meta: <strong>${esc(it.goal)}</strong></span><span class="status status--${c}">${icon(ic)}${esc(it.status)}</span></li>`; }).join('')}</ul><p class="note" data-reveal>${esc(b.legend)}</p>`;
};

B.ods = (b) => `<ul class="ods">${b.items.map((o) => `<li data-reveal><span class="ods-n">${esc(o.n)}</span><span>${esc(o.name)}</span></li>`).join('')}</ul>`;

B.pillars = (b) => `<ul class="pillars">${b.items.map((p) => `<li class="pillar" data-reveal><span class="card-ic">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><ul>${p.items.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul></li>`).join('')}</ul>`;

B.stackbar = (b) => {
  const total = b.parts.reduce((a, p) => a + p.value, 0);
  return `<div class="stack" data-reveal>
    <div class="stack-bar" role="img" aria-label="${b.parts.map((p) => `${p.label}: ${p.display}`).join('; ')}">${b.parts.map((p, i) => `<span class="sb sb-${i}" style="--w:${(p.value / total) * 100}%"></span>`).join('')}</div>
    <ul class="stack-legend">${b.parts.map((p, i) => `<li><span class="sw sw-${i}" aria-hidden="true"></span><span><strong>${esc(p.display)}</strong> · ${esc(p.label)} (${nf((p.value / total) * 100, 1)}%)</span></li>`).join('')}</ul>
    <p class="note">${fmt(b.note)}</p></div>`;
};

B.bars = (b) => `<ul class="bars">${b.items.map((it) => {
  const pct = (it.value / b.total) * 100;
  return `<li data-reveal><div class="bar-top"><span>${esc(it.label)}</span><span class="bar-v">${brl(it.value)} <small>${nf(pct, 1)}%</small></span></div><span class="bar" aria-hidden="true"><span style="--w:${pct}%"></span></span></li>`;
}).join('')}<li class="bars-total" data-reveal><span>Total</span><strong>${brl(b.items.reduce((a, i) => a + i.value, 0))}</strong></li></ul>`;

B.table = (b) => `<div class="table-wrap" data-reveal><table class="table"><thead><tr>${b.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
  ${b.foot ? `<tfoot><tr>${b.foot.map((c, i) => i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}${b.footSub && i === b.foot.length - 1 ? `<small class="td-sub">${esc(b.footSub)}</small>` : ''}</td>`).join('')}</tr></tfoot>` : ''}</table></div>`;

B.simulator = () => {
  if (!data.site.showSimulator) return '';
  const s = data.simulator;
  return `<h2 class="sec-label" data-reveal><span>Simulador “E se?”</span></h2>
  <div class="sim" data-sim data-reveal>
    <label class="field-label" for="sim-n">Número de clientes: <strong class="sim-n">${s.start}</strong></label>
    <input id="sim-n" type="range" min="${s.min}" max="${s.max}" value="${s.start}" step="1">
    <dl class="sim-out"><div><dt>Receita mensal</dt><dd class="sim-rev"></dd></div><div><dt>Despesas</dt><dd>${brl(s.expenses)}</dd></div><div><dt>Resultado antes de tributos</dt><dd class="sim-res"></dd></div></dl>
    <p class="note note--warn">${icon('Info')} ${esc(s.warning)}</p>
  </div>`;
};

B.palette = (b) => `<ul class="palette">${b.items.map((c) => `<li data-reveal><button type="button" class="swatch" data-hex="${c.hex}" aria-label="Copiar ${esc(c.name)} ${c.hex}"><span class="sw-chip" style="background:${c.hex}"></span><span class="sw-name">${esc(c.name)}</span><span class="sw-hex">${c.hex} ${icon('Copy')}</span></button></li>`).join('')}</ul>`;

B.brand = (b) => `<div class="brand-card" data-reveal>
  <picture><source type="image/webp" srcset="assets/vertora-logo-1x.webp 1x, assets/vertora-logo-2x.webp 2x"><img src="assets/vertora-logo-1x.png" srcset="assets/vertora-logo-2x.png 2x" width="240" height="152" alt="Logo da Vértora: monograma em V dourado, nome VÉRTORA e a assinatura Estratégia, Gestão, Valor" loading="lazy" decoding="async"></picture>
  <p class="brand-slogan">${esc(b.slogan)}</p><p>${fmt(b.text)}</p></div>`;

B.network = (b) => {
  const n = b.items.length;
  const nodes = b.items.map((it, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return `<button type="button" class="net-node" data-i="${i}" aria-pressed="${i === 0}" style="--x:${(50 + 38 * Math.cos(a)).toFixed(2)}%;--y:${(50 + 38 * Math.sin(a)).toFixed(2)}%"><span class="net-ic">${icon(it.icon)}</span><span class="net-l">${esc(it.title)}</span></button>`;
  }).join('');
  const lines = b.items.map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `<line x1="50" y1="50" x2="${(50 + 38 * Math.cos(a)).toFixed(2)}" y2="${(50 + 38 * Math.sin(a)).toFixed(2)}"/>`; }).join('');
  return `<div class="net" data-net data-reveal><p class="hint">${esc(b.hint)}</p>
    <div class="net-stage"><svg viewBox="0 0 100 100" aria-hidden="true" class="net-lines">${lines}<circle cx="50" cy="50" r="38"/></svg>
      <div class="net-center"><img src="assets/vertora-v-2x.png" alt="" width="40" height="28"><span>Vértora</span></div>${nodes}</div>
    <div class="net-panel" aria-live="polite"></div>
    <script type="application/json">${JSON.stringify(b.items).replace(/</g, '\\u003c')}</script></div>`;
};

B.reasons = (b) => `<ol class="reasons">${b.items.map((r, i) => `<li data-reveal><span class="rs-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(r.title)}</h3><p>${fmt(r.text)}</p></li>`).join('')}</ol>`;

const actionsHtml = () => `<div class="actions" data-reveal>
  <button type="button" class="btn btn--gold" data-action="share">${icon('Share2')}Compartilhar</button>
  <button type="button" class="btn btn--navy" data-action="qr">${icon('QrCode')}Mostrar QR Code</button>
  <a class="btn btn--ghost" href="${data.site.pdf}" download>${icon('Download')}Baixar portfólio em PDF</a></div>`;
B.actions = actionsHtml;

B.references = (b) => `<div class="acc refs">${b.groups.map((g) => `<details class="acc-item" data-reveal><summary><span><span class="acc-t">${esc(g.title)}</span><span class="acc-s">${g.items.length} ${g.items.length === 1 ? 'item' : 'itens'}</span></span>${icon('ChevronRight', 'chev')}</summary><div class="acc-body"><ul class="acc-ul">${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div></details>`).join('')}</div>`;

const renderBlocks = (blocks) => blocks.map((b) => (B[b.type] ? B[b.type](b) : '')).join('');

/* ---------- vistas ---------- */
const logoPicture = (w = 240, eager = true) => `<picture><source type="image/webp" srcset="assets/vertora-logo-1x.webp 1x, assets/vertora-logo-2x.webp 2x"><img src="assets/vertora-logo-1x.png" srcset="assets/vertora-logo-2x.png 2x" width="${w}" height="${Math.round(w * 499 / 788)}" alt="Vértora — Estratégia, Gestão, Valor" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;

const footerHtml = () => `<footer class="site-foot">
  <img src="assets/vertora-v-1x.png" srcset="assets/vertora-v-2x.png 2x" width="40" height="28" alt="" loading="lazy">
  <p class="seal">${esc(data.site.seal)}</p>
  <p>${esc(data.site.footer)}</p></footer>`;

function renderHome() {
  const h = data.home;
  return `<section class="hero">
    <div class="hero-in">
      <h1 class="sr-only">Vértora — Gestão Patrimonial e Empresarial</h1>
      <div class="hero-logo">${logoPicture(260)}</div>
      <p class="kicker kicker--light">${esc(h.kicker)}</p>
      <p class="hero-title">${fmt(h.title)}</p>
      <p class="hero-sub">${esc(h.subtitle)}</p>
      <div class="hero-cta">
        <a class="btn btn--gold" href="#60s">${icon('Play')}${esc(h.cta60)}</a>
        <a class="btn btn--outline-light" href="#${chapters[0].id}">${esc(h.ctaExplore)}${icon('ArrowRight')}</a>
      </div>
      <ul class="hero-stats">${h.stats.map((s) => `<li data-reveal><span class="hs-v" ${countAttrs(s)}>${finalValue(s)}</span><span class="hs-l">${esc(s.label)}</span></li>`).join('')}</ul>
      <p class="hero-seal">${esc(data.site.seal)}</p>
    </div>
  </section>
  <section class="home-index">
    <h2 class="sec-label"><span>Como ler este portfólio</span></h2>
    <p class="lead">${esc(h.howTo)}</p>
    <ol class="toc">${tocItems()}</ol>
    ${actionsHtml()}
  </section>${footerHtml()}`;
}

const tocItems = (current) => chapters.map((c) => `<li><a href="#${c.id}" class="toc-a" ${current === c.id ? 'aria-current="page"' : ''}>
  <span class="toc-n">${c.num}</span><span class="toc-t"><span class="toc-title">${esc(c.nav)}</span><span class="toc-o">${esc(c.owners.map((id) => socio(id).curto).join(' e '))}</span></span>${icon('ChevronRight', 'chev')}</a></li>`).join('');

function renderChapter(c, idx) {
  const next = chapters[idx + 1], prev = chapters[idx - 1];
  const nextHtml = next
    ? `<a class="next-card" href="#${next.id}"><span class="kicker">Próximo · ${next.num}</span><span class="nc-title">${esc(next.nav)}</span>${icon('ArrowRight')}</a>`
    : `<a class="next-card" href="#60s"><span class="kicker">Para rever</span><span class="nc-title">Vértora em 60 segundos</span>${icon('Play')}</a>`;
  return `<article class="chapter" aria-labelledby="ch-title">
    <header class="ch-cover">
      <span class="ch-num" aria-hidden="true">${c.num}</span>
      <p class="kicker kicker--light">Capítulo ${c.num} · ${esc(c.nav)}</p>
      <h1 id="ch-title" class="ch-title">${fmt(c.title)}</h1>
      <p class="ch-summary">${fmt(c.summary)}</p>
      <div class="ch-hl"><span class="ch-hl-v">${esc(c.highlight.value)}</span><span class="ch-hl-l">${esc(c.highlight.label)}</span></div>
      <p class="ch-owner"><span class="kicker kicker--light">Responsável</span> ${esc(ownersText(c.owners))}</p>
    </header>
    <div class="ch-body">${renderBlocks(c.blocks)}</div>
    <nav class="ch-nav" aria-label="Navegação entre capítulos">${nextHtml}
      ${prev ? `<a class="prev-link" href="#${prev.id}">${icon('ChevronLeft')}Anterior: ${esc(prev.nav)}</a>` : `<a class="prev-link" href="#inicio">${icon('ChevronLeft')}Início</a>`}
    </nav>
  </article>${footerHtml()}`;
}

/* ---------- comportamento dos blocos ---------- */
function animateCount(el) {
  const to = parseFloat(el.dataset.count), dec = +el.dataset.dec, pre = el.dataset.prefix, suf = el.dataset.suffix;
  const set = (v) => { el.textContent = pre + nf(v, dec) + suf; };
  if (reduceMotion) return set(to);
  const t0 = performance.now(), dur = 650;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur); set(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  set(0); requestAnimationFrame(step);
}

let io;
function setupReveal(root) {
  if (io) io.disconnect();
  const els = $$('[data-reveal]', root);
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  document.documentElement.classList.add('js-reveal');
  io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(animateCount);
      if (en.target.matches('[data-count]')) animateCount(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

function setupTimeline(el) {
  const items = JSON.parse($('script', el).textContent);
  const nodes = $$('.tl-node', el), panel = $('.tl-panel', el), fill = $('.tl-fill span', el);
  const show = (i) => {
    nodes.forEach((n, k) => { n.setAttribute('aria-pressed', k === i); n.classList.toggle('done', k <= i); });
    fill.style.setProperty('--p', `${(i / (items.length - 1)) * 100}%`);
    panel.innerHTML = `<span class="kicker">Etapa ${String(i + 1).padStart(2, '0')}</span><h3>${esc(items[i].title)}</h3><p>${fmt(items[i].text)}</p>`;
  };
  nodes.forEach((n, i) => n.addEventListener('click', () => show(i)));
  show(0);
}

function setupCarousel(el) {
  const track = $('.car-track', el), cards = $$('.car-card', el), dots = $$('.car-dot', el);
  let cur = 0;
  const go = (i) => { i = Math.max(0, Math.min(cards.length - 1, i)); track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' }); };
  dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.i)));
  $('.car-prev', el).addEventListener('click', () => go(cur - 1));
  $('.car-next', el).addEventListener('click', () => go(cur + 1));
  const obs = new IntersectionObserver((ens) => {
    ens.forEach((en) => {
      if (en.isIntersecting && en.intersectionRatio > 0.6) {
        cur = cards.indexOf(en.target);
        dots.forEach((d, k) => d.setAttribute('aria-current', k === cur));
      }
    });
  }, { root: track, threshold: [0.6] });
  cards.forEach((c) => obs.observe(c));
}

function setupPlans(el) {
  const tabs = $$('[role=tab]', el);
  const select = (t, focus) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
}

function setupFlip(btn) {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    $('.flip-front', btn).setAttribute('aria-hidden', on);
    $('.flip-back', btn).setAttribute('aria-hidden', !on);
  });
}

function setupDonut(el) {
  const info = $('.donut-info', el);
  const select = (id) => {
    const s = socio(id);
    $$('.slice', el).forEach((g) => g.classList.toggle('on', g.dataset.id === id));
    $$('.donut-legend button', el).forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === id));
    info.innerHTML = `<p class="di-name">${esc(s.nome)}</p><p class="di-role">${esc(s.funcao)}</p><p class="di-q"><strong>100.000 quotas · 11,11%</strong> · R$ 100.000</p>`;
  };
  $$('.slice', el).forEach((g) => {
    g.addEventListener('click', () => select(g.dataset.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.id); } });
  });
  $$('.donut-legend button', el).forEach((b) => b.addEventListener('click', () => select(b.dataset.id)));
}

function openPerson(id) {
  const s = socio(id), d = $('#person');
  $('.ps-body', d).innerHTML = `<span class="av av--lg">${s.iniciais}</span><p class="kicker">${esc(s.funcao)}</p><h2 id="person-title">${esc(s.nome)}</h2>
    <p class="muted">100.000 quotas · 11,11% do capital</p><h3 class="sec-label"><span>Responsabilidades</span></h3>
    <ul class="list list--check">${s.resp.map((r) => `<li>${icon('Check')}<span>${esc(r)}</span></li>`).join('')}</ul>`;
  openDialog(d);
}

function setupQsim(el) {
  const sel = $('#qsim-matter', el), voters = $$('.voter', el);
  const levels = Object.fromEntries(data.quorum.levels.map((l) => [l.id, l]));
  const markPct = { maioria: 50, 'dois-tercos': 200 / 3, 'tres-quartos': 75, unanimidade: 100 };
  const passes = (lvl, y) => lvl === 'maioria' ? y * 2 > 9 : lvl === 'dois-tercos' ? y * 3 >= 18 : lvl === 'tres-quartos' ? y * 4 >= 27 : y === 9;
  const update = () => {
    const m = data.quorum.matters[+sel.value], L = levels[m.level];
    const yes = voters.filter((v) => v.getAttribute('aria-pressed') === 'true').length;
    const pct = (yes / 9) * 100, ok = passes(m.level, yes);
    $('.qsim-need', el).innerHTML = `Quórum exigido: <strong>${esc(L.name)} (${esc(L.pct)})</strong> · ${L.needed} de 9 sócios`;
    $('.qbar-fill', el).style.setProperty('--w', pct + '%');
    $('.qbar-mark', el).style.setProperty('--m', markPct[m.level] + '%');
    $('.qbar', el).classList.toggle('ok', ok);
    $('.qsim-count', el).innerHTML = `Votos “sim”: <strong>${yes} de 9</strong> · ${nf(pct, 2)}% do capital · limite: ${esc(L.pct)}`;
    $('.qsim-result', el).innerHTML = `<div class="verdict ${ok ? 'verdict--ok' : 'verdict--no'}">${icon(ok ? 'CircleCheck' : 'CircleX')}<div><strong>${ok ? 'Aprovada' : 'Não aprovada'}</strong><span>Base: ${esc(m.source)}${ok ? '' : ` · faltam ${Math.max(0, L.needed - yes)} voto(s) “sim”`}</span></div></div>`;
  };
  voters.forEach((v) => v.addEventListener('click', () => {
    const on = v.getAttribute('aria-pressed') !== 'true';
    v.setAttribute('aria-pressed', on); $('.v-vote', v).textContent = on ? 'Sim' : 'Não'; update();
  }));
  $$('[data-all]', el).forEach((b) => b.addEventListener('click', () => {
    const on = b.dataset.all === '1';
    voters.forEach((v) => { v.setAttribute('aria-pressed', on); $('.v-vote', v).textContent = on ? 'Sim' : 'Não'; }); update();
  }));
  sel.addEventListener('change', update);
  update();
}

function setupNet(el) {
  const items = JSON.parse($('script', el).textContent), nodes = $$('.net-node', el), panel = $('.net-panel', el);
  const show = (i) => { nodes.forEach((n, k) => n.setAttribute('aria-pressed', k === i)); panel.innerHTML = `<h3>${esc(items[i].title)}</h3><p>${fmt(items[i].text)}</p>`; };
  nodes.forEach((n, i) => n.addEventListener('click', () => show(i)));
  show(0);
}

function setupSim(el) {
  const s = data.simulator, r = $('#sim-n', el);
  const up = () => { const n = +r.value, rev = n * s.ticket, res = rev - s.expenses; $('.sim-n', el).textContent = n; $('.sim-rev', el).textContent = brl(rev, 2); $('.sim-res', el).textContent = (res < 0 ? '− ' : '') + brl(Math.abs(res), 2); $('.sim-res', el).classList.toggle('neg', res < 0); };
  r.addEventListener('input', up); up();
}

function enhance(root) {
  $$('[data-timeline]', root).forEach(setupTimeline);
  $$('[data-carousel]', root).forEach(setupCarousel);
  $$('[data-plans]', root).forEach(setupPlans);
  $$('.flip', root).forEach(setupFlip);
  $$('[data-donut]', root).forEach(setupDonut);
  $$('[data-qsim]', root).forEach(setupQsim);
  $$('[data-net]', root).forEach(setupNet);
  $$('[data-sim]', root).forEach(setupSim);
  setupReveal(root);
}

/* ---------- popover de referência ---------- */
const pop = () => $('#refpop');
function openRef(btn) {
  const p = pop(), r = btn.dataset.ref;
  $('.rp-title', p).textContent = r;
  $('.rp-text', p).textContent = refText(r);
  p.hidden = false;
  const b = btn.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 32);
  p.style.width = w + 'px';
  const left = Math.max(16, Math.min(window.innerWidth - w - 16, b.left + b.width / 2 - w / 2));
  const below = b.bottom + 8 + p.offsetHeight < window.innerHeight;
  p.style.left = left + 'px';
  p.style.top = (below ? b.bottom + 8 : Math.max(8, b.top - 8 - p.offsetHeight)) + 'px';
  p._from = btn;
  btn.setAttribute('aria-expanded', 'true');
  $('.rp-close', p).focus({ preventScroll: true });
}
function closeRef() {
  const p = pop();
  if (p.hidden) return;
  p.hidden = true;
  if (p._from) { p._from.setAttribute('aria-expanded', 'false'); p._from.focus({ preventScroll: true }); }
}

/* ---------- Vértora em 60 segundos ---------- */
const STORY_MS = 8000;
let story = { i: 0, t0: 0, elapsed: 0, paused: false };
let storyRaf = 0;
function renderStory() {
  const s = data.stories[story.i], st = $('#stories');
  $$('.sg', st).forEach((g, k) => { g.classList.toggle('done', k < story.i); g.firstChild.style.setProperty('--p', k < story.i ? 1 : 0); });
  $('.st-slide', st).innerHTML = `
    ${s.logo ? `<div class="st-logo">${logoPicture(200, false)}</div>` : `<p class="st-big ${s.big.length > 5 ? 'st-big--long' : ''}">${esc(s.big)}</p>${s.bigLabel ? `<p class="st-big-l">${esc(s.bigLabel)}</p>` : ''}`}
    <p class="kicker kicker--light">${esc(s.kicker)}</p>
    <h2 class="st-title">${esc(s.title)}</h2>
    <p class="st-text">${esc(s.text)}</p>
    ${s.final ? `<div class="st-cta"><a class="btn btn--gold" href="#${chapters[0].id}" data-explore>Explorar o portfólio completo${icon('ArrowRight')}</a><button type="button" class="btn btn--outline-light" data-replay>${icon('RotateCcw')}Rever</button></div>` : ''}
    <p class="sr-only" aria-live="polite">Tela ${story.i + 1} de ${data.stories.length}</p>`;
  const slide = $('.st-slide', st);
  slide.classList.remove('enter'); void slide.offsetWidth; slide.classList.add('enter');
  story.elapsed = 0; story.t0 = performance.now();
}
function storyTick(t) {
  const st = $('#stories');
  if (!st.classList.contains('open')) return;
  if (!story.paused) {
    const el = story.elapsed + (t - story.t0);
    const p = Math.min(1, el / STORY_MS);
    const seg = $$('.sg', st)[story.i];
    if (seg) seg.firstChild.style.setProperty('--p', p);
    if (p >= 1) {
      if (story.i < data.stories.length - 1) { story.i++; renderStory(); }
      else story.paused = true;
    }
  }
  storyRaf = requestAnimationFrame(storyTick);
}
function storyGo(d) {
  const n = story.i + d;
  if (n < 0) { story.i = 0; renderStory(); return; }
  if (n >= data.stories.length) { exitStories(chapters[0].id); return; }
  story.i = n; story.paused = false; renderStory();
}
function openStories() {
  const st = $('#stories');
  st.hidden = false; st.classList.add('open'); document.body.classList.add('no-scroll');
  cancelAnimationFrame(storyRaf);
  story = { i: 0, t0: performance.now(), elapsed: 0, paused: false };
  renderStory();
  storyRaf = requestAnimationFrame(storyTick);
  $('.st-close', st).focus({ preventScroll: true });
}
function closeStoriesUI() {
  const st = $('#stories');
  st.classList.remove('open'); st.hidden = true; document.body.classList.remove('no-scroll');
  cancelAnimationFrame(storyRaf);
}
function exitStories(target) {
  // troca a entrada #60s por destino, para o "voltar" não reabrir os stories
  location.replace('#' + (target || 'inicio'));
}
function setupStories() {
  const st = $('#stories');
  st.addEventListener('click', (e) => {
    if (e.target.closest('[data-replay]')) { story.i = 0; story.paused = false; renderStory(); return; }
    if (e.target.closest('[data-explore]')) { e.preventDefault(); exitStories(chapters[0].id); return; }
    if (e.target.closest('.st-close')) { exitStories(lastRoute === '60s' ? 'inicio' : lastRoute); return; }
    if (e.target.closest('.st-skip')) { exitStories(chapters[0].id); return; }
    if (e.target.closest('a,button')) return;
    if (holdFired) { holdFired = false; return; }
    const x = e.clientX / window.innerWidth;
    storyGo(x < 0.35 ? -1 : 1);
  });
  let holdT, holdFired = false;
  st.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button')) return;
    holdT = setTimeout(() => { holdFired = true; story.elapsed += performance.now() - story.t0; story.paused = true; st.classList.add('paused'); }, 280);
  });
  const release = () => {
    clearTimeout(holdT);
    if (story.paused && holdFired) { story.paused = false; story.t0 = performance.now(); st.classList.remove('paused'); }
  };
  st.addEventListener('pointerup', release);
  st.addEventListener('pointercancel', release);
  document.addEventListener('keydown', (e) => {
    if (!st.classList.contains('open')) return;
    if (e.key === 'ArrowRight') storyGo(1);
    if (e.key === 'ArrowLeft') storyGo(-1);
    if (e.key === 'Escape') exitStories(lastRoute === '60s' ? 'inicio' : lastRoute);
  });
  document.addEventListener('visibilitychange', () => {
    if (!st.classList.contains('open')) return;
    if (document.hidden) { story.elapsed += performance.now() - story.t0; story.paused = true; }
    else { story.paused = false; story.t0 = performance.now(); }
  });
}

/* ---------- roteador ---------- */
let lastRoute = 'inicio';
function route() {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'inicio';
  closeRef();
  [$('#toc'), $('#person'), $('#qr')].forEach(closeDialog);
  if (id === '60s') {
    if (!$('#app').dataset.view) show('inicio');
    openStories();
    return;
  }
  closeStoriesUI();
  show(id);
}
function show(id) {
  const app = $('#app'), idx = chapters.findIndex((c) => c.id === id);
  const view = idx >= 0 ? id : 'inicio';
  if (app.dataset.view === view) return;
  app.dataset.view = view;
  lastRoute = view;
  if (idx >= 0) {
    const c = chapters[idx];
    app.innerHTML = renderChapter(c, idx);
    $('.tb-where').innerHTML = `<span class="tb-num">${c.num}</span><span class="tb-name">${esc(c.nav)}</span>`;
    document.title = `${c.num} · ${c.nav} — Vértora`;
  } else {
    app.innerHTML = renderHome();
    $('.tb-where').innerHTML = `<span class="tb-name">Portfólio</span>`;
    document.title = 'Vértora — Gestão Patrimonial e Empresarial';
  }
  document.body.dataset.view = idx >= 0 ? 'chapter' : 'home';
  $('#toc-list').innerHTML = tocItems(view);
  window.scrollTo(0, 0);
  enhance(app);
  onScroll();
  const h = $('h1', app);
  if (h && shouldFocus()) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}
let navigated = false;
function shouldFocus() { const r = navigated; navigated = true; return r; }

/* ---------- barra de progresso ---------- */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    $('.tb-progress span').style.transform = `scaleX(${p})`;
    document.body.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  });
}

/* ---------- inicialização ---------- */
function init() {
  $('#qr-img').src = data.site.qr;
  $('#qr-url').textContent = data.site.url;
  $('#toc-pdf').href = data.site.pdf;

  document.addEventListener('click', (e) => {
    const ref = e.target.closest('.ref');
    if (ref) { e.stopPropagation(); if (!pop().hidden && pop()._from === ref) closeRef(); else openRef(ref); return; }
    if (!e.target.closest('#refpop')) closeRef();
    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'share') share();
      if (a === 'qr') { closeDialog($('#toc')); openDialog($('#qr')); }
      if (a === 'toc') openDialog($('#toc'));
      if (a === 'close') closeDialog(act.closest('dialog'));
    }
    const per = e.target.closest('[data-person]');
    if (per) openPerson(per.dataset.person);
    const sw = e.target.closest('.swatch');
    if (sw) copyText(sw.dataset.hex, `Copiado: ${sw.dataset.hex}`);
    if (e.target.closest('#toc a')) closeDialog($('#toc'));
  });
  $('#refpop .rp-close').addEventListener('click', closeRef);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRef(); });
  // fechar diálogo tocando fora (no fundo)
  $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  window.addEventListener('scroll', () => { onScroll(); }, { passive: true });
  window.addEventListener('resize', closeRef);
  window.addEventListener('hashchange', route);
  setupStories();
  route();
}
init();
