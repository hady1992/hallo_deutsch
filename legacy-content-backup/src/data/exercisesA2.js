export const exercisesA2 = [
  // --- Perfekt ---
  {
    id: 'a2-mc-1', type: 'multipleChoice', level: 'A2', topic: 'Perfekt', difficulty: 'medium',
    question: 'Ich ___ gestern Fußball gespielt.',
    options: ['bin', 'habe', 'sein', 'haben'],
    correctAnswer: 'habe',
    explanation: 'Das Verb "spielen" bildet das Perfekt mit "haben".',
    hint: 'Hilfsverb für spielen'
  },
  {
    id: 'a2-mc-2', type: 'multipleChoice', level: 'A2', topic: 'Perfekt', difficulty: 'medium',
    question: 'Wir ___ nach Hause gegangen.',
    options: ['sind', 'haben', 'werden', 'sein'],
    correctAnswer: 'sind',
    explanation: '"Gehen" ist ein Verb der Bewegung und bildet das Perfekt mit "sein" (wir sind).',
    hint: 'Bewegung -> sein'
  },
  {
    id: 'a2-mc-3', type: 'multipleChoice', level: 'A2', topic: 'Perfekt', difficulty: 'medium',
    question: 'Er ___ früh aufgewacht.',
    options: ['ist', 'hat', 'wird', 'sein'],
    correctAnswer: 'ist',
    explanation: '"Aufwachen" ist eine Zustandsänderung und nutzt "sein".',
    hint: 'Zustandsänderung -> sein'
  },
  
  // --- Präteritum ---
  {
    id: 'a2-fb-11', type: 'fillBlank', level: 'A2', topic: 'Präteritum', difficulty: 'medium',
    question: 'Gestern ___ ich krank. (sein)',
    correctAnswer: 'war',
    explanation: 'Das Präteritum von "sein" für "ich" ist "war".',
    hint: 'Präteritum: sein (ich)'
  },
  {
    id: 'a2-fb-12', type: 'fillBlank', level: 'A2', topic: 'Präteritum', difficulty: 'medium',
    question: 'Wir ___ viel Spaß. (haben)',
    correctAnswer: 'hatten',
    explanation: 'Das Präteritum von "haben" für "wir" ist "hatten".',
    hint: 'Präteritum: haben (wir)'
  },

  // --- Cases ---
  {
    id: 'a2-mc-21', type: 'multipleChoice', level: 'A2', topic: 'Cases', difficulty: 'medium',
    question: 'Ich helfe ___ Mann.',
    options: ['dem', 'den', 'der'],
    correctAnswer: 'dem',
    explanation: 'Das Verb "helfen" verlangt immer den Dativ. "Der Mann" wird zu "dem Mann".',
    hint: 'helfen + Dativ'
  },
  {
    id: 'a2-mc-22', type: 'multipleChoice', level: 'A2', topic: 'Cases', difficulty: 'medium',
    question: 'Das Buch gehört ___ Frau.',
    options: ['der', 'die', 'dem'],
    correctAnswer: 'der',
    explanation: '"Gehören" verlangt den Dativ. "Die Frau" wird zu "der Frau".',
    hint: 'gehören + Dativ'
  },
  {
    id: 'a2-mc-24', type: 'multipleChoice', level: 'A2', topic: 'Cases', difficulty: 'easy',
    question: 'Ich sehe ___ Hund.',
    options: ['den', 'dem', 'der'],
    correctAnswer: 'den',
    explanation: '"Sehen" verlangt den Akkusativ. "Der Hund" wird zu "den Hund".',
    hint: 'sehen + Akkusativ'
  },

  // --- Prepositions ---
  {
    id: 'a2-fb-31', type: 'fillBlank', level: 'A2', topic: 'Prepositions', difficulty: 'medium',
    question: 'Das Buch liegt auf ___ Tisch.',
    correctAnswer: 'dem',
    explanation: '"Liegen" beschreibt einen Ort (Wo?), daher Dativ (der Tisch -> dem Tisch).',
    hint: 'Wo? -> Dativ'
  },
  {
    id: 'a2-fb-32', type: 'fillBlank', level: 'A2', topic: 'Prepositions', difficulty: 'medium',
    question: 'Ich lege das Buch auf ___ Tisch.',
    correctAnswer: 'den',
    explanation: '"Legen" beschreibt eine Richtung/Bewegung (Wohin?), daher Akkusativ (der Tisch -> den Tisch).',
    hint: 'Wohin? -> Akkusativ'
  },

  // --- Connectors ---
  {
    id: 'a2-fb-41', type: 'fillBlank', level: 'A2', topic: 'Connectors', difficulty: 'medium',
    question: 'Ich gehe nicht raus, ___ es regnet.',
    correctAnswer: 'weil',
    explanation: 'Das Verb ist am Ende, daher benutzen wir "weil" (Nebensatz).',
    hint: 'Nebensatzkonjunktion'
  },
  {
    id: 'a2-fb-42', type: 'fillBlank', level: 'A2', topic: 'Connectors', difficulty: 'medium',
    question: 'Ich gehe nicht raus, ___ es regnet heute.',
    correctAnswer: 'denn',
    explanation: 'Das Verb ist an Position 2, daher benutzen wir "denn" (Hauptsatz).',
    hint: 'Hauptsatzkonjunktion'
  }
];