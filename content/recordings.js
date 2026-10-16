/* ============================================================
   CONTENT / RECORDINGS: the Listening Corner (optional).

   Real, supplied voice notes only. Never autoplays.
   Supply BOTH formats of each file for best phone support:
     assets/audio/voice-01.mp3  and  assets/audio/voice-01.m4a
   `transcript` is optional but helps everyone.
   A missing file shows a quiet "waiting for a voice" waveform.
   ============================================================ */

const RECORDINGS = {
  title: 'The Listening Corner',
  line: 'Turn the dial. Press play when you are ready.',
  waiting: 'waiting for a voice',
  items: [
    { id: 'v1', label: 'First voice',  mp3: 'assets/audio/voice-01.mp3', m4a: 'assets/audio/voice-01.m4a', transcript: '[Transcript of the first voice note goes here.]', status: 'placeholder', devExample: true },
    { id: 'v2', label: 'Second voice', mp3: 'assets/audio/voice-02.mp3', m4a: 'assets/audio/voice-02.m4a', transcript: '[Transcript of the second voice note goes here.]', status: 'placeholder', devExample: true },
    { id: 'v3', label: 'Third voice',  mp3: 'assets/audio/voice-03.mp3', m4a: 'assets/audio/voice-03.m4a', transcript: '[Transcript of the third voice note goes here.]', status: 'placeholder', devExample: true }
  ]
};
