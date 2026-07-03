export const exercisesA1 = [
  // --- Articles ---
  {
    id: 'a1-mc-1', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'easy',
    question: 'Das ist ___ Mann.',
    options: ['der', 'die', 'das', 'den'],
    correctAnswer: 'der',
    explanation: 'Mann ist maskulin (der Mann).',
    hint: 'Nominativ Maskulin'
  },
  {
    id: 'a1-mc-2', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'easy',
    question: 'Das ist ___ Frau.',
    options: ['die', 'der', 'das', 'dem'],
    correctAnswer: 'die',
    explanation: 'Frau ist feminin (die Frau).',
    hint: 'Nominativ Feminin'
  },
  {
    id: 'a1-mc-3', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'easy',
    question: 'Das ist ___ Kind.',
    options: ['das', 'der', 'die', 'den'],
    correctAnswer: 'das',
    explanation: 'Kind ist neutral (das Kind).',
    hint: 'Nominativ Neutral'
  },
  {
    id: 'a1-mc-4', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'medium',
    question: 'Ich habe ___ Bruder.',
    options: ['einen', 'ein', 'eine', 'einem'],
    correctAnswer: 'einen',
    explanation: 'Bruder ist maskulin. Im Akkusativ wird "ein" zu "einen".',
    hint: 'Akkusativ Maskulin'
  },
  {
    id: 'a1-mc-5', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'medium',
    question: 'Ich esse ___ Apfel.',
    options: ['einen', 'ein', 'eine', 'einem'],
    correctAnswer: 'einen',
    explanation: 'Apfel ist maskulin. "Essen" verlangt den Akkusativ.',
    hint: 'Akkusativ Maskulin'
  },
  {
    id: 'a1-mc-6', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'medium',
    question: 'Das ist ___ Lampe.',
    options: ['eine', 'ein', 'einen'],
    correctAnswer: 'eine',
    explanation: 'Lampe ist feminin. Der unbestimmte Artikel ist "eine".',
    hint: 'Nominativ Feminin'
  },
  {
    id: 'a1-mc-7', type: 'multipleChoice', level: 'A1', topic: 'Articles', difficulty: 'medium',
    question: 'Wir haben ___ Zeit.',
    options: ['keine', 'kein', 'keinen'],
    correctAnswer: 'keine',
    explanation: 'Zeit ist feminin. Die Verneinung ist "keine".',
    hint: 'Negation Feminin'
  },
  
  // --- Verbs ---
  {
    id: 'a1-fb-11', type: 'fillBlank', level: 'A1', topic: 'Verbs', difficulty: 'easy',
    question: 'Ich ___ gern Fußball.',
    correctAnswer: 'spiele',
    explanation: 'Konjugation für "ich" endet auf -e (spielen -> spiele).',
    hint: 'Verb: spielen (ich)'
  },
  {
    id: 'a1-fb-12', type: 'fillBlank', level: 'A1', topic: 'Verbs', difficulty: 'easy',
    question: 'Du ___ schnell.',
    correctAnswer: 'lernst',
    explanation: 'Konjugation für "du" endet auf -st (lernen -> lernst).',
    hint: 'Verb: lernen (du)'
  },
  {
    id: 'a1-fb-13', type: 'fillBlank', level: 'A1', topic: 'Verbs', difficulty: 'easy',
    question: 'Er ___ in München.',
    correctAnswer: 'wohnt',
    explanation: 'Konjugation für "er/sie/es" endet auf -t (wohnen -> wohnt).',
    hint: 'Verb: wohnen (er)'
  },
  {
    id: 'a1-fb-16', type: 'fillBlank', level: 'A1', topic: 'Verbs', difficulty: 'easy',
    question: 'Sie (Plural) ___ morgen.',
    correctAnswer: 'kommen',
    explanation: 'Konjugation für "Sie/sie (Plural)" ist der Infinitiv (kommen).',
    hint: 'Verb: kommen (sie Plural)'
  },
  
  // --- Word Order ---
  {
    id: 'a1-wo-21', type: 'wordOrder', level: 'A1', topic: 'Word Order', difficulty: 'medium',
    question: 'Richte den Satz:',
    words: ['bin', 'Ich', 'müde'],
    correctAnswer: 'Ich bin müde',
    explanation: 'Subjekt (Ich) - Verb (bin) - Adjektiv (müde).',
    hint: 'Satzstruktur: S-V-O'
  },
  {
    id: 'a1-wo-22', type: 'wordOrder', level: 'A1', topic: 'Word Order', difficulty: 'medium',
    question: 'Richte die Frage:',
    words: ['du', 'Wohnst', 'hier', '?'],
    correctAnswer: 'Wohnst du hier ?',
    explanation: 'Bei Ja/Nein-Fragen steht das Verb an erster Stelle.',
    hint: 'Verb zuerst'
  },
  
  // --- Pronouns ---
  {
    id: 'a1-mc-31', type: 'multipleChoice', level: 'A1', topic: 'Pronouns', difficulty: 'medium',
    question: 'Ich höre ___ (du).',
    options: ['dich', 'du', 'dir'],
    correctAnswer: 'dich',
    explanation: 'Das Verb "hören" verlangt den Akkusativ. "Du" wird zu "dich".',
    hint: 'Akkusativ von du'
  },
  {
    id: 'a1-mc-32', type: 'multipleChoice', level: 'A1', topic: 'Pronouns', difficulty: 'easy',
    question: 'Wo ist Peter? ___ ist hier.',
    options: ['Er', 'Es', 'Sie'],
    correctAnswer: 'Er',
    explanation: 'Peter ist männlich, also benutzen wir das Pronomen "Er".',
    hint: 'Maskulin Pronomen'
  },
  
  // --- General ---
  {
    id: 'a1-fb-41', type: 'fillBlank', level: 'A1', topic: 'General', difficulty: 'easy',
    question: 'Guten ___ (06:00 - 11:00).',
    correctAnswer: 'Morgen',
    explanation: 'Am Morgen sagt man "Guten Morgen".',
    hint: 'Begrüßung'
  },
  {
    id: 'a1-fb-44', type: 'fillBlank', level: 'A1', topic: 'Numbers', difficulty: 'easy',
    question: 'eins, zwei, ___ .',
    correctAnswer: 'drei',
    explanation: 'Die Zahl nach zwei ist drei.',
    hint: 'Zahl 3'
  }
];