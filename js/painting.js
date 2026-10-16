/* ============================================================
   PAINTING: draws a baked scene as pencil -> watercolour -> light.

   Each scene is three transparent WebP layers made by tools/art:
     <scene>-<d|m>-sketch   graphite only (always visible, stays on top)
     <scene>-<d|m>-wash     colour, no light
     <scene>-<d|m>-full     colour plus the cinematic light
   Colour is revealed through soft, uneven masks that grow around
   "anchors" (positions listed in js/art-data.js), and the light layer
   fades in last. Nothing here is heavy: one canvas, redrawn only
   while something is changing.

   Painting.create({ scene, host })        layered scene
   Painting.frames({ scene, host, count }) crossfading still frames (the reveal)
   p.pin(el, anchorName)     place an element on an anchor (kept in place)
   p.bloom(name, 0..1, ms)   p.bloomAll(0..1, ms)   p.light(0..1, ms)
   p.near(clientX, clientY)  nearest anchors, for proximity bloom
   ============================================================ */

const Painting = (function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imgCache = {};
  function loadImg(src) {
    if (!imgCache[src]) imgCache[src] = new Promise(function (res) {
      const im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
    return imgCache[src];
  }
  const variantNow = function () { return window.innerWidth / Math.max(1, window.innerHeight) < 0.95 ? 'm' : 'd'; };
  const ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---- shared: size a stage to the painting's aspect inside the host ---- */
  function makeStage(host, getSize) {
    const wrap = document.createElement('div');
    wrap.className = 'pt-wrap';
    const stage = document.createElement('div');
    stage.className = 'pt-stage';
    wrap.appendChild(stage);
    host.classList.add('pt-host');
    host.appendChild(wrap);
    function fit() {
      const hw = host.clientWidth || window.innerWidth, hh = host.clientHeight || window.innerHeight;
      const s = getSize(), m = hw < 700 ? 6 : 14;
      const k = Math.min((hw - m * 2) / s[0], (hh - m * 2) / s[1]);
      stage.style.width = Math.round(s[0] * k) + 'px';
      stage.style.height = Math.round(s[1] * k) + 'px';
      stage.style.setProperty('--u', (s[0] * k / 1000).toFixed(4));   // 1u = 1/1000 of painting width
    }
    return { wrap: wrap, stage: stage, fit: fit };
  }

  function pinning(stage, sceneKey, getVariant) {
    const pins = [];
    function place(pin) {
      const a = (ART.anchors[sceneKey(getVariant())] || {})[pin.name];
      if (!a) { pin.el.hidden = true; return; }
      pin.el.hidden = false;
      pin.el.style.left = (a[0] * 100).toFixed(2) + '%';
      pin.el.style.top = (a[1] * 100).toFixed(2) + '%';
      if (pin.k) { pin.el.style.width = (a[2] * pin.k * 100).toFixed(2) + '%'; pin.el.style.aspectRatio = '1 / ' + (pin.aspect || 1); }
    }
    return {
      pin: function (el, name, opts) {
        el.style.position = 'absolute';
        stage.appendChild(el);
        const p = { el: el, name: name, k: opts && opts.k, aspect: opts && opts.aspect };
        pins.push(p); place(p);
        return el;
      },
      refresh: function () { pins.forEach(place); },
      anchors: function () { return ART.anchors[sceneKey(getVariant())] || {}; }
    };
  }

  /* ============================================================
     LAYERED: sketch + wash + full
     ============================================================ */
  function create(o) {
    let variant = variantNow();
    const key = function (v) { return o.scene + '-' + v; };
    const size = function () { return ART.size[variant]; };
    const st = makeStage(o.host, size);
    const canvas = document.createElement('canvas');
    canvas.className = 'pt-art';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', o.label || '');
    st.stage.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const pinner = pinning(st.stage, key, function () { return variant; });

    const state = { all: 0, light: 0, sketch: 1, b: {} };    // b[name] 0..1
    let imgs = { sketch: null, wash: null, full: null };
    let mask = document.createElement('canvas'), mctx = mask.getContext('2d');
    let tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');
    let dirty = true, raf = 0, dead = false;
    const tweens = [];
    const shapes = {};     // per-anchor irregular blob outlines

    function blobShape(name, k) {
      const id = name + k;
      if (shapes[id]) return shapes[id];
      let s = 0; for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
      const r = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
      const n = 11, pts = [];
      const a0 = r() * 6.28, sx = 0.8 + r() * 0.5, sy = 0.65 + r() * 0.45, dx = (r() - 0.5) * 0.5, dy = (r() - 0.5) * 0.4;
      for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, j = 0.72 + r() * 0.5; pts.push([Math.cos(a) * j * sx + dx, Math.sin(a) * j * sy + dy]); }
      return (shapes[id] = pts);
    }

    function setSize() {
      const s = size();
      canvas.width = s[0]; canvas.height = s[1];
      mask.width = Math.round(s[0] / 2); mask.height = Math.round(s[1] / 2);
      tmp.width = s[0]; tmp.height = s[1];
    }

    function drawMask() {
      const w = mask.width, h = mask.height, an = pinner.anchors();
      mctx.clearRect(0, 0, w, h);
      Object.keys(state.b).forEach(function (name) {
        const b = state.b[name], a = an[name];
        if (!a || b <= 0.001) return;
        const R = (a[2] || 0.12) * w * (0.22 + 1.0 * ease(b));
        for (let k = 0; k < 3; k++) {
          const pts = blobShape(name, k), cx = a[0] * w, cy = a[1] * h, rr = R * (1 - k * 0.12);
          const g = mctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 1.2);
          g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = g;
          mctx.globalAlpha = 0.9;
          mctx.beginPath();
          pts.forEach(function (p, i) {
            const x = cx + p[0] * rr, y = cy + p[1] * rr;
            if (i === 0) mctx.moveTo(x, y);
            else { const q = pts[i - 1]; mctx.quadraticCurveTo(cx + q[0] * rr * 1.08, cy + q[1] * rr * 1.08, (x + cx + q[0] * rr) / 2, (y + cy + q[1] * rr) / 2); }
          });
          mctx.closePath(); mctx.fill();
        }
      });
      mctx.globalAlpha = 1;
      if (state.all > 0.001) { mctx.fillStyle = 'rgba(0,0,0,' + state.all.toFixed(3) + ')'; mctx.fillRect(0, 0, w, h); }
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (imgs.wash) {
        drawMask();
        tctx.globalCompositeOperation = 'source-over';
        tctx.globalAlpha = 1;
        tctx.clearRect(0, 0, W, H);
        tctx.drawImage(imgs.wash, 0, 0, W, H);
        if (state.light > 0.001 && imgs.full) { tctx.globalAlpha = state.light; tctx.drawImage(imgs.full, 0, 0, W, H); tctx.globalAlpha = 1; }
        tctx.globalCompositeOperation = 'destination-in';
        tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(mask, 0, 0, W, H);
        tctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tmp, 0, 0);
      }
      if (imgs.sketch) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = state.sketch; ctx.drawImage(imgs.sketch, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
      dirty = false;
    }

    function loop(t) {
      raf = 0;
      if (dead) return;
      let moving = false;
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i], k = Math.min(1, (t - tw.t0) / tw.ms);
        tw.set(tw.from + (tw.to - tw.from) * (reduce ? k : (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)));
        if (k >= 1) tweens.splice(i, 1); else moving = true;
        dirty = true;
      }
      if (dirty) draw();
      if (moving) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(loop); }
    function tween(get, set, to, ms) {
      for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].set === set) tweens.splice(i, 1);
      const from = get();
      if (Math.abs(from - to) < 0.0005) return;
      if (!ms) { set(to); dirty = true; kick(); return; }
      tweens.push({ from: from, to: to, ms: reduce ? Math.min(ms, 450) : ms, t0: performance.now(), set: set });
      kick();
    }

    const bloomSetters = {};
    const api = {
      stage: st.stage, wrap: st.wrap, canvas: canvas,
      variant: function () { return variant; },
      anchors: pinner.anchors,
      pin: pinner.pin,
      bloom: function (name, to, ms) {
        const set = bloomSetters[name] || (bloomSetters[name] = function (v) { state.b[name] = v; });
        tween(function () { return state.b[name] || 0; }, set, to, ms === undefined ? 1800 : ms);
      },
      bloomLevel: function (name) { return state.b[name] || 0; },
      bloomAll: function (to, ms) { tween(function () { return state.all; }, function (v) { state.all = v; }, to, ms === undefined ? 2600 : ms); },
      light: function (to, ms) { tween(function () { return state.light; }, function (v) { state.light = v; }, to, ms === undefined ? 2600 : ms); },
      lightLevel: function () { return state.light; },
      near: function (cx, cy) {
        const r = st.stage.getBoundingClientRect(), x = (cx - r.left) / r.width, y = (cy - r.top) / r.height, out = [], an = pinner.anchors();
        Object.keys(an).forEach(function (n) {
          const a = an[n], d = Math.hypot((x - a[0]), (y - a[1]) * (r.height / r.width));
          out.push({ name: n, d: d, rad: a[2] || 0.12 });
        });
        return out.sort(function (p, q) { return p.d - q.d; });
      },
      redraw: function () { dirty = true; kick(); },
      destroy: function () { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); if (st.wrap.parentNode) st.wrap.parentNode.removeChild(st.wrap); },
      onVariant: null
    };

    function loadLayers() {
      const v = variant, base = 'assets/art/' + o.scene + '-' + v + '-';
      return Promise.all([loadImg(base + 'sketch.webp'), loadImg(base + 'wash.webp'), loadImg(base + 'full.webp')]).then(function (r) {
        if (dead || v !== variant) return;
        imgs = { sketch: r[0], wash: r[1], full: r[2] };
        dirty = true; kick();
      });
    }
    function onResize() {
      const v = variantNow();
      st.fit();
      if (v !== variant) { variant = v; setSize(); pinner.refresh(); loadLayers().then(function () { if (api.onVariant) api.onVariant(v); }); }
    }
    window.addEventListener('resize', onResize);
    setSize(); st.fit();
    api.ready = loadLayers();
    return api;
  }

  /* ============================================================
     FRAMES: crossfading stills (the birthday reveal)
     ============================================================ */
  function frames(o) {
    let variant = variantNow();
    const key = function (v) { return (o.anchorKey || o.scene) + '-' + v; };
    const st = makeStage(o.host, function () { return ART.size[variant]; });
    const pinner = pinning(st.stage, key, function () { return variant; });
    const imgsEls = [];
    for (let i = 0; i < o.count; i++) {
      const im = document.createElement('img');
      im.className = 'pt-frame'; im.alt = i === 0 ? (o.label || '') : ''; im.decoding = 'async';
      if (i !== 0) im.setAttribute('aria-hidden', 'true');
      im.style.opacity = i === 0 ? '1' : '0';
      st.stage.appendChild(im); imgsEls.push(im);
    }
    function src(i) { return 'assets/art/' + o.scene + i + '-' + variant + '-full.webp'; }
    function setSrcs() { imgsEls.forEach(function (im, i) { im.src = src(i); }); }
    let level = 0;
    function onResize() {
      const v = variantNow(); st.fit();
      if (v !== variant) { variant = v; setSrcs(); pinner.refresh(); }
    }
    window.addEventListener('resize', onResize);
    st.fit(); setSrcs();
    const api = {
      stage: st.stage, wrap: st.wrap, pin: pinner.pin, anchors: pinner.anchors,
      // 0..(count-1), fractional values crossfade between neighbours
      show: function (v) {
        level = v;
        imgsEls.forEach(function (im, i) { im.style.opacity = String(Math.max(0, 1 - Math.abs(v - i))); });
      },
      level: function () { return level; },
      destroy: function () { window.removeEventListener('resize', onResize); if (st.wrap.parentNode) st.wrap.parentNode.removeChild(st.wrap); },
      ready: Promise.all(imgsEls.map(function (im) { return new Promise(function (r) { im.addEventListener('load', r); im.addEventListener('error', r); }); }))
    };
    return api;
  }

  return { create: create, frames: frames, variant: variantNow };
})();
