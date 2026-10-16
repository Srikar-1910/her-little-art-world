/* ============================================================
   ROOMS: helpers shared by the six rooms.

   Rooms.open(ctx, scene, label, title, line)  paint a room and title it
   Rooms.memory(m)       the body of a memory: photo / illustration / words
   Rooms.photo(src, alt, blankText)  a photo on a mount, never altered
   ============================================================ */

const Rooms = (function () {
  'use strict';
  const h = UI.h;

  function open(ctx, scene, label, title, line) {
    const host = h('div', { class: 'room-host' });
    ctx.el.insertBefore(host, ctx.ui);
    const p = Painting.create({ scene: scene, host: host, label: label });
    const t = h('div', { class: 'room-title' }, h('h2', null, title), line ? h('p', null, line) : null);
    ctx.ui.appendChild(t);
    return { p: p, host: host, title: t };
  }

  /* A photograph is shown exactly as supplied. Only a mount and tape are drawn around it.
     If the file is missing, a taped blank says so. */
  function photo(src, alt, blankText, stampItem) {
    const fig = h('figure', { class: 'mount' });
    const slot = h('div', { class: 'mount-slot' });
    fig.appendChild(slot);
    const blank = function () {
      slot.innerHTML = '';
      slot.appendChild(h('div', { class: 'photo-blank', role: 'img', 'aria-label': blankText || 'photo goes here' },
        h('span', null, blankText || 'photo goes here')));
      fig.classList.add('is-blank');
    };
    if (!src) blank();
    else {
      const im = h('img', { src: src, alt: alt || '', decoding: 'async' });
      im.addEventListener('error', blank);
      slot.appendChild(im);
    }
    const st = stampItem && UI.stamp(stampItem);
    if (st) fig.appendChild(h('div', { class: 'mount-stamp' }, st));
    return fig;
  }

  /* quiet pencil placeholder for an illustration that has not been drawn yet */
  function illoBlank(m, text) {
    const dev = !CONFIG.production && m && m.illustrationBrief
      ? h('details', { class: 'dev-brief' }, h('summary', null, 'Brief for the illustrator (development only)'), h('p', null, m.illustrationBrief))
      : null;
    const svg = '<svg viewBox="0 0 320 200" aria-hidden="true" focusable="false"><g fill="none" stroke="#3B3A3D" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="7 4" opacity=".55" filter="url(#pencilRough)"><rect x="96" y="22" width="128" height="104" rx="4"/><path d="M160 22V126M96 74H224"/><path d="M40 150H280"/><path d="M60 150V184M260 150V184"/></g></svg>';
    const box = h('div', { class: 'illo-blank', role: 'img', 'aria-label': text || 'illustration goes here' },
      h('div', { class: 'illo-art', html: null }), h('p', null, text || 'illustration goes here'));
    box.firstChild.innerHTML = svg;
    return h('div', null, box, dev);
  }

  function illo(src, alt, m) {
    const wrap = h('div', { class: 'illo-wrap' });
    if (!src) { wrap.appendChild(illoBlank(m, GARDEN.placeholderArt)); return wrap; }
    const im = h('img', { src: src, alt: alt || '', decoding: 'async' });
    im.addEventListener('error', function () { wrap.innerHTML = ''; wrap.appendChild(illoBlank(m, GARDEN.placeholderArt)); });
    wrap.appendChild(h('figure', { class: 'mount illo' }, h('div', { class: 'mount-slot' }, im)));
    return wrap;
  }

  /* everything about one memory, in order: image(s), words, account */
  function memory(m) {
    const kids = [];
    const wantsPhoto = m.treatment === 'photo' || m.treatment === 'both';
    const wantsArt = m.treatment === 'illustration' || m.treatment === 'both';
    if (wantsArt) kids.push(illo(m.illustration, m.illustrationAlt, m));
    if (wantsPhoto) kids.push(photo(m.photo, m.photoAlt, GARDEN.placeholderPhoto, m));
    if (m.date) kids.push(h('p', { class: 'mem-date' }, m.date));
    if (m.account) kids.push(h('p', { class: 'mem-account' }, m.account));
    if (m.words) kids.push(h('blockquote', { class: 'mem-words' }, m.words));
    return h('div', { class: 'mem' }, kids);
  }

  return { open: open, photo: photo, illo: illo, memory: memory };
})();
