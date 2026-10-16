/* ============================================================
   SCENE: THE LITTLE GALLERY
   A dim room with a spotlight that WALKS from frame to frame.
   Move with the arrow buttons or the Left/Right keys. Enter (or a
   tap) opens the frame in the spotlight: a photo, an illustration
   or her own artwork, with previous / next. Each frame can be
   turned over for an optional deeper story.
   ============================================================ */

Router.register('gallery', {
  title: 'The Little Gallery',
  mood: 'gallery',

  mount: function (ctx) {
    const h = UI.h;
    const R = Rooms.open(ctx, 'gallery', 'A dim gallery with framed paintings, each lit by its own lamp', GALLERY.title, GALLERY.line);
    const p = R.p;
    p.stage.classList.add('clip');
    const works = Content.works();
    let at = 0, sheetOpen = null;

    const stationAnchors = function () {
      const a = p.anchors(), out = [];
      for (let i = 0; i < 12; i++) if (a['frame' + i]) out.push('frame' + i);
      return out;
    };
    const anchorFor = function (i) { const s = stationAnchors(); return s[Math.min(i, s.length - 1)]; };

    const spot = h('div', { class: 'spot-dim', 'aria-hidden': 'true' });
    p.stage.appendChild(spot);
    function moveSpot() {
      const a = p.anchors()[anchorFor(at)];
      if (!a) return;
      spot.style.left = (a[0] * 100) + '%'; spot.style.top = (a[1] * 100) + '%';
    }

    function title(w) {
      if (w.kind === 'memory') return Content.memory(w.memory).title;
      return w.title;
    }

    // one focusable button per frame station
    const stBtns = [];
    stationAnchors().forEach(function (name, i) {
      const w = works[i];
      const b = h('button', { class: 'pin frame-btn', type: 'button', 'aria-label': w ? 'Frame ' + (i + 1) + ': ' + title(w) : 'Frame ' + (i + 1) + ' (empty)',
        on: { click: function () { go(i); if (w) openWork(i); }, focus: function () { go(i); } } });
      stBtns.push(b);
      p.pin(b, name, { k: 1.0, aspect: 1.25 });
    });

    function go(i) {
      if (!works.length) return;
      at = (i + works.length) % works.length;
      const name = anchorFor(at);
      p.bloom(name, 1, 1500);
      Store.add('seen', works[at].id);
      p.light(Math.min(1, Store.count('seen') / works.length), 2200);
      moveSpot(); Sound.sfx('tick');
      UI.say('Frame ' + (at + 1) + ' of ' + works.length + ': ' + title(works[at]));
    }

    function workBody(w) {
      if (w.kind === 'memory') return Rooms.memory(Content.memory(w.memory));
      const kids = [];
      kids.push(Rooms.photo(w.image, w.alt, 'her artwork goes here', w));
      if (w.caption) kids.push(h('p', { class: 'mem-account' }, w.caption));
      return h('div', { class: 'mem' }, kids);
    }
    function storyOf(w) {
      const s = (w.story || '').trim();
      return s;
    }

    function openWork(i) {
      if (sheetOpen) sheetOpen.close(true);
      at = i; moveSpot();
      const w = works[i];
      const t = title(w);
      const front = h('div', { class: 'face front' }, workBody(w));
      const story = storyOf(w);
      const back = h('div', { class: 'face back', 'aria-hidden': 'true' }, h('p', { class: 'mem-account' }, story || GALLERY.noStory));
      const flip = h('div', { class: 'flip' }, front, back);
      const flipBtn = h('button', { class: 'text-btn', type: 'button', 'aria-pressed': 'false', on: { click: function () {
        const f = !flip.classList.contains('flipped');
        flip.classList.toggle('flipped', f);
        front.setAttribute('aria-hidden', String(f)); back.setAttribute('aria-hidden', String(!f));
        front.inert = f; back.inert = !f;
        flipBtn.setAttribute('aria-pressed', String(f));
        flipBtn.textContent = f ? GALLERY.flipBackLabel : GALLERY.flipLabel;
        Sound.sfx('page');
      } } }, GALLERY.flipLabel);
      back.inert = true;
      const nav = h('div', { class: 'sheet-nav' },
        h('button', { class: 'btn small quiet', type: 'button', on: { click: function () { move(-1); } } }, '← Previous'),
        h('span', { class: 'counter', 'aria-hidden': 'true' }, (i + 1) + ' / ' + works.length),
        h('button', { class: 'btn small quiet', type: 'button', on: { click: function () { move(1); } } }, 'Next →'));
      sheetOpen = UI.sheet({ kicker: 'frame ' + (i + 1), title: t, wide: true, stamp: UI.stamp(w.kind === 'memory' ? Content.memory(w.memory) : w),
        body: h('div', null, flip, h('div', { class: 'flip-ctl' }, flipBtn)), foot: nav, seed: UI.hashStr(w.id),
        onClose: function () { sheetOpen = null; } });
      Sound.sfx('page');
      function move(d) { const n = (i + d + works.length) % works.length; go(n); openWork(n); }
    }

    // walking controls
    const left = h('button', { class: 'walk walk-l', type: 'button', 'aria-label': 'Walk to the previous frame', on: { click: function () { go(at - 1); } } }, '‹');
    const right = h('button', { class: 'walk walk-r', type: 'button', 'aria-label': 'Walk to the next frame', on: { click: function () { go(at + 1); } } }, '›');
    const openBtn = h('button', { class: 'btn small walk-open', type: 'button', on: { click: function () { if (works.length) openWork(at); } } }, 'Look closely');
    ctx.ui.appendChild(left); ctx.ui.appendChild(right); ctx.ui.appendChild(h('div', { class: 'walk-dock' }, openBtn));

    function key(e) {
      if (UI.hasOpenSheet()) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
      else if (e.key === 'Enter' && document.activeElement === document.body && works.length) { openWork(at); }
    }
    document.addEventListener('keydown', key);

    if (!works.length) ctx.ui.appendChild(h('p', { class: 'room-empty' }, 'The walls are being hung. Come back soon.'));
    p.onVariant = function () { moveSpot(); };
    p.ready.then(function () { moveSpot(); if (works.length) go(0); });
    window.addEventListener('resize', moveSpot);
    return { unmount: function () { document.removeEventListener('keydown', key); window.removeEventListener('resize', moveSpot); if (sheetOpen) sheetOpen.close(true); p.destroy(); } };
  }
});
