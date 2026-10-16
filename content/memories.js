/* ============================================================
   CONTENT / MEMORIES: the six memory slots in the Memory Garden.

   RULES
   - Real words only. The site never invents a memory, quote or detail.
   - Slots 2 to 6 below are DEVELOPMENT EXAMPLES (devExample: true).
     They exist so every interaction can be tested. A dev example can
     never be published: replace it with a real memory, delete the
     `devExample` line, then set status.
   - CONFIG.production = true hides everything that is not 'published'.

   FIELDS
   id            short unique name (used by the gallery too)
   slot          1 to 6
   object        which garden object opens it:
                 'lantern' | 'bird' | 'cup' | 'key' | 'bottle' | 'flower'
   title         short heading
   date          optional, e.g. 'Autumn, college'
   account       what really happened, in your words
   words         optional personal words / quote, EXACTLY as you want them
   treatment     'photo' | 'illustration' | 'both'
   photo         path in assets/images, e.g. 'assets/images/memory-02.jpg'
   photoAlt      what a screen-reader user should hear about the photo
   illustration  path to finished art, e.g. 'assets/images/memory-01-art.webp'
   illustrationBrief  notes for whoever draws it
   illustrationAlt    alt text for the finished art
   status        'placeholder' | 'draft' | 'ready' | 'published'
   devExample    true while it is only a test item
   ============================================================ */

const MEMORIES = [
  {
    id: 'm1', slot: 1, object: 'lantern',
    title: 'Holding Your Hand',
    date: 'The library',
    account: 'Some of my happiest moments were simply holding your hand, while the rest of the world carried on around us.',
    words: 'Enta introvert annnaa kasta extrovert ga behave cheyaliii ani common sense undalii...prati sari oka ammai eh approach avali antey kudaradhu gaaa...mmm....em cheyalemm..!!',
    treatment: 'illustration', photo: '', photoAlt: '',
    illustration: 'assets/images/memory-01-holding-hands.webp',
    illustrationAlt: 'A warm, hand-painted illustration of two students holding hands while studying in a library.',
    illustrationBrief: 'Approved custom illustration for the library hand-holding memory.',
    status: 'published'
  },
  {
    id: 'm2', slot: 2, object: 'bird',
    title: 'The Message',
    date: 'The day it felt real',
    account: 'I bought those chocolates hoping to make your day a little easier… I never imagined your reply would become one of the happiest moments of my life. “I think I’m falling for you.”',
    words: '"I Think iam falling for you"-These are the words making me to love you and stoping me to leave you...',
    treatment: 'illustration', photo: '', photoAlt: '',
    illustration: 'assets/images/memory-02-the-message.webp',
    illustrationAlt: 'A warm, animated scrapbook illustration of two people smiling and blushing while reading a heartfelt message.',
    illustrationBrief: 'Approved custom illustration of the confession over an Instagram-style chat.',
    status: 'published'
  },
  {
    id: 'm3', slot: 3, object: 'cup',
    title: 'The Unexpected Hug',
    date: 'An empty classroom',
    account: 'I was disappointed because I thought I would not get to see you at the library that day. While our friends talked in an empty classroom, I sat quietly on a table in the corner. Then you came and sat beside me and held me like this. I looked calm, but inside my heart was racing.',
    words: 'litreally the best day of my life ra aa roju....',
    treatment: 'illustration', photo: '', photoAlt: '',
    illustration: 'assets/images/memory-03-the-unexpected-hug.webp',
    illustrationAlt: 'A warm, hand-painted anime-style illustration of a couple sitting close together on a classroom table as she rests against his shoulder.',
    illustrationBrief: 'Approved custom animated-style illustration based on the remembered embrace.',
    status: 'published'
  },
  {
    id: 'm4', slot: 4, object: 'key',
    title: 'A Little Closer',
    date: 'Our late-night call',
    account: 'It was our first video call. Both our lights were off,We could barely see each other in the dark, but somehow, I felt closer to you than ever. And then you said you wanted to cuddle me… and I floated to cloud nine.',
    words: 'Loving you is not jst a choice i chose and leaving is not at all a choice i choose...',
    treatment: 'illustration', photo: '', photoAlt: '',
    illustration: 'assets/images/memory-04-late-night-call.webp',
    illustrationAlt: 'A cozy, midnight-blue anime scrapbook illustration of two people on a late-night laptop video call, surrounded by handwritten notes.',
    illustrationBrief: 'Approved custom illustration of the late-night laptop video call.',
    status: 'published'
  }
];

const GARDEN = {
  title: 'The Memory Garden',
  line: 'Each small thing here opens differently.',
  empty: 'This garden is still growing. Come back soon.',
  placeholderPhoto: 'photo goes here',
  placeholderArt: 'illustration goes here'
};
