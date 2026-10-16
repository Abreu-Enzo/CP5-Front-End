/* Senna — interações da landing. Sem dependências.
   Durações vêm dos tokens (--dur-*) lidos do CSS; nada de tempo solto de animação aqui. */

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const token = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 4); // desaceleração tipo ease-brake
const easeInOut = (t) => (t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2); // tipo ease-launch
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* sem storage: segue sem lembrar */ } },
};

/* ---------- Tema: Noite (padrão) / Dia ---------- */
const themeBtn = $('#theme-toggle');
function applyTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  themeBtn.setAttribute('aria-pressed', String(dark));
  themeBtn.textContent = dark ? 'Dia' : 'Noite';
  themeBtn.setAttribute('aria-label', dark ? 'Mudar para o modo dia' : 'Mudar para o modo noite');
}
applyTheme(store.get('sn-theme') === 'light' ? 'light' : 'dark');

// A troca entra numa varredura diagonal, com uma faixa vermelha correndo na frente.
themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  store.set('sn-theme', next);
  if (reduceMotion || !document.startViewTransition) { applyTheme(next); return; }
  const band = document.createElement('div');
  band.className = 'theme-band';
  band.setAttribute('aria-hidden', 'true');
  document.body.append(band);
  // a faixa sai da esquerda (estado antigo) e chega à direita (estado novo); o navegador anima o trajeto
  const transition = document.startViewTransition(() => { applyTheme(next); band.classList.add('is-end'); });
  transition.finished.finally(() => band.remove());
});

/* ---------- Menu mobile ---------- */
const menuBtn = $('#menu-btn');
const menu = $('#menu');
function setMenu(open) {
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Fechar' : 'Menu';
  document.body.classList.toggle('menu-open', open);
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

/* ---------- Entradas (reveal, faixas, contadores) ---------- */
const hero = $('.hero');
requestAnimationFrame(() => hero.classList.add('is-in'));

function restartStripes(el) {
  $$('.sn-stripes__band', el).forEach((band) => {
    band.style.animation = 'none';
    void band.offsetWidth; // reflow para reiniciar a animação
    band.style.animation = '';
  });
}

// Contagem de 0 ao valor: dispara rápido e freia no número final (ease-out exponencial).
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
function countUp(el, delay = 0) {
  const to = Number(el.dataset.to);
  cancelAnimationFrame(el._raf);
  if (reduceMotion) { el.textContent = to; return; }
  const dur = token('--dur-lap');
  const start = performance.now() + delay;
  el.textContent = 0;
  const tick = (now) => {
    const t = clamp((now - start) / dur);
    el.textContent = Math.round(easeOutExpo(t) * to);
    if (t < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('is-in');
    if (el.matches('[data-stripes]')) restartStripes(el);
    revealIO.unobserve(el);
  });
}, { threshold: 0.3 });
$$('[data-reveal], [data-stripes]:not(.hero__stripes)').forEach((el) => revealIO.observe(el));

// Os números contam de novo toda vez que a grade volta à tela.
const nums = $$('#stats .sn-stat__num');
const statsIO = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) nums.forEach((n, i) => countUp(n, i * token('--dur-fast') / 2));
  else nums.forEach((n) => { cancelAnimationFrame(n._raf); n.textContent = reduceMotion ? n.dataset.to : 0; });
}, { threshold: 0.5 });
statsIO.observe($('#stats'));

/* ---------- NavBar: capítulo ativo ---------- */
const navLinks = $$('.sn-nav__link');
const chapterIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main > section[id]').forEach((s) => chapterIO.observe(s));

/* ---------- Carro: entra, freia no box e desmonta ---------- */
const car = $('#car');
const carTrack = $('#car-track');
const carBg = $('.maquina__bg');
const carToggle = $('#car-toggle');
const tele = {
  speed: $('#t-speed'), gear: $('#t-gear'), rpm: $('#t-rpm'),
  bSpeed: $('#b-speed'), bGear: $('#b-gear'), bRpm: $('#b-rpm'),
};
const carStatus = $('#car-status');
const TOP_SPEED = 318;  // ilustrativo
const MAX_RPM = 12500;  // regime de potência máxima do RA168E
let manual = null;      // null = segue a rolagem; true/false = botão
let lastP = -1;
let kShown = 0;

carToggle.addEventListener('click', () => {
  const exploded = carToggle.getAttribute('aria-pressed') === 'true';
  manual = !exploded;
  setToggle(manual);
});
function setToggle(exploded) {
  if (carToggle.getAttribute('aria-pressed') === String(exploded)) return;
  carToggle.setAttribute('aria-pressed', String(exploded));
  carToggle.textContent = exploded ? 'Montar' : 'Desmontar';
}

function setStatus(text) { if (carStatus.textContent !== text) carStatus.textContent = text; }

function updateCar() {
  const rect = carTrack.getBoundingClientRect();
  const vh = innerHeight;
  if (rect.bottom < -vh || rect.top > vh * 2) return;
  const p = reduceMotion ? 1 : clamp(-rect.top / (rect.height - vh));
  if (manual !== null && Math.abs(p - lastP) > 0.03 && lastP >= 0 && !reduceMotion) manual = null; // rolou: volta ao scroll
  if (manual === null) lastP = p;

  // 1) faixas do fundo correm com a rolagem
  carBg.style.setProperty('--sx', `${-60 + p * 70}%`);
  $$('.sn-stripes__band', carBg).forEach((b, i) => b.style.setProperty('--sx', `${-70 + p * (60 + i * 25)}%`));

  // 2) velocidade sobe até a reta e freia até o box
  let speed;
  if (p < 0.18) speed = 140 + (TOP_SPEED - 140) * (p / 0.18);
  else if (p < 0.38) speed = TOP_SPEED * (1 - easeOut((p - 0.18) / 0.2));
  else speed = 0;
  if (reduceMotion) speed = 0;

  // 3) desmontagem
  const kScroll = easeInOut(clamp((p - 0.42) / 0.36));
  const kTarget = manual === null ? kScroll : (manual ? 1 : 0);
  kShown = reduceMotion ? kTarget : kShown + (kTarget - kShown) * (manual === null ? 1 : 0.12);
  if (Math.abs(kShown - kTarget) < 0.001) kShown = kTarget;
  car.style.setProperty('--k', kShown.toFixed(4));
  if (manual === null) setToggle(kScroll > 0.5);

  const gear = speed < 4 ? 0 : Math.min(6, Math.ceil(speed / (TOP_SPEED / 6)));
  const inGear = gear ? (speed - (gear - 1) * (TOP_SPEED / 6)) / (TOP_SPEED / 6) : 0;
  const rpm = gear ? Math.round(7000 + inGear * (MAX_RPM - 7000)) : 0;
  tele.speed.textContent = Math.round(speed);
  tele.gear.textContent = gear ? gear : 'N';
  tele.rpm.textContent = rpm.toLocaleString('pt-BR');
  tele.bSpeed.style.setProperty('--v', `${(speed / TOP_SPEED) * 100}%`);
  tele.bGear.style.setProperty('--v', `${(gear / 6) * 100}%`);
  tele.bRpm.style.setProperty('--v', `${(rpm / MAX_RPM) * 100}%`);

  // estado lido pela cena 3D (car3d.js) a cada quadro
  window.sennaCar = { p, k: kShown, speed };

  if (kShown > 0.98) setStatus('Desmontado · 7 peças');
  else if (kShown > 0.02) setStatus('Mecânicos trabalhando');
  else if (p < 0.18) setStatus('Setor 1 · acelerando');
  else if (p < 0.38) setStatus('Box, box · freando');
  else setStatus('No box');
}

/* ---------- Timeline + LapProgress ---------- */
const carreira = $('#carreira');
const timeline = $('#timeline');
const tlItems = $$('.sn-tl-item', timeline);
const photos = $$('.carreira__photo');
const lap = { fill: $('#lap-fill'), sector: $('#lap-sector'), year: $('#lap-year'), time: $('#lap-time') };
const LAP_MS = 78986; // 1:18.986, ilustrativo
let activeIdx = -1;

function fmtLap(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const x = Math.floor(ms % 1000);
  return `${m}:${String(s).padStart(2, '0')}.${String(x).padStart(3, '0')}`;
}

function updateTimeline() {
  const rect = timeline.getBoundingClientRect();
  const vh = innerHeight;
  if (rect.bottom < -vh || rect.top > vh * 2) return;
  const line = vh * 0.55;
  const prog = clamp((line - rect.top) / rect.height);
  timeline.style.setProperty('--sn-tl', `${prog * 100}%`);

  let idx = -1;
  tlItems.forEach((item, i) => { if (item.getBoundingClientRect().top < line) idx = i; });
  if (idx !== activeIdx) {
    activeIdx = idx;
    tlItems.forEach((item, i) => {
      item.classList.toggle('is-active', i === idx && !item.classList.contains('sn-tl-item--luto'));
      item.classList.toggle('is-past', i < idx);
    });
    const current = tlItems[Math.max(0, idx)];
    const key = current.dataset.photo;
    carreira.classList.toggle('is-luto', key === 'none');
    if (key !== 'none') photos.forEach((ph) => ph.classList.toggle('is-on', ph.dataset.photo === key));
    lap.year.textContent = current.querySelector('.sn-tl-item__year').textContent;
  }

  const lapP = clamp((vh * 0.3 - rect.top) / (rect.height - vh * 0.3));
  lap.fill.style.setProperty('--sn-lap', `${lapP * 100}%`);
  lap.sector.textContent = lapP < 1 / 3 ? 1 : lapP < 2 / 3 ? 2 : 3;
  lap.time.textContent = fmtLap(lapP * LAP_MS);
}

/* ---------- Parallax ---------- */
const parallaxEls = $$('[data-parallax]');
function updateParallax() {
  if (reduceMotion) return;
  const vh = innerHeight;
  parallaxEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
    const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
    el.style.translate = `0 ${offset.toFixed(1)}px`;
  });
}

/* ---------- Header e progresso de leitura ---------- */
const header = $('#header');
const nav = $('#nav');
function updateHeader() {
  const y = scrollY;
  header.classList.toggle('is-solid', y > hero.offsetHeight - 80);
  const max = root.scrollHeight - innerHeight;
  nav.style.setProperty('--sn-progress', `${clamp(y / max) * 100}%`);
}

/* ---------- Hero preso à rolagem: a foto cresce até ocupar a tela ---------- */
const heroPin = $('.hero__pin');
const heroFrame = $('#hero-frame');
const heroBleed = $('#hero-bleed');
const heroStatement = $('#hero-statement');
const pinMQ = matchMedia('(min-width: 901px)');
function setPin() {
  const pin = pinMQ.matches && !reduceMotion;
  hero.classList.toggle('has-pin', pin);
  if (!pin) { // sem a cena presa, nada pode ficar escondido pelos valores da rolagem
    ['--copy-y', '--copy-o', '--frame-o', '--hx', '--shade', '--bleed-s', '--st-o'].forEach((v) => hero.style.removeProperty(v));
    heroBleed.removeAttribute('style');
  }
}
setPin();
pinMQ.addEventListener('change', setPin);

function updateHero() {
  if (!hero.classList.contains('has-pin')) { header.classList.remove('on-photo'); return; }
  const r = hero.getBoundingClientRect();
  const vh = innerHeight;
  if (r.bottom < 0) return;
  const p = clamp(-r.top / (r.height - vh));
  const e = easeInOut(clamp((p - 0.06) / 0.56));
  const lerp = (a, b) => a + (b - a) * e;

  hero.style.setProperty('--copy-y', `${(-e * vh * 0.3).toFixed(1)}px`);
  hero.style.setProperty('--copy-o', clamp(1 - e * 1.8).toFixed(3));
  hero.style.setProperty('--frame-o', clamp(1 - e * 4).toFixed(3));
  hero.style.setProperty('--hx', `${(-p * 45).toFixed(2)}%`);
  hero.style.setProperty('--shade', (e * 0.5).toFixed(3));
  header.classList.toggle('on-photo', e > 0.45 && r.bottom > 80); // no modo dia, o header volta ao branco sobre a foto
  hero.style.setProperty('--bleed-s', (1 + p * 0.1).toFixed(4));

  const pr = heroPin.getBoundingClientRect();
  const fr = heroFrame.getBoundingClientRect();
  heroBleed.style.left = `${lerp(fr.left - pr.left, 0)}px`;
  heroBleed.style.top = `${lerp(fr.top - pr.top, 0)}px`;
  heroBleed.style.width = `${lerp(fr.width, pr.width)}px`;
  heroBleed.style.height = `${lerp(fr.height, pr.height)}px`;

  const st = clamp((p - 0.58) / 0.2);
  hero.style.setProperty('--st-o', st.toFixed(3));
  heroStatement.classList.toggle('is-in', st > 0.05);
}

/* ---------- Âncoras: rolagem com tempo de volta ----------
   A rolagem nativa é rápida demais e atropela a cena do hero. Aqui a duração cresce com
   a distância (de --dur-lap até 1,8× ele) e acelera/freia como o ease-launch. */
let scrollAnim = 0;
function stopScroll() { cancelAnimationFrame(scrollAnim); scrollAnim = 0; }
function scrollToTarget(target) {
  const navH = header.offsetHeight;
  const to = Math.max(0, target.getBoundingClientRect().top + scrollY - navH + 1);
  const from = scrollY;
  const dist = to - from;
  if (reduceMotion || !dist) { scrollTo(0, to); return; }
  const dur = token('--dur-lap') * clamp(Math.abs(dist) / innerHeight, 1, 1.8);
  const start = performance.now();
  stopScroll();
  const step = (now) => {
    const t = clamp((now - start) / dur);
    scrollTo(0, from + dist * easeInOut(t));
    scrollAnim = t < 1 ? requestAnimationFrame(step) : 0;
  };
  scrollAnim = requestAnimationFrame(step);
}
['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, () => scrollAnim && stopScroll(), { passive: true }));
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
  const target = link.hash === '#topo' ? hero : document.querySelector(link.hash);
  if (!target) return;
  e.preventDefault();
  scrollToTarget(target);
  history.pushState(null, '', link.hash);
  if (target !== hero) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
});

/* ---------- Loop ---------- */
function frame() {
  updateHeader();
  updateHero();
  updateParallax();
  updateCar();
  updateTimeline();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Easter egg: volta de honra ---------- */
const honra = $('#honra');
const honraLive = $('#honra-live');
let honraOn = false;
function voltaDeHonra() {
  if (honraOn) return;
  honraLive.textContent = 'Volta de honra. Obrigado, Ayrton.';
  if (reduceMotion) return;
  honraOn = true;
  honra.classList.add('is-on');
  const total = 4200;
  setTimeout(() => { honra.classList.remove('is-on'); honraOn = false; }, total);
}

let typed = '';
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-5);
  if (typed === 'senna') { typed = ''; voltaDeHonra(); }
});

/* ---------- Luzes de largada ---------- */
const lights = $('#lights');
const panel = $('#lights-panel');
const lamps = $$('.lights__lamp', panel);
const cta = $('#lights-cta');
const out = { time: $('#lights-time'), best: $('#lights-best'), msg: $('#lights-msg'), clock: $('#lights-clock') };
const LIGHT_STEP = 1000; // uma luz por segundo, como no procedimento de largada
let state = 'idle';
let timers = [];
let goAt = 0;
let best = Number(store.get('sn-best')) || 0;
const fmtN = (ms) => (ms / 1000).toFixed(3).replace('.', ',');
const fmtS = (ms) => fmtN(ms) + ' s';
let clockRaf = 0;
function runClock() {
  out.clock.textContent = fmtN(performance.now() - goAt);
  if (state === 'go') clockRaf = requestAnimationFrame(runClock);
}
if (best) out.best.textContent = fmtS(best);

function setState(s) { state = s; lights.dataset.state = s; }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function arm() {
  clearTimers();
  setState('arming');
  lamps.forEach((l) => l.classList.remove('is-on'));
  cta.textContent = 'Aguarde…';
  out.clock.textContent = fmtN(0);
  out.msg.textContent = 'Luzes acendendo.';
  lamps.forEach((lamp, i) => timers.push(setTimeout(() => lamp.classList.add('is-on'), LIGHT_STEP * (i + 1))));
  const hold = LIGHT_STEP * 5 + 200 + Math.random() * 2800;
  timers.push(setTimeout(() => {
    lamps.forEach((l) => l.classList.remove('is-on'));
    goAt = performance.now();
    setState('go');
    cta.textContent = 'Largue!';
    out.msg.textContent = 'Luzes apagadas. Valendo!';
    clockRaf = requestAnimationFrame(runClock);
  }, hold));
}

function finish() {
  const ms = performance.now() - goAt;
  setState('done');
  cancelAnimationFrame(clockRaf);
  out.clock.textContent = fmtN(ms);
  out.time.textContent = fmtS(ms);
  if (!best || ms < best) { best = ms; store.set('sn-best', String(Math.round(ms))); out.best.textContent = fmtS(best); }
  cta.textContent = 'De novo';
  if (ms < 200) {
    out.msg.textContent = `${fmtS(ms)}. Largada de pole. Destravou a volta de honra.`;
    voltaDeHonra();
  } else if (ms < 300) out.msg.textContent = `${fmtS(ms)}. Rápido. Abaixo de 0,200 s, algo acontece na pista.`;
  else out.msg.textContent = `${fmtS(ms)}. Dá para tirar mais. Abaixo de 0,200 s, algo acontece na pista.`;
}

function jumpStart() {
  clearTimers();
  lamps.forEach((l) => l.classList.remove('is-on'));
  setState('jump');
  out.time.textContent = 'Queimou';
  out.clock.textContent = '—';
  out.msg.textContent = 'Largada queimada: você saiu antes das luzes apagarem.';
  cta.textContent = 'Tentar de novo';
}

function press() {
  if (state === 'idle' || state === 'done' || state === 'jump') arm();
  else if (state === 'arming') jumpStart();
  else if (state === 'go') finish();
}
panel.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); press(); } });
panel.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) press(); } });

// barra de espaço funciona com o painel visível, mesmo sem foco nele
document.addEventListener('keydown', (e) => {
  if (e.key !== ' ' || e.repeat || document.activeElement === panel) return;
  if (document.activeElement && document.activeElement.matches('a, button, input, textarea, select')) return;
  const r = panel.getBoundingClientRect();
  if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); press(); }
});
