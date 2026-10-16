/* ============================================================
   MAIN — the few always-there controls, and boot.

   HUD    back, places, sound, and the small "✦ n" discovery count
   boot   starts everything on page load
          (the Router lives in router.js and the scenes in js/scenes/)
   ============================================================ */

/* ============================================================
   HUD
   ============================================================ */
const HUD = (function () {
  'use strict';

  const hud = document.getElementById('hud');
  const back = document.getElementById('backBtn');
  const soundBtn = document.getElementById('soundBtn');
  const placesBtn = document.getElementById('placesBtn');

  function refresh() {
    soundBtn.setAttribute('aria-pressed', Sound.isOn() ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', Sound.isOn() ? 'Sound on. Press to mute' : 'Sound off. Press to turn on');
  }

  function sync(sceneId) {
    hud.hidden = sceneId === 'entrance';
    const showBack = sceneId !== 'entrance' && sceneId !== 'world';
    back.hidden = !showBack;
    refresh();
  }

  /* ---------- the Places sheet ---------- */
  function openPlaces() {
    const list = UI.h('ul', { class: 'places-list' });
    WORLD.places.forEach(function (p) {
      const visited = Store.has('visited', p.id);
      const btn = UI.h('button', {
        class: 'places-item' + (visited ? ' visited' : ''), type: 'button',
        on: { click: function () {
          const c = UI.centerOf(btn);
          sh.close(true);
          Router.go(p.id, { origin: c });
        } }
      },
        UI.h('span', { class: 'pi-dot', 'aria-hidden': 'true' }, '✦'),
        UI.h('span', { class: 'pi-name' }, p.label),
        UI.h('span', { class: 'pi-blurb' }, p.blurb),
        null);
      list.appendChild(UI.h('li', null, btn));
    });

    const body = UI.h('div', null, list, UI.h('hr', { class: 'places-sep' }),
      UI.h('div', { class: 'sheet-foot' },
        UI.h('button', { class: 'text-btn', type: 'button', on: { click: function () { sh.close(true); Router.go('world'); } } }, 'The whole little world'),
        UI.h('button', { class: 'text-btn', type: 'button', on: { click: function () { sh.close(true); confirmReset(); } } }, 'Begin again')));

    const sh = UI.sheet({ kicker: 'wander anywhere', title: 'Places', body: body, seed: 5 });
  }

  function confirmReset() {
    const body = UI.h('div', null,
      UI.h('p', null, 'Everything opened, bloomed and found will close up again, as if she had never been.'),
      UI.h('div', { class: 'sheet-foot' },
        UI.h('button', { class: 'btn small', type: 'button', autofocus: true, on: { click: function () {
          Store.reset();
          try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* ignore */ }
          window.location.reload();
        } } }, 'Begin again'),
        UI.h('button', { class: 'text-btn', type: 'button', on: { click: function () { sh.close(); } } }, 'Never mind')));
    const sh = UI.sheet({ kicker: 'a fresh start?', title: 'Begin again', body: body, seed: 9 });
  }

  function bind() {
    back.addEventListener('click', function () { Router.toWorld(UI.centerOf(back)); });
    placesBtn.addEventListener('click', openPlaces);
    soundBtn.addEventListener('click', function () { Sound.unlock(); Sound.toggle(); refresh(); });
  }

  return { bind: bind, sync: sync, refresh: refresh, openPlaces: openPlaces };
})();

/* ============================================================
   BOOT
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     PRE-PUBLISH CHECKLIST.  Run  HLAW.audit()  in the browser console.
     It never reports a green result while any placeholder, dev
     example, missing photo, missing audio or missing alt text remains.
     ------------------------------------------------------------ */
  function fileExists(src, kind) {
    if (kind === 'audio') {
      return new Promise(function (res) {
        const a = new Audio(); let done = false;
        const fin = function (ok) { if (!done) { done = true; res(ok); } };
        a.addEventListener('loadedmetadata', function () { fin(true); }, { once: true });
        a.addEventListener('error', function () { fin(false); }, { once: true });
        setTimeout(function () { fin(false); }, 4000);
        a.preload = 'metadata'; a.src = src;
      });
    }
    return UI.loadImage(src);
  }

  function audit() {
    const rows = [], checks = [];
    const add = function (where, item, problem, file) { rows.push({ where: where, item: item, problem: problem, file: file }); };

    if (!HER.name) add('about', 'HER.name', 'empty (the site says "you")', 'content/about.js');
    if (CONFIG.production !== true) add('config', 'CONFIG.production', 'is false: dev examples and placeholders are still visible', 'js/config.js');

    MEMORIES.forEach(function (it) {
      const w = 'memory ' + it.slot;
      if (it.devExample) add(w, it.title, 'development example: replace with a real memory, then remove devExample', 'content/memories.js');
      if (it.status !== 'published') add(w, it.title, "status is '" + it.status + "' (not published)", 'content/memories.js');
      if (/^\[.*\]$/.test((it.account || '').trim()) || !(it.account || '').trim()) add(w, it.title, 'account text is empty or still a [bracket] placeholder', 'content/memories.js');
      const wantsPhoto = it.treatment === 'photo' || it.treatment === 'both';
      const wantsArt = it.treatment === 'illustration' || it.treatment === 'both';
      if (wantsPhoto) {
        if (!it.photo) add(w, it.title, 'photo path not set', 'content/memories.js');
        else { checks.push(fileExists(it.photo).then(function (ok) { if (!ok) add(w, it.title, 'photo file not found: ' + it.photo, 'assets/images'); })); if (!(it.photoAlt || '').trim()) add(w, it.title, 'photo has no alt text (photoAlt)', 'content/memories.js'); }
      }
      if (wantsArt) {
        if (!it.illustration) add(w, it.title, 'illustration path not set', 'content/memories.js');
        else { checks.push(fileExists(it.illustration).then(function (ok) { if (!ok) add(w, it.title, 'illustration file not found: ' + it.illustration, 'assets/images'); })); if (!(it.illustrationAlt || '').trim()) add(w, it.title, 'illustration has no alt text (illustrationAlt)', 'content/memories.js'); }
      }
    });
    GALLERY.works.forEach(function (it) {
      if (it.kind !== 'art') return;
      if (it.devExample) add('gallery', it.title, 'development example', 'content/gallery.js');
      if (it.status !== 'published') add('gallery', it.title, "status is '" + it.status + "'", 'content/gallery.js');
      checks.push(fileExists(it.image).then(function (ok) { if (!ok) add('gallery', it.title, 'image not found: ' + it.image, 'assets/images'); }));
      if (!(it.alt || '').trim()) add('gallery', it.title, 'no alt text', 'content/gallery.js');
    });
    RECORDINGS.items.forEach(function (it) {
      if (it.devExample) add('recording', it.label, 'development example', 'content/recordings.js');
      if (it.status !== 'published') add('recording', it.label, "status is '" + it.status + "'", 'content/recordings.js');
      ['mp3', 'm4a'].forEach(function (k) { checks.push(fileExists(it[k], 'audio').then(function (ok) { if (!ok) add('recording', it.label, k.toUpperCase() + ' file not found: ' + it[k], 'assets/audio'); })); });
      if (!(it.transcript || '').trim() || /^\[.*\]$/.test(it.transcript.trim())) add('recording', it.label, 'no real transcript', 'content/recordings.js');
    });
    LETTERS.items.forEach(function (it) {
      if (it.devExample) add('letter', it.label, 'development example', 'content/letters.js');
      if (it.status !== 'published') add('letter', it.label, "status is '" + it.status + "'", 'content/letters.js');
    });
    if (REVEAL.wish.status !== 'published') add('reveal', 'final wish', "status is '" + REVEAL.wish.status + "'", 'content/reveal.js');
    if (REVEAL.wish.paragraphs.join(' ').indexOf('[') !== -1) add('reveal', 'final wish', 'text still contains a [bracket] placeholder', 'content/reveal.js');

    return Promise.all(checks).then(function () {
      const green = rows.length === 0;
      if (green) console.log('%cAll clear. Every item is real, published and has its files and alt text.', 'color:#2a7a3a;font-weight:bold');
      else {
        console.log('%cNOT READY TO PUBLISH: ' + rows.length + ' thing(s) left', 'color:#b04a4a;font-weight:bold;font-size:14px');
        console.table(rows);
      }
      return { green: green, rows: rows };
    });
  }

  function boot() {
    Sound.init();
    Atmosphere.init(document.getElementById('sky'));
    HUD.bind();

    // Browsers only allow sound after a gesture; wake it on the first one.
    const wake = function () { Sound.unlock(); window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); };
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);

    // Escape: close a sheet (handled in ui.js), otherwise head back to the world.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const c = Router.current();
      if (c && Router.isPlace(c.id)) Router.toWorld();
    });

    // fireflies lean toward touches, too
    window.addEventListener('pointerdown', function (e) { Atmosphere.setPointer(e.clientX, e.clientY); }, { passive: true });

    const hash = window.location.hash.replace('#', '');
    const skip = /[?&]skip\b/.test(window.location.search);
    const returning = !!Store.flag('entered');
    let start = 'entrance';
    if (Router.has(hash) && hash !== 'entrance' && (returning || skip)) start = hash;
    else if (skip) start = 'world';

    try { window.history.replaceState({ id: start, depth: 0, prev: null }, '', '#' + start); } catch (e) { /* ignore */ }
    Router.show(start, { instant: true });
  }

  window.HLAW = {
    audit: audit,
    reset: function () { Store.reset(); window.location.hash = ''; window.location.reload(); },
    router: Router
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
