/* ============================================================
   ROUTER — scene registry, iris transitions, browser history.

   Each scene lives in js/scenes/<name>.js and registers itself:
     Router.register('studio', { title, mood, mount(ctx) { ...; return { unmount() {} }; } })

   Router.go('studio', { origin: {x, y} })   open a scene (the new scene
                                             opens like an iris from that point)
   Router.toWorld()                          back to the main world
   Loaded BEFORE the scenes so they can register.
   ============================================================ */

const Router = (function () {
  'use strict';

  const root = document.getElementById('scenes');
  const defs = {};
  let cur = null;
  let pendingOrigin = null;

  const placeIds = function () { return WORLD.places.map(function (p) { return p.id; }); };
  const isPlace = function (id) { return placeIds().indexOf(id) !== -1; };

  function register(id, def) { defs[id] = def; }

  function mountScene(id, from) {
    const def = defs[id];
    const el = UI.h('section', { class: 'scene scene-' + id, 'data-scene': id, 'aria-label': def.title || id });
    const ui = UI.h('div', { class: 'scene-ui' });
    el.appendChild(ui);
    root.appendChild(el);
    const ctx = { id: id, el: el, ui: ui, from: from, def: def };
    const inst = def.mount(ctx) || {};
    return { id: id, el: el, inst: inst, def: def };
  }

  function show(id, opts) {
    opts = opts || {};
    if (!defs[id]) id = 'world';
    if (cur && cur.id === id) return;

    // clear anything left behind by an interrupted transition
    Array.prototype.slice.call(root.children).forEach(function (n) {
      if (!cur || n !== cur.el) n.parentNode.removeChild(n);
    });

    const prev = cur;
    const next = mountScene(id, prev && prev.id);

    if (!prev || opts.instant) {
      next.el.classList.add('fade');
      requestAnimationFrame(function () { requestAnimationFrame(function () { next.el.classList.add('go'); }); });
    } else if (UI.reduceMotion) {
      next.el.classList.add('fade');
      requestAnimationFrame(function () { requestAnimationFrame(function () { next.el.classList.add('go'); }); });
    } else {
      const o = opts.origin || pendingOrigin || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      next.el.style.setProperty('--ox', Math.round(o.x) + 'px');
      next.el.style.setProperty('--oy', Math.round(o.y) + 'px');
      next.el.classList.add('iris');
      void next.el.offsetWidth;
      requestAnimationFrame(function () { next.el.classList.add('go'); });
    }
    pendingOrigin = null;
    if (prev) prev.el.classList.add('leaving');

    cur = next;
    document.body.dataset.scene = id;
    Atmosphere.setMood(next.def.mood || 'none');
    UI.closeAllSheets();
    HUD.sync(id);
    if (isPlace(id)) Store.add('visited', id);
    UI.say(next.def.title || id);

    setTimeout(function () {
      if (prev) {
        if (prev.inst && prev.inst.unmount) { try { prev.inst.unmount(); } catch (e) { /* ignore */ } }
        if (prev.el.parentNode) prev.el.parentNode.removeChild(prev.el);
      }
      next.el.classList.remove('iris', 'fade', 'go');
      next.el.style.removeProperty('clip-path');
    }, UI.reduceMotion ? 300 : 1150);
  }

  function stateOf() { return window.history.state || {}; }

  function go(id, opts) {
    opts = opts || {};
    const st = stateOf();
    const state = { id: id, depth: opts.replace ? (st.depth || 0) : (st.depth || 0) + 1, prev: cur ? cur.id : null };
    try {
      if (opts.replace) window.history.replaceState(state, '', '#' + id);
      else window.history.pushState(state, '', '#' + id);
    } catch (e) { /* file:// quirks: navigation still works without history */ }
    show(id, opts);
  }

  // The on-screen "back to the world" button.
  function toWorld(origin) {
    if (!cur || cur.id === 'world') return;
    const st = stateOf();
    if (st.prev === 'world' && st.depth > 0) {
      pendingOrigin = origin || null;
      window.history.back();
    } else {
      go('world', { origin: origin });
    }
  }

  window.addEventListener('popstate', function (e) {
    const id = (e.state && e.state.id) || window.location.hash.replace('#', '') || 'world';
    show(id, { origin: pendingOrigin });
  });

  return {
    register: register, go: go, show: show, toWorld: toWorld,
    current: function () { return cur; },
    isPlace: isPlace,
    has: function (id) { return !!defs[id]; }
  };
})();

