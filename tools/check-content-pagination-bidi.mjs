import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getTextDirection } from '../src/utils/textDirection.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const directionCases = [
  ['Wie ___ du?', 'ltr'],
  ['___ du am Samstag kommen?', 'ltr'],
  ['123 – Wann beginnt der Kurs?', 'ltr'],
  ['ما معنى die Vertretung؟', 'rtl'],
  ['Ich bleibe zu Hause, weil ich krank ___.', 'ltr'],
];

for (const [value, expected] of directionCases) {
  assert.equal(getTextDirection(value), expected, `Unexpected text direction for: ${value}`);
}

const [pagination, repository, css] = await Promise.all([
  read('src/services/contentPagination.js'),
  read('src/services/contentRepository.js'),
  read('src/index.css'),
]);

assert.match(pagination, /\.range\(from, to\)/, 'content_items pagination must use range(from, to).');
assert.match(pagination, /\.order\('created_at'/, 'Pagination must order by created_at when available.');
assert.match(pagination, /\.order\('id'/, 'Pagination must use id as a stable ordering key.');
assert.match(pagination, /count:\s*'exact',\s*head:\s*true/, 'Published counts must use an exact head query.');
assert.match(repository, /fetchPublishedRowsPaginated/, 'The content repository must use the shared pagination helper.');
assert.doesNotMatch(css, /\*\s*\{[^}]*direction\s*:\s*rtl/si, 'Global RTL must not be applied to every DOM element.');

const bidiComponents = [
  'src/pages/Exercises.jsx',
  'src/components/ExerciseResults.jsx',
  'src/components/ExamComponent.jsx',
  'src/components/ExamReview.jsx',
  'src/components/course/LessonQuizStep.jsx',
  'src/components/placement/PlacementQuestion.jsx',
  'src/components/placement/PlacementReview.jsx',
  'src/components/ExerciseImporter.jsx',
];

for (const path of bidiComponents) {
  assert.match(await read(path), /BidiText/, `${path} must render dynamic text through BidiText.`);
}

console.log('Content pagination and bidi checks passed.');
