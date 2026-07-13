import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readProjectFile = (relativePath) => readFileSync(
  fileURLToPath(new URL(`../${relativePath}`, import.meta.url)),
  'utf8'
);

const importer = readProjectFile('src/components/DataImportUtility.jsx');
const manager = readProjectFile('src/components/AdminDataManager.jsx');
const adminPanel = readProjectFile('src/pages/AdminPanel.jsx');
const lessonUploader = readProjectFile('src/components/LessonUploader.jsx');
const contentRepository = readProjectFile('src/services/contentRepository.js');

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

requireText(adminPanel, "id: 'lessons'", 'The admin lessons section is missing.');
requireText(adminPanel, '<LessonUploader', 'LessonUploader is not connected to the admin panel.');
requireText(adminPanel, 'templateFormat="json"', 'The admin lesson uploader must use a JSON template.');
requireText(adminPanel, 'ملفات الدروس تُرفع من هنا فقط، وليس من قسم الأسماء أو المفردات.', 'Lesson upload guidance is missing.');
requireText(lessonUploader, "getPublishedContent('lessons'", 'Published lessons list is not connected to content_items.');
requireText(lessonUploader, 'data-testid="lesson-import-report"', 'Lesson import report is missing.');
requireText(lessonUploader, 'محلي فقط — لن يظهر للزوار', 'Cloud failure status is missing from LessonUploader.');
requireText(lessonUploader, 'unpublishLesson(lesson)', 'Supabase lesson unpublish action is missing.');
requireText(lessonUploader, 'deleteImportedLesson(lesson.id)', 'Local lesson delete action is missing.');
requireText(lessonUploader, 'هل أنت متأكد من حذف هذا الدرس؟ لن يظهر للزوار بعد الحذف.', 'Lesson unpublish confirmation is missing.');
requireText(contentRepository, ".update({ is_published: false })", 'Lessons must use soft delete through is_published=false.');
requireText(contentRepository, "dispatchContentEvents('lessons')", 'Lesson unpublish must refresh public lesson views and counts.');

console.log('Critical admin and import checks passed.');
