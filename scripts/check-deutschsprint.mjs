import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BOOK_AUDIO, audioPath, findBookAudio } from '../src/data/deutschsprintAudio.js';
import { BOOK_PRACTICE, ALPHABET_ROWS, SPECIAL_ROWS, SOUND_ROWS, DIALOG_ROWS, expandPracticeSpeech, getPracticeItems, getGermanVoices } from '../src/data/deutschsprintPractice.js';
import { LESSON01_GROUPS, LESSON01_PRACTICE, LESSON01_TEST, checkAnswer, checkNameSpelling, extractNameLetters, scoreTest } from '../src/data/deutschsprintExercises.js';

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
assert.ok(app.includes('path="/deutschsprint/a1/lektion-01/uebungen"'));
assert.deepEqual(LESSON01_GROUPS.map((group) => group.id), ['matching', 'missing', 'sounds', 'spelling', 'personal', 'test']);
assert.deepEqual(LESSON01_GROUPS.slice(0, 4).map((group) => group.questions.length), [5, 4, 5, 3]);
assert.equal(LESSON01_PRACTICE.length, 17);
assert.deepEqual(LESSON01_PRACTICE.map((question) => question.answer), ['a', 'm', 'h', 'z', 'b', 'B', 'I', 'O', 'Y', 'Ei', 'Sch', 'au', 'ie', 'Z', 'M – I – R – A', 'A – L – I', 'L – I – N – A']);
assert.deepEqual(LESSON01_TEST.map((question) => question.answer), ['26', 'b', 'ei', 'س', 'A – L – I']);
assert.equal(new Set([...LESSON01_PRACTICE, ...LESSON01_TEST].map((question) => question.id)).size, 22);
for (const question of [...LESSON01_PRACTICE, ...LESSON01_TEST]) {
  assert.ok(checkAnswer(question, question.answer));
  assert.ok(question.explanation);
  assert.equal(checkAnswer(question, ''), false);
  if (question.options) {
    assert.ok(question.options.includes(question.answer));
    assert.equal(question.options.filter((option) => checkAnswer(question, option)).length, 1);
  }
}
for (const group of LESSON01_GROUPS.filter((group) => group.review)) assert.ok(findBookAudio(group.review));
for (const question of LESSON01_TEST) assert.ok(findBookAudio(question.review));
const spelling = LESSON01_PRACTICE.find((question) => question.id === 'spell-mira');
assert.ok(checkAnswer(spelling, 'm-i-r-a'));
assert.ok(checkAnswer(spelling, 'M I R A'));
assert.equal(checkAnswer(spelling, 'MIRA'), false);
assert.equal(checkAnswer(spelling, 'M R I A'), false);
assert.ok(checkNameSpelling('Ali-Mira', 'A L I M I R A'));
assert.ok(checkNameSpelling('Änne', 'Ä-N-N-E'));
assert.ok(checkNameSpelling('Groß', 'G R O ẞ'));
assert.equal(checkNameSpelling('Ali', 'A I L'), false);
assert.equal(checkNameSpelling('Ali', 'ALI'), false);
assert.deepEqual(extractNameLetters('أحمد'), []);
assert.deepEqual(extractNameLetters('Ali123'), []);
const perfect = Object.fromEntries(LESSON01_TEST.map((question) => [question.id, question.answer]));
assert.deepEqual(scoreTest(perfect), { complete: true, score: 5, total: 5, passed: true });
assert.equal(scoreTest({ ...perfect, 'test-count': '30' }).passed, true);
assert.equal(scoreTest({ ...perfect, 'test-count': '30', 'test-lower': 'd' }).passed, false);
assert.equal(scoreTest({ ...perfect, 'test-count': undefined }).complete, false);
assert.equal(scoreTest({ ...perfect, 'test-count': ' 26 ' }).complete, false);
assert.equal(scoreTest({ ...perfect, 'test-count': ' 26 ' }).score, 4);
const htaccess = readFileSync(new URL('../public/.htaccess', import.meta.url), 'utf8');
assert.ok(htaccess.includes('^/media/deutschsprint/'));
console.log('[check:deutschsprint] OK – audio IDs, routes, book practice, German voices, 17 exercises and 5-question test');
