/* ============================================================
   STORE — remembers what she has opened, bloomed and found.

   Lives only in her own browser (localStorage). If storage is
   unavailable (private mode, blocked cookies, file:// quirks),
   it quietly falls back to memory for the session. Nothing here
   can break the site.

   Store.add('secrets', id)   -> true if it was new
   Store.has('secrets', id)
   Store.count('secrets')
   Store.flag('entered')      read   |   Store.flag('entered', true)  write
   Store.reset()              wipe everything
   ============================================================ */

const Store = (function () {
  'use strict';

  let data = { sets: {}, flags: {} };

  function load() {
    if (!CONFIG.persistProgress) return;
    try {
      const raw = window.localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          data.sets = parsed.sets || {};
          data.flags = parsed.flags || {};
        }
      }
    } catch (e) { /* storage unavailable: carry on in memory */ }
  }

  function save() {
    if (!CONFIG.persistProgress) return;
    try {
      window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  load();

  return {
    has(setName, id) {
      return !!(data.sets[setName] && data.sets[setName].indexOf(id) !== -1);
    },
    add(setName, id) {
      const list = data.sets[setName] || (data.sets[setName] = []);
      if (list.indexOf(id) !== -1) return false;
      list.push(id);
      save();
      return true;
    },
    list(setName) { return (data.sets[setName] || []).slice(); },
    count(setName) { return (data.sets[setName] || []).length; },

    flag(name, value) {
      if (value === undefined) return data.flags[name];
      data.flags[name] = value;
      save();
      return value;
    },

    reset() {
      data = { sets: {}, flags: {} };
      try { window.localStorage.removeItem(CONFIG.storageKey); } catch (e) { /* ignore */ }
    }
  };
})();
