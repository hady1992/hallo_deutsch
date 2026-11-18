import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BOOK_AUDIO, audioPath, findBookAudio } from '../src/data/deutschsprintAudio.js';
import { BOOK_PRACTICE, ALPHABET_ROWS, SPECIAL_ROWS, SOUND_ROWS, DIALOG_ROWS, expandPracticeSpeech, getPracticeItems, getGermanVoices } from '../src/data/deutschsprintPractice.js';

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
assert.deepEqual(Object.keys(BOOK_PRACTICE), ids);
assert.deepEqual(Object.values(BOOK_PRACTICE).map(({ page }) => page), [2, 3, 4, 5]);
assert.equal(ALPHABET_ROWS.map((row) => row.items[0].spoken).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
assert.deepEqual(ALPHABET_ROWS.map((row) => row.items[1].text), 'Apfel Ball Computer Dose Elefant Fisch Gabel Haus Insel Jacke Kaffee Lampe Milch Nase Oma Pizza Quelle Rose Sonne Tee Uhr Vater Wasser Taxi Yoga Zahn'.split(' '));
assert.deepEqual(SPECIAL_ROWS.map((row) => row.label), ['Ä ä', 'Ö ö', 'Ü ü', 'ß']);
assert.deepEqual(SOUND_ROWS.map((row) => row.label), ['ei', 'ie', 'eu / äu', 'au', 'sch', 'ch', 'sp / st', 'ph', 'z']);
assert.deepEqual(SOUND_ROWS.flatMap((row) => row.items.map((entry) => entry.text)), 'Eis Liebe Eule Häuser Haus Schule ich Buch Sport Stein Kiste Alphabet Zahn'.split(' '));
assert.deepEqual(DIALOG_ROWS[3].items[0].spoken, ['A', 'H', 'M', 'A', 'D']);
assert.deepEqual(DIALOG_ROWS[5].items[0].spoken, ['M', 'I', 'R', 'A']);
assert.equal(expandPracticeSpeech(getPracticeItems(DIALOG_ROWS)).length, 17);
assert.equal(getPracticeItems(ALPHABET_ROWS).length, 52);
for (const { rows } of Object.values(BOOK_PRACTICE)) {
  for (const entry of expandPracticeSpeech(getPracticeItems(rows))) {
    assert.ok(entry.text && entry.meaning && typeof entry.spoken === 'string' && entry.spoken);
  }
}
assert.deepEqual(getGermanVoices([{ name: 'English', lang: 'en-US' }, { name: 'German standard', lang: 'de-DE' }, { name: 'Google Deutsch', lang: 'de-DE' }, { name: 'Swiss', lang: 'de-CH' }]).map((voice) => voice.name), ['Google Deutsch', 'German standard']);
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.ok(app.includes('path="/audio/:audioId"'));
assert.ok(app.includes('path="/deutschsprint"'));
const htaccess = readFileSync(new URL('../public/.htaccess', import.meta.url), 'utf8');
assert.ok(htaccess.includes('^/media/deutschsprint/'));
console.log('[check:deutschsprint] OK – 4 permanent recording IDs, route wiring, complete practice content and German voice selection');
