/* ============================================================
   CONTENT / GALLERY: the Little Gallery.

   Each work is either a shared memory (memory: 'm1') or her own
   artwork (kind: 'art'). Memories are shown with the same words,
   photo and illustration as in the garden; edit them in memories.js.

   For her own artwork:
   image   'assets/images/her-art-01.jpg'
   alt     alt text
   caption the words under the frame
   story   OPTIONAL deeper story, shown when she turns the frame over
   ============================================================ */

const GALLERY = {
  title: 'The Little Gallery',
  line: 'Walk with the arrow keys, or tap the arrows.',
 works: [
  {
    id: 'g1',
    kind: 'memory',
    memory: 'm1',
    story: 'If I could keep one ordinary moment forever, it would be one where I got to hold your hand.'
  },
  {
    id: 'g2',
    kind: 'memory',
    memory: 'm2',
    story: 'I only wanted to make your day a little better. I never knew that little moment would mean so much to me.'
  },
  {
    id: 'g3',
    kind: 'memory',
    memory: 'm3',
    story: 'I thought it was going to be a disappointing day. Then you hugged me, and suddenly, nothing else mattered.'
  },
  {
    id: 'g4',
    kind: 'memory',
    memory: 'm4',
    story: 'We were miles apart, sitting in the dark, yet somehow that conversation brought you closer to my heart.'
  }
],
  flipLabel: 'Turn it over',
  flipBackLabel: 'Turn it back',
  noStory: 'Nothing is written on the back.'
};
