/* ============================================================
   CONFIG — every setting for the experience.
   Words and personal content live in /content, not here.
   ============================================================ */

const CONFIG = {

  /* ---------- PROGRESS ----------
     When true, what she has opened, bloomed and found is remembered
     in her browser (localStorage), so she can visit in several sittings.
     Nothing is ever sent anywhere.                                      */
  persistProgress: true,

  /* ---------- PRODUCTION SWITCH ----------
     false = development: every item shows, placeholders carry a stamp.
     true  = live site: ONLY items with status 'published' (and no
     devExample flag) are shown. Fake or unfinished content disappears.
     Run HLAW.audit() before switching this on.                        */
  production: false,
  storageKey: 'her-little-art-world:v2',

  /* ---------- PLACEHOLDER STAMPS ----------
     Items marked `placeholder: true` in /content show a small stamp.
     Set to false for launch to hide every stamp at once.               */
  showPlaceholderLabels: true,

  /* ---------- DISCOVERIES ---------- */
  showDiscoveryCount: true,     // the small "✦ 3" in the corner
  // The birthday lantern is ALWAYS visible and ALWAYS open. This only
  // controls when the whole world turns to full light (places visited).
  lightAfterVisiting: 5,

  /* ---------- LOOK ---------- */
  // Hand-drawn wobble on the painted scenery. 'auto' turns it off on
  // small / low-power screens. true = always, false = never.
  painterlyFilter: 'auto',

  /* ---------- MOTION ---------- */
  atmosphere: {
    density: 1,                 // multiplier for fireflies, dust, petals
    speed: 1                    // multiplier for how fast they drift
  },

  /* ---------- AUDIO ----------
     All optional. Missing files fail silently.
     Soft sound effects are synthesised in the browser — they need no files. */
  audio: {
    enabled: true,
    ambient: 'assets/audio/background.mp3',   // optional looping ambience
    ambientVolume: 0.28,
    ambientDucked: 0.06,                      // volume while a voice recording plays
    sfx: true,                                // synthesised chimes, page turns, etc.
    sfxVolume: 0.5
  },

  /* ---------- IMAGES ---------- */
  images: {
    // If a listed image is missing, draw an original stand-in instead.
    fallbackToGeneratedArt: true
  },

  /* ---------- PARTICLE COLOURS ---------- */
  colors: {
    firefly: '#ffe9a8',
    mote: '#fff3d6',
    petals: ['#f4c9c3', '#e8a0a8', '#fbf3e4', '#b9a7d8', '#f0c77a'],
    confetti: ['#e8a0a8', '#e98a7a', '#e2b25b', '#9db59a', '#5fa3a0', '#b9a7d8', '#fbf3e4'],
    spark: '#fff1c9'
  }
};

/* ---------- derived, do not edit ---------- */
CONFIG.isSmallScreen = function () {
  return Math.min(window.innerWidth, window.innerHeight) < 560;
};
CONFIG.useWobble = function () {
  if (CONFIG.painterlyFilter === true) return true;
  if (CONFIG.painterlyFilter === false) return false;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  return !(CONFIG.isSmallScreen() || lowPower);
};
