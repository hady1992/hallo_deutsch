import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readProjectFile = (relativePath) => readFileSync(
  fileURLToPath(new URL(`../${relativePath}`, import.meta.url)),
  'utf8'
);

const importer = readProjectFile('src/components/DataImportUtility.jsx');
const manager = readProjectFile('src/components/AdminDataManager.jsx');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const rejectText = (source, text, message) => {
  if (source.includes(text)) throw new Error(message);
};

requireText(importer, 'data-testid="selected-import-file-panel"', 'Selected import file panel is missing.');
requireText(importer, 'data-testid="import-file-action"', 'The explicit import action is missing.');
requireText(importer, 'استيراد الآن', 'The visible Arabic import label is missing.');
rejectText(importer, "animate={{ opacity: 1, height: 'auto' }}", 'Height animation can clip the import actions.');

for (const callback of ['fetchExercises', 'fetchVocabulary', 'fetchExams', 'fetchPlacementTests']) {
  requireText(manager, `fetchData={${callback}}`, `${callback} must be passed as a stable callback.`);
  rejectText(manager, `fetchData={() => ${callback}()}`, `${callback} inline wrapper can restart the admin fetch loop.`);
}

console.log('Critical admin and import checks passed.');
