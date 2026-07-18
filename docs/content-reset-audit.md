# تدقيق إعادة ضبط المحتوى

تاريخ الجرد: 2026-07-18

## نقطة الرجوع

- الفرع قبل التعديل: `main`
- النسخة قبل التعديل: `326b11ab93da2954399246a07d788ba15fd9b057`
- Git tag: `before-content-reset-2026-07`
- النسخة المحلية: `legacy-content-backup/`
- عدد الملفات المنسوخة: 52 ملفًا.

## الدروس القديمة

- صفحات المستويات القديمة: `LevelA1.jsx`, `LevelA2.jsx`, `LevelB1.jsx`, `LevelB2.jsx`.
- مكوّن العرض القديم: `LevelContent.jsx`.
- كتالوج العدادات الثابتة: `staticLessonCatalog.js`.
- دروس A1 الثابتة: Alphabet, Greetings, Numbers, Colors, Days/Months,
  Personal Pronouns, Basic Verbs, Simple Sentence.

## ملفات المحتوى النصي القديمة

- Vocabulary: `vocabularyA1.js`, `vocabularyA2.js`, `vocabularyB1.js`,
  `vocabularyB2.js`, `vocabularyData.js`.
- Grammar: ملفات `grammarA1/A2/B1/B2` بنسختي `Complete` و`Full`.
- Exams: `examsA1.js`, `examsA2.js`, `examsB1.js`, `examsB2.js`.
- Exercises: `exercisesA1.js`, `exercisesA2.js`, `exercisesB1.js`,
  `exercisesB2.js`, `exercisesData.js`.
- Nouns: `nounsDatabase.js`.
- Verbs: `germanVerbsComprehensive.js`, `verbsComprehensive.js`.
- Placement test: `placementTestData.js`, `placementTestQuestions.js`.
- Default-data merger: `defaultData.js`.

## أدوات إنتاج قديمة أُحيلت إلى النسخة الاحتياطية

- أدوات العرض المحلية غير المستخدمة: `VerbsTab.jsx`, `GermanVerbsTab.jsx`.
- أداة القواعد المحلية القديمة: `GrammarRulesImporter.jsx`.
- أدوات المزامنة والتشخيص المحلي: `DataSyncStatus.jsx`, `StorageDebugPanel.jsx`.
- أداة نماذج الامتحانات المحلية: `ExamModelsImporter.jsx`.

هذه الأدوات لم تعد مستوردة في لوحة التحكم أو حزمة الإنتاج الجديدة.

## أنواع Supabase المقترح تنظيفها يدويًا

يستهدف ملف `supabase/reset_non_kids_content.sql` الأنواع التالية فقط:

- `lessons`
- `vocabulary`
- `nouns`
- `verbs`
- `grammar`
- `exercises`
- `placement_tests`
- `exams`

ويحتوي أيضًا تنظيفًا مشروطًا للجداول القديمة إن كانت موجودة:
`public.vocabulary`, `public.exercises`, `public.exams`,
`public.placement_tests`.

لم يتم تشغيل أي SQL تلقائيًا.

## مفاتيح localStorage القديمة

تُنظف migration أحادية التنفيذ المفاتيح التالية:

- `importedLessons`
- `importedVocabulary`
- `importedNouns`
- `importedVerbs`
- `importedGrammarRules`
- `importedExercises`
- `importedPlacementTests`
- `importedExams_A1`, `importedExams_A2`, `importedExams_B1`, `importedExams_B2`
- `importedExamModels`
- `manualQuestions` وكل مفتاح يبدأ بـ `manualQuestions_`

علامة اكتمال migration: `hallo_content_reset_v1_done`.

## المحتوى المحمي

لم تستهدف إعادة الضبط الأنواع التالية:

- `kids_vocabulary`
- `kids_conversations`
- `kids_verbs`
- `kids_exercises`
- `kids_topics`
- `custom_quizzes`

كما لا تستهدف migration مفاتيح الأطفال، جلسات Supabase، تسجيل الدخول،
المفضلة، إعدادات الصوت، أو تقدم المستخدم العام.
