import assert from 'node:assert/strict';
import {
  buildExerciseTaxonomy,
  getExerciseSkillKey,
  getExerciseUnitKey,
} from '../src/utils/exerciseTaxonomy.js';

const cases = [
  [{ category: 'Satzbau' }, 'grammar'],
  [{ category: 'Dativ' }, 'grammar'],
  [{ category: 'Wortschatz' }, 'vocabulary'],
  [{ category: 'Leseverstehen' }, 'reading'],
  [{ category: 'Kommunikation' }, 'communication'],
  [{ category: 'Wortschatz', audioText: 'Guten Morgen' }, 'listening'],
];

cases.forEach(([exercise, expected]) => {
  assert.equal(getExerciseSkillKey(exercise), expected, `${exercise.category || 'audioText'} should map to ${expected}`);
});

assert.equal(getExerciseUnitKey({ unit: 'A1-03' }), 'A1-03');
assert.equal(getExerciseUnitKey({ metadata: { unit: 'A1-04' } }), 'A1-04');
assert.equal(getExerciseUnitKey({ lessonId: 'A1-05-02' }), 'A1-05');
assert.equal(getExerciseUnitKey({ id: 'a1-09-ex-003' }), 'A1-09');
assert.equal(getExerciseUnitKey({ id: 'uuid-without-a-unit' }), 'general');

const sampleExercises = cases.map(([exercise], index) => ({
  id: `sample-${index}`,
  unit: index < 3 ? 'A1-01' : 'A1-02',
  ...exercise,
}));
const taxonomy = buildExerciseTaxonomy(sampleExercises);
assert.equal(taxonomy.units.length, 2);
assert.ok(taxonomy.topics.length > 0);
assert.equal(sampleExercises.every((exercise) => Boolean(getExerciseSkillKey(exercise))), true);

console.log('Exercise taxonomy checks passed.');
