import { kidsQuizzesData } from '@/data/kidsQuizzesData';
import { kidsVocabularyData } from '@/data/kidsVocabularyData';
import { kidsVerbsDatabase } from '@/data/kidsVerbsDatabase';

export const getAvailableQuestions = () => {
    let allQuestions = [];

    // 1. From existing quizzes (High Quality)
    kidsQuizzesData.forEach(quiz => {
        quiz.questions.forEach((q, idx) => {
            allQuestions.push({
                id: `quiz_q_${quiz.id}_${idx}`,
                q: q.q,
                icon: q.icon,
                a: q.a,
                options: q.options,
                source: 'Quiz: ' + quiz.title
            });
        });
    });

    // Helper to get random items
    const getRandom = (arr, count) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // 2. From Vocabulary (Generated)
    kidsVocabularyData.forEach((item, idx) => {
        // Generate options: correct answer + 3 random others
        const otherItems = kidsVocabularyData.filter(i => i.id !== item.id);
        const distractors = getRandom(otherItems, 2).map(i => i.german);
        const options = [item.german, ...distractors].sort(() => 0.5 - Math.random());

        allQuestions.push({
            id: `vocab_q_${item.id}`,
            q: 'Was ist das?',
            icon: item.image,
            a: item.german,
            options: options,
            source: 'Vocabulary: ' + item.category
        });
    });

    // 3. From Verbs (Generated)
    kidsVerbsDatabase.forEach((item, idx) => {
        const otherItems = kidsVerbsDatabase.filter(i => i.id !== item.id);
        const distractors = getRandom(otherItems, 2).map(i => i.infinitive);
        const options = [item.infinitive, ...distractors].sort(() => 0.5 - Math.random());

        allQuestions.push({
            id: `verb_q_${item.id}`,
            q: 'Was macht er/sie?',
            icon: item.image,
            a: item.infinitive,
            options: options,
            source: 'Verb: ' + item.category
        });
    });

    return allQuestions;
};