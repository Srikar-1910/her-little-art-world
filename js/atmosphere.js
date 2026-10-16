/* ============================================================
   ATMOSPHERE — the soft moving light over every scene.

   Descended from the Stardust particle engine: the same
   pre-rendered glow sprites (fast), the same bursts, and the same
   "particles gather into a shape" idea — but now the sky is warm
   and the stars are fireflies, dust in sunbeams, drifting petals.

   One transparent canvas sits above the painted scenes and below
   the interface. It never intercepts a tap.

   API
     Atmosphere.init(canvas)
     Atmosphere.setMood('world'|'studio'|'garden'|...)
     Atmosphere.sparkle(x, y, color?)       small glittering burst
     Atmosphere.burst(x, y, color, n, power)
     Atmosphere.confetti(x, y, n)           paint-dab confetti
     Atmosphere.gather(points, opts)        particles fly into a shape
     Atmosphere.releaseGather()
     Atmosphere.shapes.flower(cx, cy, r, n) point cloud of a 6-petal bloom
     Atmosphere.setPointer(x, y)            fireflies are curious about it
   ============================================================ */

const Atmosphere = (function () {
  'use strict';

  const C = CONFIG.colors;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cv = null, ctx = null, W = 0, H = 0, DPR = 1;
  let last = 0, t = 0, running = false, rafId = 0;
  let mood = 'none', moodFade = 1;
  let flies = [], motes = [], petals = [], embers = [], bursts = [], confettiBits = [], shooters = [];
  let gather = null;
  const pointer = { x: -999, y: -999 };

  const rnd = function (a, b) { return a + Math.random() * (b - a); };
  const pick = function (a) { return a[(Math.random() * a.length) | 0]; };
  const lerp = function (a, b, k) { return a + (b - a) * k; };
  const ease = function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };

  const MOODS = {
    none:      {},
    entrance:  { flies: 24, motes: 16, shooting: 0.0006 },
    world:     { flies: 22, motes: 22, petals: 9 },
    studio:    { motes: 38 },
    garden:    { flies: 30, motes: 8, petals: 16 },
    gallery:   { motes: 26 },
    listening: { motes: 10, embers: 14 },
    desk:      { motes: 14, embers: 16 },
    reveal:    { flies: 12, motes: 18, petals: 8, shooting: 0.0004 }
  };

  /* ---------- glow sprites ---------- */
  const sprites = {};
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }
  function glow(color, soft) {
    const key = color + '|' + soft;
    if (sprites[key]) return sprites[key];
    const S = 96, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d'), rgb = hexToRgb(color);
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'rgba(' + rgb + ',1)');
    grd.addColorStop(soft * 0.35, 'rgba(' + rgb + ',.55)');
    grd.addColorStop(soft, 'rgba(' + rgb + ',.12)');
    grd.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    sprites[key] = c;
    return c;
  }
  function blit(sp, x, y, r, a) {
    if (a <= 0.004) return;
    ctx.globalAlpha = a;
    ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
  }

  /* ---------- building a mood ---------- */
  function scale() {
    const small = Math.min(W, H) < 560 ? 0.6 : 1;
    return CONFIG.atmosphere.density * small * (reduce ? 0.35 : 1);
  }

  function rebuild() {
    const m = MOODS[mood] || {}, k = scale();
    flies = []; motes = []; petals = []; embers = [];
    const nf = Math.round((m.flies || 0) * k);
    for (let i = 0; i < nf; i++) flies.push({
      x: rnd(0, W), y: rnd(0, H), a: rnd(0, 6.283), sp: rnd(0.12, 0.42),
      ph: rnd(0, 6.283), r: rnd(3, 6), bl: rnd(0.5, 1.4)
    });
    const nm = Math.round((m.motes || 0) * k);
    for (let i = 0; i < nm; i++) motes.push({
      x: rnd(0, W), y: rnd(0, H), r: rnd(1.5, 4.5), a: rnd(0.12, 0.42),
      ph: rnd(0, 6.283), vy: rnd(0.04, 0.2), sw: rnd(0.1, 0.4)
    });
    const np = Math.round((m.petals || 0) * k);
    for (let i = 0; i < np; i++) petals.push(newPetal(true));
    const ne = Math.round((m.embers || 0) * k);
    for (let i = 0; i < ne; i++) embers.push(newEmber(true));
    moodFade = 0;
  }

  function newPetal(anywhere) {
    return {
      x: rnd(-20, W + 20), y: anywhere ? rnd(-20, H) : rnd(-40, -10),
      sz: rnd(4, 8), rot: rnd(0, 6.283), vr: rnd(-0.02, 0.02),
      vy: rnd(0.25, 0.7), sw: rnd(0.3, 0.9), ph: rnd(0, 6.283), color: pick(C.petals)
    };
  }
  function newEmber(anywhere) {
    return {
      x: rnd(0, W), y: anywhere ? rnd(0, H) : H + 10, r: rnd(2, 5),
      vy: rnd(0.12, 0.4), ph: rnd(0, 6.283), life: rnd(0.4, 1)
    };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, Math.min(W, H) < 560 ? 1.5 : 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- effects ---------- */
  function burst(x, y, color, count, power) {
    count = reduce ? Math.ceil(count * 0.4) : count;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * 6.283, sp = rnd(0.35, 1) * power;
      bursts.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: rnd(0.8, 2.4), life: 1, decay: rnd(0.008, 0.02), color: color
      });
    }
  }

  function confetti(x, y, n) {
    n = reduce ? Math.ceil((n || 60) * 0.3) : (n || 60);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rnd(-1.1, 1.1), sp = rnd(3, 9);
      confettiBits.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        rot: rnd(0, 6.283), vr: rnd(-0.25, 0.25),
        w: rnd(4, 9), h: rnd(2.5, 5), color: pick(C.confetti), life: 1
      });
    }
  }

  function shootingStar() {
    const fromLeft = Math.random() < 0.5;
    shooters.push({
      x: fromLeft ? rnd(-0.1, 0.4) * W : rnd(0.6, 1.1) * W, y: rnd(0, 0.4) * H,
      vx: (fromLeft ? 1 : -1) * rnd(5, 8), vy: rnd(1.5, 3), life: 1, len: rnd(80, 170)
    });
  }

  function startGather(points, opts) {
    opts = opts || {};
    const from = opts.from || { x: W / 2, y: H * 0.9 };
    const list = [];
    for (let i = 0; i < points.length; i++) {
      const sx = from.x + rnd(-W * 0.5, W * 0.5), sy = from.y + rnd(-H * 0.2, H * 0.25);
      list.push({
        sx: sx, sy: sy, tx: points[i].x, ty: points[i].y,
        delay: rnd(0, 70), p: 0, sw: rnd(-80, 80), ph: rnd(0, 6.283),
        r: rnd(2, 5), color: pick(opts.colors || C.petals)
      });
    }
    gather = { pts: list, t: 0, done: false, fading: false, fade: 1, onDone: opts.onDone || null };
  }

  /* ---------- drawing ---------- */
  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 16.667, 3) * CONFIG.atmosphere.speed * (reduce ? 0.5 : 1);
    last = now; t += dt;
    moodFade = Math.min(1, moodFade + 0.012 * dt);
    ctx.clearRect(0, 0, W, H);

    drawPetals(dt);
    drawConfetti(dt);

    ctx.globalCompositeOperation = 'lighter';
    drawMotes(dt);
    drawEmbers(dt);
    drawFlies(dt);
    drawShooters(dt);
    drawGather(dt);
    drawBursts(dt);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const m = MOODS[mood] || {};
    if (m.shooting && !reduce && Math.random() < m.shooting * dt) shootingStar();

    rafId = requestAnimationFrame(frame);
  }

  function drawMotes(dt) {
    if (!motes.length) return;
    const sp = glow(C.mote, 0.6);
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.y -= m.vy * dt; m.x += Math.sin(t * 0.006 + m.ph) * m.sw * dt;
      if (m.y < -10) { m.y = H + 10; m.x = rnd(0, W); }
      const a = m.a * (0.55 + 0.45 * Math.sin(t * 0.02 + m.ph)) * moodFade;
      blit(sp, m.x, m.y, m.r * 3, a);
    }
  }

  function drawEmbers(dt) {
    if (!embers.length) return;
    const sp = glow('#ffcf8a', 0.55);
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.y -= e.vy * dt; e.x += Math.sin(t * 0.01 + e.ph) * 0.25 * dt;
      if (e.y < -10) Object.assign(e, newEmber(false));
      const a = (0.15 + 0.5 * Math.max(0, Math.sin(t * 0.03 + e.ph))) * e.life * moodFade;
      blit(sp, e.x, e.y, e.r * 3, a);
    }
  }

  function drawFlies(dt) {
    if (!flies.length) return;
    const sp = glow(C.firefly, 0.5);
    for (let i = 0; i < flies.length; i++) {
      const f = flies[i];
      f.a += (Math.random() - 0.5) * 0.12 * dt;
      // curious: drift gently toward the pointer when it is near
      const dx = pointer.x - f.x, dy = pointer.y - f.y, d = Math.hypot(dx, dy);
      if (d < 180 && d > 10) { f.x += (dx / d) * 0.12 * dt; f.y += (dy / d) * 0.12 * dt; }
      f.x += Math.cos(f.a) * f.sp * dt; f.y += Math.sin(f.a) * f.sp * 0.7 * dt;
      if (f.x < -20) f.x = W + 20; if (f.x > W + 20) f.x = -20;
      if (f.y < -20) f.y = H + 20; if (f.y > H + 20) f.y = -20;
      const b = Math.pow(Math.max(0, Math.sin(t * 0.03 * f.bl + f.ph)), 2);
      blit(sp, f.x, f.y, f.r * 4.5, (0.12 + 0.88 * b) * 0.85 * moodFade);
    }
  }

  function drawPetals(dt) {
    if (!petals.length) return;
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y += p.vy * dt; p.x += Math.sin(t * 0.012 + p.ph) * p.sw * dt; p.rot += p.vr * dt;
      if (p.y > H + 20) petals[i] = newPetal(false);
      ctx.globalAlpha = 0.75 * moodFade;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, p.sz, p.sz * 0.52, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawConfetti(dt) {
    if (!confettiBits.length) return;
    for (let i = confettiBits.length - 1; i >= 0; i--) {
      const c = confettiBits[i];
      c.vy += 0.14 * dt; c.vx *= 0.992; c.vy *= 0.992;
      c.x += c.vx * dt + Math.sin(t * 0.1 + c.rot) * 0.4; c.y += c.vy * dt; c.rot += c.vr * dt;
      c.life -= 0.0055 * dt;
      if (c.life <= 0 || c.y > H + 30) { confettiBits.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, c.life * 1.6);
      ctx.fillStyle = c.color;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.975; p.vy *= 0.975;
      p.life -= p.decay * dt;
      if (p.life <= 0) { bursts.splice(i, 1); continue; }
      blit(glow(p.color, 0.5), p.x, p.y, p.r * 6, p.life * 0.55);
    }
  }

  function drawShooters(dt) {
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.007 * dt;
      if (s.life <= 0 || s.x < -300 || s.x > W + 300) { shooters.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * s.len / 6, s.y - s.vy * s.len / 6);
      g.addColorStop(0, 'rgba(255,241,201,' + 0.8 * s.life + ')');
      g.addColorStop(1, 'rgba(255,241,201,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * s.len / 6, s.y - s.vy * s.len / 6); ctx.stroke();
    }
  }

  function drawGather(dt) {
    if (!gather) return;
    gather.t += dt;
    let sum = 0;
    for (let i = 0; i < gather.pts.length; i++) {
      const g = gather.pts[i];
      if (gather.t > g.delay) g.p = Math.min(1, g.p + 0.0085 * dt);
      sum += g.p;
      const k = ease(g.p);
      const arc = Math.sin(k * Math.PI) * g.sw;
      let x = lerp(g.sx, g.tx, k) + arc;
      let y = lerp(g.sy, g.ty, k) - Math.abs(arc) * 0.4;
      if (g.p >= 1) { x += Math.sin(t * 0.04 + g.ph) * 1.4; y += Math.cos(t * 0.035 + g.ph) * 1.4; }
      const tw = g.p >= 1 ? 0.55 + 0.45 * Math.sin(t * 0.05 + g.ph) : 0.9;
      blit(glow(g.color, 0.55), x, y, g.r * 4, 0.8 * tw * gather.fade);
    }
    if (!gather.done && sum / gather.pts.length > 0.985) {
      gather.done = true;
      if (gather.onDone) gather.onDone();
    }
    if (gather.fading) {
      gather.fade -= 0.012 * dt;
      if (gather.fade <= 0) gather = null;
    }
  }

  /* ---------- point clouds ---------- */
  const shapes = {
    // A six-petal bloom, filled. Used in the birthday reveal.
    flower: function (cx, cy, r, n) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const th = Math.random() * 6.283;
        const edge = r * (0.32 + 0.68 * Math.abs(Math.cos(3 * th)));
        const u = Math.pow(Math.random(), 0.65);
        pts.push({ x: cx + Math.cos(th) * edge * u, y: cy + Math.sin(th) * edge * u });
      }
      return pts;
    }
  };

  /* ---------- public ---------- */
  return {
    init(canvas) {
      cv = canvas;
      ctx = cv.getContext('2d');
      W = window.innerWidth; H = window.innerHeight;
      resize();
      window.addEventListener('resize', function () { resize(); rebuild(); }, { passive: true });
      window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
        else if (!running) { running = true; last = performance.now(); rafId = requestAnimationFrame(frame); }
      });
      running = true; last = performance.now();
      rafId = requestAnimationFrame(frame);
      return this;
    },

    setMood(name) {
      if (name === mood) return;
      mood = MOODS[name] ? name : 'none';
      rebuild();
    },

    setPointer(x, y) { pointer.x = x; pointer.y = y; },

    sparkle(x, y, color) { burst(x, y, color || C.spark, 16, 1.6); },
    burst: burst,
    confetti: confetti,

    gather: startGather,
    releaseGather() { if (gather) gather.fading = true; },
    isGathered() { return !!(gather && gather.done); },

    shapes: shapes,
    size() { return { W: W, H: H }; }
  };
})();
