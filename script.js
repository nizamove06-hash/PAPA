/* ===== НАСТРОЙКИ. МЕНЯЙ ЗДЕСЬ ===== */
const CONFIG = {
  name: 'РАДИК',
  since: '2013-01-02T00:00:00',
  aimSeconds: 20,
  typed: [
    'проверку реакции',
    'тир на меткость',
    'терминал с папиными фразами',
    'секретный зашифрованный файл'
  ],
  advice: [
    'Свет за собой выключай. Я не электростанция.',
    'Сначала попробуй сам. Потом ещё раз. А потом уже звони папе.',
    'Всё чинится, если достаточно долго смотреть на это с умным видом.',
    'Я не ворчу. Я передаю опыт на повышенной громкости.',
    'Надень куртку. Не тебе холодно, а мне на тебя смотреть холодно.',
    'Хочешь сделать хорошо — сделай сам. Хочешь сделать быстро — позови папу.',
    'Главное в жизни — вовремя сказать «ну, посмотрим».',
    'Деньги не растут на деревьях. Зато на них растут яблоки, а это уже что-то.',
    'У каждой проблемы есть решение. А у решения есть инструкция, которую никто не читал.',
    'Запомни: я же говорил. Просто на всякий случай, вдруг пригодится.'
  ],
  message: [
    'Пап, я долго думал, что тебе подарить, и понял: инструмент ты купишь сам, а вот сайт вряд ли :)',
    'Поэтому я сделал маленький секретный проект, где всё собрано только для тебя.',
    'Спасибо, что всегда рядом, даже когда мы молчим или спорим. Для меня это важнее, чем кажется.',
    'P.S. Рекорды в играх пока никто не поставил. Займи первое место.'
  ]
};

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

let mx = innerWidth / 2, my = innerHeight / 2;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

/* ===== ПРЕЛОАДЕР ===== */
let loadVal = 0;
const loadTimer = setInterval(() => {
  loadVal += Math.random() * 9 + 3;
  if (loadVal >= 100) {
    loadVal = 100;
    clearInterval(loadTimer);
    setTimeout(() => $('#preloader').classList.add('done'), 300);
  }
  $('#loaderNum').textContent = Math.floor(loadVal);
  $('#loaderBar').style.width = loadVal + '%';
}, 90);

/* ===== САЛЮТ ===== */
const fx = $('#fx');
const fctx = fx.getContext('2d');
let fp = [], fxRun = false;

function fxResize() {
  fx.width = innerWidth;
  fx.height = innerHeight;
}
fxResize();
addEventListener('resize', fxResize);

function burst(x, y, n) {
  n = n || 80;
  const hue = Math.random() * 360;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 7 + 2;
    fp.push({
      x: x,
      y: y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color: 'hsl(' + ((hue + Math.random() * 70) % 360) + ',100%,65%)',
      size: Math.random() * 3 + 1.5
    });
  }
  if (!fxRun) {
    fxRun = true;
    requestAnimationFrame(fxLoop);
  }
}

function fxLoop() {
  fctx.clearRect(0, 0, fx.width, fx.height);
  fp.forEach(p => {
    p.vy += 0.08;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    fctx.globalAlpha = Math.max(p.life, 0);
    fctx.fillStyle = p.color;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.size, 0, 6.283);
    fctx.fill();
  });
  fctx.globalAlpha = 1;
  fp = fp.filter(p => p.life > 0);
  if (fp.length) requestAnimationFrame(fxLoop);
  else fxRun = false;
}

function fireworks(times) {
  times = times || 8;
  for (let i = 0; i < times; i++) {
    setTimeout(() => {
      burst(
        innerWidth * (0.15 + Math.random() * 0.7),
        innerHeight * (0.15 + Math.random() * 0.45),
        90
      );
    }, i * 380);
  }
}

/* ===== ИСКРЫ ПРИ КЛИКЕ ===== */
addEventListener('click', e => {
  if (e.target.closest && e.target.closest('.aim-arena')) return;
  const icons = ['⚡', '⚙', '★', '🔧', '✦', '🔥'];
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span');
    s.className = 'floater';
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    s.style.setProperty('--dy', (Math.random() * 90 + 40) + 'px');
    s.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
});

/* ===== ВРАТА: ИМЯ ИЗ ЧАСТИЦ ===== */
const gateEl = $('#gate');
const gc = $('#gateCanvas');
const gctx = gc.getContext('2d');
let GWd, GHt, gp = [], exploded = false, gateAlive = true;

function buildName() {
  GWd = gc.width = innerWidth;
  GHt = gc.height = innerHeight;
  const off = document.createElement('canvas');
  off.width = GWd;
  off.height = GHt;
  const o = off.getContext('2d');
  o.font = '800 100px "Segoe UI",Arial';
  const w100 = o.measureText(CONFIG.name).width;
  const fs = Math.min(GWd * 0.86 / w100 * 100, 220);
  o.font = '800 ' + fs + 'px "Segoe UI",Arial';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillStyle = '#fff';
  o.fillText(CONFIG.name, GWd / 2, GHt * 0.4);

  const gap = GWd < 700 ? 4 : 6;
  const data = o.getImageData(0, 0, GWd, GHt).data;
  gp = [];
  for (let y = 0; y < GHt; y += gap) {
    for (let x = 0; x < GWd; x += gap) {
      if (data[(y * GWd + x) * 4 + 3] > 128) {
        gp.push({
          x: Math.random() * GWd,
          y: Math.random() * GHt,
          tx: x,
          ty: y,
          vx: 0,
          vy: 0,
          hue: 25 + (x / GWd) * 165
        });
      }
    }
  }
}
buildName();
addEventListener('resize', () => {
  if (!exploded) buildName();
});

function gateLoop() {
  if (!gateAlive) return;
  gctx.clearRect(0, 0, GWd, GHt);
  for (const p of gp) {
    if (!exploded) {
      p.vx += (p.tx - p.x) * 0.035;
      p.vy += (p.ty - p.y) * 0.035;
      const dx = p.x - mx;
      const dy = p.y - my;
      const d = Math.hypot(dx, dy);
      if (d < 90 && d > 0) {
        p.vx += dx / d * 3.2;
        p.vy += dy / d * 3.2;
      }
      p.vx *= 0.86;
      p.vy *= 0.86;
    } else {
      p.vy += 0.12;
    }
    p.x += p.vx;
    p.y += p.vy;
    gctx.fillStyle = 'hsl(' + (p.hue % 360) + ',95%,62%)';
    gctx.fillRect(p.x, p.y, 2.6, 2.6);
  }
  requestAnimationFrame(gateLoop);
}
gateLoop();

/* ===== СКАНЕР ОТПЕЧАТКА ===== */
const holdBtn = $('#hold');
const holdBar = $('#holdBar');
const gateStatus = $('#gateStatus');
let hp = 0, holding = false, unlocked = false;

function holdLoop() {
  if (unlocked) return;
  hp += holding ? 0.012 : -0.02;
  hp = Math.max(0, Math.min(1, hp));
  holdBar.style.strokeDashoffset = 327 * (1 - hp);
  holdBtn.style.transform = 'scale(' + (1 + hp * 0.2) + ')';
  gateStatus.textContent = hp > 0
    ? 'СКАНИРОВАНИЕ... ' + Math.floor(hp * 100) + '%'
    : 'ОЖИДАНИЕ ОТПЕЧАТКА';
  if (hp >= 1) unlock();
  else requestAnimationFrame(holdLoop);
}
holdLoop();

holdBtn.addEventListener('pointerdown', e => {
  e.preventDefault();
  holding = true;
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
  holdBtn.addEventListener(ev, () => { holding = false; });
});
addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'Enter') holding = true;
});
addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'Enter') holding = false;
});

function unlock() {
  unlocked = true;
  exploded = true;
  gateStatus.textContent = 'ДОСТУП РАЗРЕШЁН ✓';
  gp.forEach(p => {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 14 + 3;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s - 4;
  });
  gateEl.classList.add('open');
  document.body.classList.remove('locked');
  fireworks(7);
  setTimeout(() => {
    $('#title').classList.add('in');
    startTyping();
  }, 500);
  setTimeout(() => { gateAlive = false; }, 1600);
}

/* ===== ПЕЧАТАЮЩИЙСЯ ТЕКСТ ===== */
function startTyping() {
  const el = $('#typed');
  const words = CONFIG.typed;
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) {
      del = true;
      return setTimeout(tick, 1400);
    }
    if (del && c === 0) {
      del = false;
      w = (w + 1) % words.length;
    }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 45 : 90);
  })();
}

/* ===== КУРСОР ===== */
const dot = $('#cursorDot');
const ring = $('#cursorRing');
let rx = mx, ry = my;

addEventListener('mousemove', () => {
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});
(function followRing() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(followRing);
})();
$$('a, button, input, .skill, .time-box').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* ===== ФОНОВЫЕ ЧАСТИЦЫ ===== */
const canvas = $('#bg');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(110, Math.floor((W * H) / 15000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 1.8 + 0.6
  }));
}
resize();
addEventListener('resize', resize);

(function animate() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - mx;
    const dy = p.y - my;
    const d = Math.hypot(dx, dy);
    if (d < 140 && d > 0) {
      p.x += dx / d * 1.2;
      p.y += dy / d * 1.2;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 120) {
        ctx.strokeStyle = 'rgba(0,212,255,' + ((1 - dist / 120) * 0.3) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
    if (d < 180) {
      ctx.strokeStyle = 'rgba(255,138,31,' + ((1 - d / 180) * 0.6) + ')';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
  }
  requestAnimationFrame(animate);
})();

/* ===== ШАПКА, ПРОГРЕСС, ПАРАЛЛАКС ===== */
const header = $('#header');
const progress = $('#progress');
const blobs = $$('.blob');
let lastY = 0;

addEventListener('scroll', () => {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
  header.classList.toggle('scrolled', y > 50);
  header.classList.toggle('hide', y > lastY && y > 400);
  lastY = y;
  blobs.forEach((b, i) => {
    b.style.translate = '0 ' + (y * (0.08 + i * 0.05)) + 'px';
  });
});

/* ===== МОБИЛЬНОЕ МЕНЮ ===== */
const burger = $('#burger');
const nav = $('#nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});
$$('a', nav).forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ===== ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== СЧЁТЧИКИ ===== */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const dur = 2000;
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.floor(eased * target) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(step);
    })(start);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counterIO.observe(el));

/* ===== МАГНИТНЫЕ КНОПКИ ===== */
$$('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
    el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ===== RIPPLE НА КНОПКАХ ===== */
$$('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });
});

/* ===== КУБ ДВИГАЕТСЯ ЗА МЫШЬЮ ===== */
addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - 0.5) * 30;
  const y = (e.clientY / innerHeight - 0.5) * 30;
  $('#scene').style.transform = 'translate(' + x + 'px, ' + y + 'px)';
});

/* ===== ЖИВОЙ СЧЁТЧИК ВРЕМЕНИ ===== */
const since = new Date(CONFIG.since).getTime();
const tD = $('#tDays');
const tH = $('#tHours');
const tM = $('#tMin');
const tS = $('#tSec');
let lastSec = -1;

function updateTime() {
  const diff = Math.max(0, Date.now() - since);
  const s = Math.floor(diff / 1000);
  tD.textContent = Math.floor(s / 86400).toLocaleString('ru-RU');
  tH.textContent = Math.floor(s / 3600) % 24;
  tM.textContent = Math.floor(s / 60) % 60;
  tS.textContent = s % 60;
  if (s !== lastSec) {
    tS.classList.remove('bump');
    void tS.offsetWidth;
    tS.classList.add('bump');
    lastSec = s;
  }
}
updateTime();
setInterval(updateTime, 250);

/* ===== ИГРА 1: РЕАКЦИЯ ===== */
(function () {
  const lightsEl = $('#rxLights');
  const lights = $$('i', lightsEl);
  const pad = $('#rxPad');
  const title = $('#rxTitle');
  const text = $('#rxText');
  const roundEl = $('#rxRound');
  const bestEl = $('#rxBest');
  const avgEl = $('#rxAvg');
  let state = 'idle', timers = [], t0 = 0, times = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function setLights(n) {
    lights.forEach((l, i) => l.classList.toggle('on', i < n));
  }
  function getBest() {
    try { return +localStorage.getItem('radikRxBest') || 0; } catch (e) { return 0; }
  }
  function setBest(v) {
    try { localStorage.setItem('radikRxBest', v); } catch (e) {}
  }
  function showBest() {
    const b = getBest();
    bestEl.textContent = b ? b + ' мс' : '—';
  }
  showBest();

  function startRound() {
    clearTimers();
    state = 'waiting';
    lightsEl.classList.remove('go');
    pad.className = 'rx-pad wait';
    title.textContent = 'Жди зелёный...';
    text.textContent = 'Не нажимай раньше времени';
    setLights(0);
    for (let i = 1; i <= 5; i++) {
      (function (n) {
        timers.push(setTimeout(() => setLights(n), n * 650));
      })(i);
    }
    timers.push(setTimeout(go, 5 * 650 + 800 + Math.random() * 2200));
  }

  function go() {
    state = 'go';
    setLights(0);
    lightsEl.classList.add('go');
    pad.className = 'rx-pad go';
    title.textContent = 'ЖМИ!';
    text.textContent = '';
    t0 = performance.now();
  }

  function finish(avg) {
    state = 'done';
    const best = Math.min.apply(null, times);
    let verdict;
    if (avg < 220) verdict = 'Реакция пилота Формулы-1 🏎';
    else if (avg < 300) verdict = 'Отличная реакция 👍';
    else if (avg < 400) verdict = 'Нормально. Кофе поможет ☕';
    else verdict = 'Ну... посмотрим 😄';
    const old = getBest();
    if (!old || best < old) {
      setBest(best);
      verdict += ' Новый рекорд: ' + best + ' мс! 🏆';
    }
    showBest();
    title.textContent = avg + ' мс в среднем';
    text.textContent = verdict + ' Нажми, чтобы сыграть снова';
    if (avg < 250) fireworks(6);
  }

  function press() {
    if (state === 'idle' || state === 'done') {
      times = [];
      roundEl.textContent = 0;
      avgEl.textContent = '—';
      startRound();
      return;
    }
    if (state === 'between' || state === 'fail') {
      startRound();
      return;
    }
    if (state === 'waiting') {
      clearTimers();
      state = 'fail';
      setLights(0);
      pad.className = 'rx-pad fail';
      title.textContent = 'Фальстарт! 😅';
      text.textContent = 'Слишком рано. Нажми, чтобы повторить раунд';
      return;
    }
    if (state === 'go') {
      const ms = Math.round(performance.now() - t0);
      times.push(ms);
      roundEl.textContent = times.length;
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      avgEl.textContent = avg + ' мс';
      lightsEl.classList.remove('go');
      pad.className = 'rx-pad';
      if (times.length < 5) {
        state = 'between';
        title.textContent = ms + ' мс';
        text.textContent = 'Нажми для следующего раунда';
      } else {
        finish(avg);
      }
    }
  }

  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    press();
  });
  pad.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      press();
    }
  });
})();

/* ===== ИГРА 2: ТИР ===== */
(function () {
  const arena = $('#aimArena');
  const over = $('#aimOverlay');
  const scoreEl = $('#aimScore');
  const timeEl = $('#aimTime');
  const kinds = [
    { e: '🎯', p: 1, w: 6, life: 1500 },
    { e: '⭐', p: 3, w: 2, life: 900 },
    { e: '💣', p: -3, w: 2, life: 1600 }
  ];
  let running = false, score = 0, endAt = 0, spawnT = null, tickT = null;

  function getBest() {
    try { return +localStorage.getItem('radikAimBest') || 0; } catch (e) { return 0; }
  }
  function setBest(v) {
    try { localStorage.setItem('radikAimBest', v); } catch (e) {}
  }

  function pick() {
    const total = kinds.reduce((a, k) => a + k.w, 0);
    let r = Math.random() * total;
    for (const k of kinds) {
      r -= k.w;
      if (r <= 0) return k;
    }
    return kinds[0];
  }

  function spawn() {
    if (!running) return;
    const total = CONFIG.aimSeconds * 1000;
    const prog = 1 - (endAt - Date.now()) / total;
    const k = pick();
    const b = document.createElement('button');
    b.className = 'aim-t';
    b.textContent = k.e;
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    b.style.left = (10 + Math.random() * (w - 84)) + 'px';
    b.style.top = (44 + Math.random() * (h - 44 - 74)) + 'px';

    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      if (!running || b.dataset.hit) return;
      b.dataset.hit = '1';
      score = Math.max(0, score + k.p);
      scoreEl.textContent = score;
      const r = b.getBoundingClientRect();
      if (k.p > 0) burst(r.left + r.width / 2, r.top + r.height / 2, k.p > 1 ? 30 : 14);
      b.classList.add('hit');
      setTimeout(() => b.remove(), 220);
    });
    arena.appendChild(b);

    setTimeout(() => {
      if (b.parentNode && !b.dataset.hit) {
        b.classList.add('out');
        setTimeout(() => b.remove(), 220);
      }
    }, k.life * (1 - prog * 0.35));

    spawnT = setTimeout(spawn, 720 - prog * 380);
  }

  function tick() {
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    timeEl.textContent = left;
    if (Date.now() >= endAt) end();
  }

  function start() {
    score = 0;
    scoreEl.textContent = 0;
    arena.innerHTML = '';
    running = true;
    endAt = Date.now() + CONFIG.aimSeconds * 1000;
    timeEl.textContent = CONFIG.aimSeconds;
    over.classList.add('hidden');
    spawn();
    tickT = setInterval(tick, 200);
  }

  function end() {
    running = false;
    clearTimeout(spawnT);
    clearInterval(tickT);
    arena.innerHTML = '';
    let title;
    if (score < 15) title = 'Разминка 🎯';
    else if (score < 35) title = 'Хороший глаз! 👌';
    else {
      title = 'СНАЙПЕР! 🏆';
      fireworks(8);
    }
    const old = getBest();
    let extra = '';
    if (score > old) {
      setBest(score);
      extra = ' Новый рекорд!';
    }
    $('#aimTitle').textContent = title;
    $('#aimText').textContent = 'Очков: ' + score + '. Рекорд: ' + Math.max(score, old) + '.' + extra;
    $('#aimBtn span').textContent = 'Ещё раз';
    over.classList.remove('hidden');
  }

  $('#aimBtn').addEventListener('click', start);
})();

/* ===== ТЕРМИНАЛ С ФРАЗАМИ ===== */
(function () {
  const out = $('#advText');
  let busy = false, last = -1;
  $('#advBtn').addEventListener('click', () => {
    if (busy) return;
    busy = true;
    const list = CONFIG.advice;
    let i;
    do {
      i = Math.floor(Math.random() * list.length);
    } while (i === last && list.length > 1);
    last = i;
    const s = list[i];
    let c = 0;
    out.textContent = '';
    (function t() {
      out.textContent = s.slice(0, c);
      if (c < s.length) {
        c++;
        setTimeout(t, 28);
      } else {
        busy = false;
      }
    })();
  });
})();

/* ===== СЕКРЕТНЫЙ ФАЙЛ ===== */
(function () {
  const box = $('#vaultText');
  const lock = $('#lock');
  const status = $('#vaultStatus');
  const btn = $('#decryptBtn');
  const fire = $('#fireBtn');
  const full = CONFIG.message.join('\n\n');
  const glyphs = '█▓▒░#@$%&*+=<>/|0123456789';
  let busy = false;

  function glyph() {
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  function scrambled(p) {
    const lim = full.length * p;
    let out = '';
    for (let i = 0; i < full.length; i++) {
      const ch = full[i];
      if (/\s/.test(ch) || i < lim) out += ch;
      else out += glyph();
    }
    return out;
  }

  box.textContent = scrambled(0);
  box.classList.add('enc');

  function done() {
    box.textContent = full;
    box.classList.remove('enc');
    lock.classList.remove('shake');
    lock.textContent = '🔓';
    status.textContent = 'Статус: расшифровано ✓';
    status.classList.add('ok');
    btn.style.display = 'none';
    fire.classList.add('show');
    fireworks(6);
  }

  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    status.textContent = 'Статус: расшифровка...';
    lock.classList.add('shake');
    const dur = 5000;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      box.textContent = scrambled(p);
      if (p < 1) requestAnimationFrame(step);
      else done();
    })(start);
  });

  fire.addEventListener('click', () => fireworks(14));
})();

/* ===== НАВЕРХ ===== */
$('#toTop').addEventListener('click', () => {
  scrollTo({ top: 0, behavior: 'smooth' });
});