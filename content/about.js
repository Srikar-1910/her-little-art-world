/* ============================================================
   CONTENT / ABOUT: her name, the entrance wording, the places.

   Everything in /content is meant to be edited by you.
   Nothing in these files is a real memory unless you wrote it.
   Items carry a `status`:
     'placeholder'  nothing real yet (shows a "placeholder" stamp)
     'draft'        real words, not checked
     'ready'        real and checked, not yet released
     'published'    real, and allowed on the live site
   Run  HLAW.audit()  in the browser console for a checklist.
   ============================================================ */

const HER = {
  // Her first name or nickname. Leave '' and the site says "you".
  name: '',
  // Optional. e.g. { month: 10, day: 24 } adds a quiet line on that day each year.
  birthday: null
};

const ENTRANCE = {
  eyebrow: 'a little world, made for',
  greeting: 'Happy Birthday',
  subtitle: 'Someone built you a small world out of pencil, paper and light. The door is open whenever you are ready.',
  todayLine: 'Today is the day.',
  doorHint: 'Open the door',
  button: 'Come in',
  skipLabel: 'Skip to the birthday reveal',
  returning: 'Welcome back. Everything is where you left it.'
};

/* The places. `anchor` names a spot in the painted world (art-data.js).
   The Birthday Reveal is always open: nothing has to be visited first. */
const WORLD = {
  title: 'Her Little Art World',
  places: [
    { id: 'garden',    anchor: 'garden',  label: 'The Memory Garden',        blurb: 'Small objects that open into memories' },
    { id: 'myworld',   anchor: 'studio',  label: 'My World',                   blurb: 'A portrait, a song, and a little moment to stay' },
    { id: 'gallery',   anchor: 'gallery', label: 'The Little Gallery',       blurb: 'Framed moments, one by one, in the spotlight' },
    { id: 'listening', anchor: 'listen',  label: 'The Listening Corner',     blurb: 'Voices, if she wants to hear them (optional)' },
    { id: 'desk',      anchor: 'desk',    label: 'The Desk of Unsent Words', blurb: 'Four envelopes, each opens its own way (optional)' },
    { id: 'reveal',    anchor: 'reveal',  label: 'The Birthday Reveal',      blurb: 'Light the candles. Always open.' }
  ]
};
