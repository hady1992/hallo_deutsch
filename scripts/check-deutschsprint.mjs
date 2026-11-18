import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BOOK_AUDIO, audioPath, findBookAudio } from '../src/data/deutschsprintAudio.js';

const ids = ['A1-01-01', 'A1-01-02', 'A1-01-03', 'A1-01-04'];
assert.deepEqual(BOOK_AUDIO.map((track) => track.id), ids);
assert.equal(new Set(BOOK_AUDIO.map((track) => audioPath(track.id))).size, ids.length);
for (const track of BOOK_AUDIO) {
  assert.equal(findBookAudio(track.id.toLowerCase()), track);
  assert.equal(findBookAudio(track.id), track);
  assert.equal(audioPath(track.id), `/audio/${track.id.toLowerCase()}`);
  assert.ok(track.title && track.german && track.description);
  if (track.source !== null) {
    assert.match(track.source, /^\/media\/deutschsprint\/[a-z0-9/-]+\.mp3$|^https:\/\//);
    if (track.source.startsWith('/')) {
      assert.ok(existsSync(new URL(`../public${track.source}`, import.meta.url)), `Missing recording ${track.source}`);
    }
  }
}
assert.equal(findBookAudio('a1-01-99'), null);
assert.equal(findBookAudio(undefined), null);
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.ok(app.includes('path="/audio/:audioId"'));
assert.ok(app.includes('path="/deutschsprint"'));
const htaccess = readFileSync(new URL('../public/.htaccess', import.meta.url), 'utf8');
assert.ok(htaccess.includes('^/media/deutschsprint/'));
console.log('[check:deutschsprint] OK – 4 permanent recording IDs and route wiring');
