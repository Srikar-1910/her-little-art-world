# Her Little Art World

A hand-painted sketchbook that opens into a small watercolour world, made as a birthday gift.
Plain HTML, CSS and JavaScript. No framework, no build step, no server code.

## Run it
- Quickest: double-click `index.html`. It works from `file://`.
- Or serve the folder: `python3 -m http.server 8000` then open http://localhost:8000
  (or VS Code "Live Server").
- Deploy: upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages).
- Handy URLs: `index.html?skip` opens straight into the world; `#reveal`, `#studio`, `#garden`,
  `#gallery`, `#listening`, `#desk` open a room (after `?skip`).

## The experience
Doorway -> Little World -> Studio (paint a drawing) -> Memory Garden (six objects, six memory slots)
-> Little Gallery (spotlight walk) -> Listening Corner (optional voice notes) -> Desk of Unsent Words
(optional, four envelopes that open four ways) -> Birthday Reveal (two candles, light, the wish).
The reveal is ALWAYS reachable: a lantern on the hill, a "Skip to the birthday reveal" link on the
entrance and the world, and the Places menu. Nothing has to be visited or collected first.

## Where to edit content (everything personal lives in /content)
| File | What it holds |
|---|---|
| `content/about.js` | her name, optional birthday, entrance wording, place names |
| `content/memories.js` | the SIX memory slots (account, quote, photo, illustration, alt text, status) |
| `content/gallery.js` | gallery frames: which memories, plus her own artwork and optional "story on the back" |
| `content/recordings.js` | voice notes (mp3 + m4a paths, transcripts) |
| `content/letters.js` | the four envelopes and their letters |
| `content/reveal.js` | the final wish |
| `content/studio.js` | pigment names/colours (no personal content) |
| `js/config.js` | settings, including `production` (see below) |

Scene code is in `js/scenes/`, kept separate from content. You should not need to touch it.

## Memory slots, placeholders and publishing safely
Each memory has `status`: `placeholder` -> `draft` -> `ready` -> `published`.
- Slot 1 is the library moment (an illustrated reconstruction; see its `illustrationBrief`).
- Slots 2-6 are marked `devExample: true`. A dev example can never be published: the site forces it
  back to `placeholder`. To use a slot, write the real memory, delete its `devExample` line, set status.
- `CONFIG.production = true` (js/config.js) hides everything not `published`. The garden, gallery,
  desk and radio then show only real, released items, and the placeholder wish is never displayed.
- Run `HLAW.audit()` in the browser console. It lists every placeholder, dev example, missing photo,
  missing audio file and missing alt text, and never reports green while any remain.

## Assets you need to supply
- Photos: `assets/images/memory-02.jpg` ... `memory-06.jpg`, `her-art-01.jpg` (see `assets/images/README.txt`).
  Add alt text for each (`photoAlt`, `illustrationAlt`, `alt`).
- The finished library illustration: `assets/images/memory-01-library.webp` (brief is in memories.js).
  Until it exists, a pencil placeholder is shown.
- Voice recordings: mp3 + m4a each, in `assets/audio/` (see its README).
- Her name, the date, every personal word, each letter and the final wish.
- Optional: self-hosted fonts, background ambience.

## How the painted look works
The scenes are painted procedurally (SVG filters) and baked into three transparent WebP layers each
(`sketch` graphite, `wash` colour, `full` colour + light) for desktop and mobile in `assets/art/`.
The browser reveals colour through soft uneven masks and fades the light in last, so it stays smooth
on phones. To regenerate: `tools/art/` (`build-art.js` renders with Playwright, `to-webp.py` converts
and writes `js/art-data.js`). You do not need these to run or edit the site.

## Accessibility
Every interaction has a tap AND keyboard route (Tab, Enter/Space, arrows). Visible focus, 44px+ touch
targets, alt text, `prefers-reduced-motion` support, no autoplay, no dragging required, all text is real HTML.
