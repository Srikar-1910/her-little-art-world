/* ============================================================
   UI — small shared helpers used by every scene.

   h()           build DOM without innerHTML
   sheet()       a paper sheet that rises over the scene (not a modal box)
   toast()       a little paper slip at the bottom
   hotspot()     make an SVG/HTML object keyboard- and touch-friendly
   drag()        pointer drag with capture (mouse + touch)
   panorama()    wide scenes: fit on desktop, pan sideways on phones
   loadImage()   preload with a graceful "did it load?" answer
   stamp()       the little "placeholder" tag
   say()         announce something to screen readers
   ============================================================ */

const UI = (function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny utilities ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Seeded random: the same seed always draws the same picture.
  function rng(seed) {
    let a = (typeof seed === 'string' ? hashStr(seed) : (seed | 0)) + 0x6D2B79F5;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---------- h(): build elements ---------- */
  function h(tag, props) {
    const el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        const v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'on') Object.keys(v).forEach(function (ev) { el.addEventListener(ev, v[ev]); });
        else if (k === 'style') {
          if (typeof v === 'string') el.setAttribute('style', v);
          else Object.keys(v).forEach(function (s) { el.style.setProperty(s, v[s]); });
        }
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (let i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }

  /* ---------- placeholder stamp ---------- */
  function stamp(item) {
    if (!item || !item.placeholder || !CONFIG.showPlaceholderLabels) return null;
    return h('span', { class: 'stamp', title: 'Placeholder: replace this in /content' }, 'placeholder');
  }

  /* ---------- screen reader announcements ---------- */
  function say(text) {
    const live = $('#live');
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 60);
  }

  /* ---------- torn paper edge ---------- */
  function tornClip(seed, amp) {
    const r = rng(seed || 7), a = amp || 0.9, n = 28, p = [];
    for (let i = 0; i <= n; i++) p.push((i / n * 100).toFixed(2) + '% ' + (r() * a * 0.6).toFixed(2) + '%');
    for (let i = 1; i <= n; i++) p.push((100 - r() * a * 0.4).toFixed(2) + '% ' + (i / n * 100).toFixed(2) + '%');
    for (let i = n - 1; i >= 0; i--) p.push((i / n * 100).toFixed(2) + '% ' + (100 - r() * a).toFixed(2) + '%');
    for (let i = n - 1; i > 0; i--) p.push((r() * a * 0.4).toFixed(2) + '% ' + (i / n * 100).toFixed(2) + '%');
    return 'polygon(' + p.join(',') + ')';
  }

  /* ============================================================
     SHEET — paper that rises over the scene
     opts: { title, kicker, body(Node|Node[]), foot, tone, wide, label, onClose, seed }
     ============================================================ */
  const stack = [];

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  function sheet(opts) {
    opts = opts || {};
    const returnTo = document.activeElement;
    const closeBtn = h('button', { class: 'sheet-close', type: 'button', 'aria-label': 'Close' },
      h('span', { 'aria-hidden': 'true' }, '×'));

    const head = (opts.kicker || opts.title) ? h('header', { class: 'sheet-head' },
      opts.kicker ? h('p', { class: 'sheet-kicker' }, opts.kicker) : null,
      opts.title ? h('h2', { class: 'sheet-title' }, opts.title) : null,
      opts.stamp ? opts.stamp : null) : null;

    const body = h('div', { class: 'sheet-body' }, opts.body || null);
    const foot = opts.foot ? h('footer', { class: 'sheet-foot' }, opts.foot) : null;

    const paper = h('div', {
      class: 'sheet tone-' + (opts.tone || 'paper') + (opts.wide ? ' wide' : ''),
      role: 'dialog', 'aria-modal': 'true',
      'aria-label': opts.label || opts.title || 'Note',
      tabindex: '-1',
      style: { 'clip-path': tornClip(opts.seed || (opts.title ? hashStr(opts.title) : 11)) }
    }, closeBtn, head, body, foot);

    const wrap = h('div', { class: 'sheet-wrap' }, paper);
    const layer = h('div', { class: 'sheet-layer' }, wrap);
    document.body.appendChild(layer);

    let closed = false;
    function close(silent) {
      if (closed) return;
      closed = true;
      const i = stack.indexOf(api);
      if (i !== -1) stack.splice(i, 1);
      layer.classList.remove('in');
      setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, reduceMotion ? 20 : 420);
      if (returnTo && returnTo.focus && document.contains(returnTo)) {
        try { returnTo.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
      if (!silent && opts.onClose) opts.onClose();
    }

    closeBtn.addEventListener('click', function () { close(); });
    layer.addEventListener('pointerdown', function (e) { if (e.target === layer || e.target === wrap) close(); });
    paper.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const f = $$(FOCUSABLE, paper).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    const api = { el: paper, body: body, layer: layer, close: close };
    stack.push(api);
    requestAnimationFrame(function () {
      layer.classList.add('in');
      const target = $('[autofocus]', paper) || paper;
      try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    });
    if (opts.title) say(opts.title);
    return api;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && stack.length) {
      e.preventDefault();
      stack[stack.length - 1].close();
    }
  });

  /* ============================================================
     TOAST — a small paper slip
     ============================================================ */
  let toastTimer = null;
  function toast(text, ms) {
    let box = $('#toast');
    if (!box) return;
    box.textContent = text;
    box.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove('on'); }, ms || 3600);
  }

  /* ============================================================
     HOTSPOT — accessible, keyboard-friendly interactive object
     ============================================================ */
  function hotspot(el, opts) {
    if (!el) return null;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', opts.tabindex == null ? '0' : String(opts.tabindex));
    el.setAttribute('aria-label', opts.label || '');
    el.classList.add('hotspot');
    function act(e) {
      if (el.__swallow) { el.__swallow = false; return; }
      if (opts.onActivate) opts.onActivate(e, el);
    }
    el.addEventListener('click', act);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(e); }
    });
    return el;
  }

  /* ============================================================
     DRAG — pointer drag that works with mouse and touch
     handlers: onStart(e, st), onMove(e, st, delta), onEnd(e, st)
     ============================================================ */
  function drag(el, hnd) {
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const st = { id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, x: e.clientX, y: e.clientY, moved: false };
      let lx = e.clientX, ly = e.clientY;
      if (hnd.onStart) hnd.onStart(e, st);

      const blockScroll = function (ev) { ev.preventDefault(); };
      el.addEventListener('touchmove', blockScroll, { passive: false });

      const move = function (ev) {
        if (ev.pointerId !== st.id) return;
        st.dx = ev.clientX - st.sx; st.dy = ev.clientY - st.sy;
        st.x = ev.clientX; st.y = ev.clientY;
        if (Math.hypot(st.dx, st.dy) > 4) st.moved = true;
        const d = { x: ev.clientX - lx, y: ev.clientY - ly };
        lx = ev.clientX; ly = ev.clientY;
        if (hnd.onMove) hnd.onMove(ev, st, d);
      };
      const up = function (ev) {
        if (ev.pointerId !== st.id) return;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('touchmove', blockScroll);
        try { el.releasePointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
        if (st.moved) el.__swallow = true;          // a drag is not also a click
        setTimeout(function () { el.__swallow = false; }, 0);
        if (hnd.onEnd) hnd.onEnd(ev, st);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }

  /* ============================================================
     IMAGES — "did it load?" with a cache
     ============================================================ */
  const imgCache = {};
  function loadImage(src) {
    if (!src) return Promise.resolve(false);
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (resolve) {
      const i = new Image();
      i.onload = function () { resolve(true); };
      i.onerror = function () { resolve(false); };
      i.src = src;
    });
    return imgCache[src];
  }

  /* ============================================================
     PANORAMA — wide scenes
     On a wide screen the scene simply fits. On a narrow/portrait
     screen it becomes a sideways-scrolling painting, with edge
     arrows and mouse-drag for people without touch.
     ============================================================ */
  function panorama(stage, opts) {
    opts = opts || {};
    const parent = stage.parentNode;
    const left = h('button', { class: 'pan-edge left', type: 'button', 'aria-label': 'Look left' }, h('span', { 'aria-hidden': 'true' }, '‹'));
    const right = h('button', { class: 'pan-edge right', type: 'button', 'aria-label': 'Look right' }, h('span', { 'aria-hidden': 'true' }, '›'));
    const hint = h('p', { class: 'pan-hint', 'aria-hidden': 'true' }, 'swipe to look around');
    parent.appendChild(left); parent.appendChild(right); parent.appendChild(hint);

    function maxScroll() { return stage.scrollWidth - stage.clientWidth; }
    function update() {
      const m = maxScroll();
      const can = m > 6;
      left.classList.toggle('on', can && stage.scrollLeft > 8);
      right.classList.toggle('on', can && stage.scrollLeft < m - 8);
      hint.classList.toggle('on', can && !stage.__panned);
    }
    function centerOn(frac, smooth) {
      const m = maxScroll();
      if (m <= 0) return;
      const target = clamp(frac * stage.scrollWidth - stage.clientWidth / 2, 0, m);
      stage.scrollTo({ left: target, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    }
    left.addEventListener('click', function () { stage.scrollBy({ left: -stage.clientWidth * 0.6, behavior: 'smooth' }); });
    right.addEventListener('click', function () { stage.scrollBy({ left: stage.clientWidth * 0.6, behavior: 'smooth' }); });

    stage.addEventListener('scroll', function () {
      if (Math.abs(stage.scrollLeft - (stage.__lastLeft || 0)) > 24) stage.__panned = true;
      update();
    }, { passive: true });

    // Mouse drag-to-pan (touch already scrolls natively).
    let down = null, dragged = false;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || maxScroll() <= 6) return;
      down = { x: e.clientX, left: stage.scrollLeft };
      dragged = false;
    });
    function onMove(e) {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) { dragged = true; stage.classList.add('dragging'); }
      if (dragged) stage.scrollLeft = down.left - dx;
    }
    function onUp() {
      if (!down) return;
      down = null;
      stage.classList.remove('dragging');
      if (dragged) setTimeout(function () { dragged = false; }, 0);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    stage.addEventListener('click', function (e) {
      if (dragged) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    window.addEventListener('resize', update);
    setTimeout(update, 60);
    if (opts.focus != null) { requestAnimationFrame(function () { centerOn(opts.focus, false); update(); }); }

    // Keep keyboard focus visible when tabbing to something off-screen.
    stage.addEventListener('focusin', function (e) {
      const t = e.target;
      if (!t || !t.getBoundingClientRect || maxScroll() <= 6) return;
      const r = t.getBoundingClientRect(), s = stage.getBoundingClientRect();
      if (r.left < s.left + 20 || r.right > s.right - 20) {
        stage.scrollBy({ left: (r.left + r.width / 2) - (s.left + s.width / 2), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });

    return {
      centerOn: centerOn,
      update: update,
      destroy: function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('resize', update);
      }
    };
  }

  /* ---------- where something is on screen ---------- */
  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  return {
    $: $, $$: $$, h: h, esc: esc, rng: rng, hashStr: hashStr, clamp: clamp, lerp: lerp, fmtTime: fmtTime,
    stamp: stamp, say: say, tornClip: tornClip, sheet: sheet, toast: toast,
    hotspot: hotspot, drag: drag, loadImage: loadImage, panorama: panorama, centerOf: centerOf,
    reduceMotion: reduceMotion,
    hasOpenSheet: function () { return stack.length > 0; },
    closeAllSheets: function () { stack.slice().forEach(function (s) { s.close(true); }); }
  };
})();
