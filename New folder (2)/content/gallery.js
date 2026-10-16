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
    { id: 'g1', kind: 'memory', memory: 'm1', story: '' },
    { id: 'g2', kind: 'memory', memory: 'm2', story: '' },
    { id: 'g3', kind: 'memory', memory: 'm3', story: '' },
    { id: 'g4', kind: 'art', devExample: true, title: 'Dev example: her artwork',
      image: 'assets/images/her-art-01.jpg', alt: '', caption: '[Her artwork goes here.]',
      story: '[Optional deeper story about this piece.]', status: 'placeholder' }
  ],
  flipLabel: 'Turn it over',
  flipBackLabel: 'Turn it back',
  noStory: 'Nothing is written on the back.'
};
