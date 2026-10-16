/* ============================================================
   CONTENT RULES: the safeguards between your content files and the site.

   - A devExample item is forced back to 'placeholder'. It can never be published.
   - In production (CONFIG.production) only 'published' items are shown.
   - Nothing here invents content. Missing things show a labelled blank.
   ============================================================ */

const Content = (function () {
  'use strict';
  const STATUSES = ['placeholder', 'draft', 'ready', 'published'];

  function all() {
    const out = [];
    MEMORIES.forEach(function (m) { out.push(m); });
    GALLERY.works.forEach(function (w) { if (w.kind === 'art') out.push(w); });
    RECORDINGS.items.forEach(function (r) { out.push(r); });
    LETTERS.items.forEach(function (l) { out.push(l); });
    return out;
  }

  // enforce the rules once, at load
  all().concat([REVEAL.wish]).forEach(function (it) {
    if (STATUSES.indexOf(it.status) === -1) it.status = 'placeholder';
    if (it.devExample && it.status !== 'placeholder') {
      if (window.console) console.warn('[Her Little Art World] A devExample item cannot be published. Remove its devExample flag first. Item:', it.id || it.title);
      it.status = 'placeholder';
    }
    it.placeholder = it.status === 'placeholder';
  });

  function visible(it) {
    if (!it) return false;
    if (!CONFIG.production) return true;
    return it.status === 'published' && !it.devExample;
  }
  const memories = function () { return MEMORIES.filter(visible); };
  const memory = function (id) { const m = MEMORIES.filter(function (x) { return x.id === id; })[0]; return visible(m) ? m : null; };
  const works = function () {
    return GALLERY.works.filter(function (w) {
      if (w.kind === 'memory') return !!memory(w.memory);
      return visible(w);
    });
  };
  const voices = function () { return RECORDINGS.items.filter(visible); };
  const letters = function () { return LETTERS.items.filter(visible); };

  /* Production hides the wish if it is still a placeholder; the reveal still happens. */
  const wishReady = function () { return !CONFIG.production || REVEAL.wish.status === 'published'; };

  return { visible: visible, memories: memories, memory: memory, works: works, voices: voices, letters: letters, wishReady: wishReady, all: all };
})();
