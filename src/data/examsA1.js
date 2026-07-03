export const examsA1 = [
  {
    id: 'a1-exam-1',
    title: 'A1 Prüfung - Teil 1',
    description: 'Dieser Test prüft Grundkenntnisse: Artikel, Verben und einfache Sätze.',
    duration: 45,
    difficulty: 'Easy',
    questions: [
      {
        id: 'a1e1-1',
        question: 'Das ist ___ (ein/eine) Tisch.',
        options: ['ein', 'eine', 'einen', 'einem'],
        correctAnswer: 0,
        explanation: 'Tisch ist maskulin. Nominativ: ein.',
        hint: 'Maskulin Nominativ',
        category: 'Articles'
      },
      {
        id: 'a1e1-2',
        question: 'Ich habe ___ (kein/keine) Zeit.',
        options: ['keine', 'kein', 'nicht', 'keinen'],
        correctAnswer: 0,
        explanation: 'Zeit ist feminin. Akkusativ Negation: keine.',
        hint: 'Feminin Negation',
        category: 'Articles'
      },
      {
        id: 'a1e1-3',
        question: 'Wir essen ___ (der/den) Apfel.',
        options: ['den', 'der', 'das', 'dem'],
        correctAnswer: 0,
        explanation: 'Apfel ist maskulin. Akkusativ: den.',
        hint: 'Maskulin Akkusativ',
        category: 'Cases'
      },
      {
        id: 'a1e1-4',
        question: 'Ich brauche ___ (ein/einen) Stift.',
        options: ['einen', 'ein', 'eine', 'einem'],
        correctAnswer: 0,
        explanation: 'Stift ist maskulin. Akkusativ: einen.',
        hint: 'Maskulin Akkusativ',
        category: 'Cases'
      },
      {
        id: 'a1e1-5',
        question: 'Hast du ___ (eine/ein) Schwester?',
        options: ['eine', 'ein', 'einen', 'einer'],
        correctAnswer: 0,
        explanation: 'Schwester ist feminin. Akkusativ: eine.',
        hint: 'Feminin Akkusativ',
        category: 'Articles'
      },
      {
        id: 'a1e1-6',
        question: 'Das ist ___ (mein/meine) Vater.',
        options: ['mein', 'meine', 'meinen', 'meines'],
        correctAnswer: 0,
        explanation: 'Vater ist maskulin. Nominativ: mein.',
        hint: 'Maskulin Nominativ',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-7',
        question: 'Ich trinke ___ (kein/keinen) Saft.',
        options: ['keinen', 'kein', 'keine', 'nicht'],
        correctAnswer: 0,
        explanation: 'Saft ist maskulin. Akkusativ Negation: keinen.',
        hint: 'Maskulin Akkusativ Negation',
        category: 'Articles'
      },
      {
        id: 'a1e1-8',
        question: 'Das ist das Buch ___ (der/die) Frau.',
        options: ['der', 'die', 'dem', 'den'],
        correctAnswer: 0,
        explanation: 'Genitiv/Dativ der Frau (Besitz).',
        hint: 'der Frau',
        category: 'Cases'
      },
      {
        id: 'a1e1-9',
        question: 'Ich ___ (kommen) aus Italien.',
        options: ['komme', 'kommt', 'kommen', 'kommst'],
        correctAnswer: 0,
        explanation: 'ich komme.',
        hint: 'ich ...e',
        category: 'Verbs'
      },
      {
        id: 'a1e1-10',
        question: 'Du ___ (wohnen) in Berlin.',
        options: ['wohnst', 'wohne', 'wohnt', 'wohnen'],
        correctAnswer: 0,
        explanation: 'du wohnst.',
        hint: 'du ...st',
        category: 'Verbs'
      },
      {
        id: 'a1e1-11',
        question: 'Er ___ (spielen) Fußball.',
        options: ['spielt', 'spiele', 'spielst', 'spielen'],
        correctAnswer: 0,
        explanation: 'er spielt.',
        hint: 'er ...t',
        category: 'Verbs'
      },
      {
        id: 'a1e1-12',
        question: 'Wir ___ (lernen) Deutsch.',
        options: ['lernen', 'lerne', 'lernst', 'lernt'],
        correctAnswer: 0,
        explanation: 'wir lernen.',
        hint: 'wir ...en',
        category: 'Verbs'
      },
      {
        id: 'a1e1-13',
        question: 'Ihr ___ (machen) Hausaufgaben.',
        options: ['macht', 'machen', 'machst', 'mache'],
        correctAnswer: 0,
        explanation: 'ihr macht.',
        hint: 'ihr ...t',
        category: 'Verbs'
      },
      {
        id: 'a1e1-14',
        question: 'Sie (Pl) ___ (trinken) Wasser.',
        options: ['trinken', 'trinkt', 'trinkst', 'trinke'],
        correctAnswer: 0,
        explanation: 'sie trinken.',
        hint: 'sie ...en',
        category: 'Verbs'
      },
      {
        id: 'a1e1-15',
        question: '___ (Sein) du zu Hause?',
        options: ['Bist', 'Bin', 'Ist', 'Seid'],
        correctAnswer: 0,
        explanation: 'bist du.',
        hint: 'bist',
        category: 'Verbs'
      },
      {
        id: 'a1e1-16',
        question: 'Ich ___ (haben) Hunger.',
        options: ['habe', 'hast', 'hat', 'haben'],
        correctAnswer: 0,
        explanation: 'ich habe.',
        hint: 'habe',
        category: 'Verbs'
      },
      {
        id: 'a1e1-17',
        question: 'Wo ist Paul? ___ (Er/Es) kommt gleich.',
        options: ['Er', 'Sie', 'Es', 'Wir'],
        correctAnswer: 0,
        explanation: 'Paul = Er.',
        hint: 'Maskulin',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-18',
        question: 'Wo ist Anna? ___ (Sie/Es) liest.',
        options: ['Sie', 'Er', 'Es', 'Ihr'],
        correctAnswer: 0,
        explanation: 'Anna = Sie.',
        hint: 'Feminin',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-19',
        question: 'Das Kind schläft. ___ (Es/Er) ist müde.',
        options: ['Es', 'Er', 'Sie', 'Der'],
        correctAnswer: 0,
        explanation: 'Kind = Es.',
        hint: 'Neutral',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-20',
        question: 'Ich liebe ___ (dich/du).',
        options: ['dich', 'dir', 'du', 'dein'],
        correctAnswer: 0,
        explanation: 'du im Akkusativ = dich.',
        hint: 'Akkusativ',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-21',
        question: 'Das ist für ___ (mich/ich).',
        options: ['mich', 'mir', 'ich', 'mein'],
        correctAnswer: 0,
        explanation: 'für + Akkusativ = mich.',
        hint: 'für + Akk',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-22',
        question: 'Ich helfe ___ (dir/dich).',
        options: ['dir', 'dich', 'du', 'dein'],
        correctAnswer: 0,
        explanation: 'helfen + Dativ = dir.',
        hint: 'helfen + Dat',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-23',
        question: 'Wie geht es ___ (Ihnen/Sie)? (Formal)',
        options: ['Ihnen', 'Sie', 'Ihr', 'Ihn'],
        correctAnswer: 0,
        explanation: 'Dativ von Sie (Formal) = Ihnen.',
        hint: 'Ihnen',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-24',
        question: 'Das sind ___ (unsere/unser) Bücher.',
        options: ['unsere', 'unser', 'uns', 'wir'],
        correctAnswer: 0,
        explanation: 'Bücher (Pl) -> unsere.',
        hint: 'Plural',
        category: 'Pronouns'
      },
      {
        id: 'a1e1-25',
        question: 'Richte: (bin - Ich - müde)',
        options: ['Ich bin müde', 'Bin Ich müde', 'Müde ich bin', 'Ich müde bin'],
        correctAnswer: 0,
        explanation: 'Ich bin müde.',
        hint: 'Ich ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-26',
        question: 'Richte: (du - Wohnst - hier - ?)',
        options: ['Wohnst du hier ?', 'Du wohnst hier ?', 'Hier wohnst du ?', 'Wohnst hier du ?'],
        correctAnswer: 0,
        explanation: 'Wohnst du hier?',
        hint: 'Wohnst ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-27',
        question: 'Richte: (nicht - Ich - schlafe)',
        options: ['Ich schlafe nicht', 'Ich nicht schlafe', 'Nicht ich schlafe', 'Schlafe ich nicht'],
        correctAnswer: 0,
        explanation: 'Ich schlafe nicht.',
        hint: 'Ich ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-28',
        question: 'Richte: (komme - aus - Ich - Spanien)',
        options: ['Ich komme aus Spanien', 'Aus Spanien komme Ich', 'Ich aus Spanien komme', 'Komme ich aus Spanien'],
        correctAnswer: 0,
        explanation: 'Ich komme aus Spanien.',
        hint: 'Ich ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-29',
        question: 'Richte: (alt - Wie - du - bist - ?)',
        options: ['Wie alt bist du ?', 'Wie bist du alt ?', 'Bist du wie alt ?', 'Alt wie bist du ?'],
        correctAnswer: 0,
        explanation: 'Wie alt bist du?',
        hint: 'Wie alt ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-30',
        question: 'Richte: (gern - spiele - Ich - Tennis)',
        options: ['Ich spiele gern Tennis', 'Ich gern spiele Tennis', 'Spiele ich gern Tennis', 'Tennis spiele ich gern'],
        correctAnswer: 0,
        explanation: 'Ich spiele gern Tennis.',
        hint: 'Ich spiele ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-31',
        question: 'Richte: (Heute - ist - Freitag)',
        options: ['Heute ist Freitag', 'Freitag ist Heute', 'Ist Heute Freitag', 'Heute Freitag ist'],
        correctAnswer: 0,
        explanation: 'Heute ist Freitag.',
        hint: 'Heute ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-32',
        question: 'Richte: (mein - Das - Bruder - ist)',
        options: ['Das ist mein Bruder', 'Mein Bruder ist das', 'Ist das mein Bruder', 'Das mein Bruder ist'],
        correctAnswer: 0,
        explanation: 'Das ist mein Bruder.',
        hint: 'Das ist ...',
        category: 'Sentence Structure'
      },
      {
        id: 'a1e1-33',
        question: 'Ich ___ (können) schwimmen.',
        options: ['kann', 'können', 'kannst', 'könnt'],
        correctAnswer: 0,
        explanation: 'ich kann.',
        hint: 'kann',
        category: 'Modals'
      },
      {
        id: 'a1e1-34',
        question: 'Du ___ (müssen) lernen.',
        options: ['musst', 'muss', 'müssen', 'müsst'],
        correctAnswer: 0,
        explanation: 'du musst.',
        hint: 'musst',
        category: 'Modals'
      },
      {
        id: 'a1e1-35',
        question: 'Wir ___ (wollen) essen.',
        options: ['wollen', 'will', 'willst', 'wollt'],
        correctAnswer: 0,
        explanation: 'wir wollen.',
        hint: 'wollen',
        category: 'Modals'
      },
      {
        id: 'a1e1-36',
        question: 'Er ___ (mögen) Eis.',
        options: ['mag', 'mögt', 'mögen', 'mags'],
        correctAnswer: 0,
        explanation: 'er mag.',
        hint: 'mag',
        category: 'Modals'
      },
      {
        id: 'a1e1-37',
        question: 'Hier ___ (dürfen) man parken.',
        options: ['darf', 'darfst', 'dürfen', 'dürft'],
        correctAnswer: 0,
        explanation: 'man darf.',
        hint: 'darf',
        category: 'Modals'
      },
      {
        id: 'a1e1-38',
        question: '___ (Möchten) Sie Kaffee?',
        options: ['Möchten', 'Möchte', 'Möchtest', 'Möchtet'],
        correctAnswer: 0,
        explanation: 'Möchten Sie.',
        hint: 'Möchten',
        category: 'Modals'
      },
      {
        id: 'a1e1-39',
        question: 'Ich ___ (sollen) schlafen.',
        options: ['soll', 'sollt', 'sollen', 'sollst'],
        correctAnswer: 0,
        explanation: 'ich soll.',
        hint: 'soll',
        category: 'Modals'
      },
      {
        id: 'a1e1-40',
        question: 'Ihr ___ (können) tanzen.',
        options: ['könnt', 'kannst', 'können', 'kann'],
        correctAnswer: 0,
        explanation: 'ihr könnt.',
        hint: 'könnt',
        category: 'Modals'
      }
    ]
  },
  {
    id: 'a1-exam-2',
    title: 'A1 Prüfung - Teil 2',
    description: 'Dieser Test konzentriert sich auf Plural, Präpositionen und Wortschatz.',
    duration: 45,
    difficulty: 'Easy',
    questions: [
      {
        id: 'a1e2-1',
        question: 'Plural von "das Haus": die ___',
        options: ['Häuser', 'Hause', 'Hausen', 'Hauser'],
        correctAnswer: 0,
        explanation: 'Häuser (Umlaut + er).',
        hint: 'Häuser',
        category: 'Nouns'
      },
      {
        id: 'a1e2-2',
        question: 'Plural von "die Blume": die ___',
        options: ['Blumen', 'Blume', 'Blumer', 'Blumes'],
        correctAnswer: 0,
        explanation: 'Blumen (n-Endung).',
        hint: 'Blumen',
        category: 'Nouns'
      },
      {
        id: 'a1e2-3',
        question: 'Plural von "der Vater": die ___',
        options: ['Väter', 'Vaters', 'Vater', 'Vätern'],
        correctAnswer: 0,
        explanation: 'Väter (Umlaut).',
        hint: 'Väter',
        category: 'Nouns'
      },
      {
        id: 'a1e2-4',
        question: 'Plural von "das Bild": die ___',
        options: ['Bilder', 'Bilde', 'Bilden', 'Bilds'],
        correctAnswer: 0,
        explanation: 'Bilder (er-Endung).',
        hint: 'Bilder',
        category: 'Nouns'
      },
      {
        id: 'a1e2-5',
        question: 'Plural von "der Tisch": die ___',
        options: ['Tische', 'Tisch', 'Tischs', 'Tischen'],
        correctAnswer: 0,
        explanation: 'Tische (e-Endung).',
        hint: 'Tische',
        category: 'Nouns'
      },
      {
        id: 'a1e2-6',
        question: 'Plural von "das Radio": die ___',
        options: ['Radios', 'Radio', 'Radien', 'Radier'],
        correctAnswer: 0,
        explanation: 'Radios (s-Endung).',
        hint: 'Radios',
        category: 'Nouns'
      },
      {
        id: 'a1e2-7',
        question: 'Plural von "die Tasche": die ___',
        options: ['Taschen', 'Tasche', 'Tascher', 'Tasches'],
        correctAnswer: 0,
        explanation: 'Taschen (n-Endung).',
        hint: 'Taschen',
        category: 'Nouns'
      },
      {
        id: 'a1e2-8',
        question: 'Plural von "der Freund": die ___',
        options: ['Freunde', 'Freund', 'Freunden', 'Freunder'],
        correctAnswer: 0,
        explanation: 'Freunde (e-Endung).',
        hint: 'Freunde',
        category: 'Nouns'
      },
      {
        id: 'a1e2-9',
        question: 'Ich ___ (sein) glücklich.',
        options: ['bin', 'bist', 'ist', 'sind'],
        correctAnswer: 0,
        explanation: 'ich bin.',
        hint: 'bin',
        category: 'Verbs'
      },
      {
        id: 'a1e2-10',
        question: 'Wir ___ (sein) müde.',
        options: ['sind', 'seid', 'ist', 'bin'],
        correctAnswer: 0,
        explanation: 'wir sind.',
        hint: 'sind',
        category: 'Verbs'
      },
      {
        id: 'a1e2-11',
        question: 'Ihr ___ (sein) hier.',
        options: ['seid', 'sind', 'ist', 'bist'],
        correctAnswer: 0,
        explanation: 'ihr seid.',
        hint: 'seid',
        category: 'Verbs'
      },
      {
        id: 'a1e2-12',
        question: 'Du ___ (haben) Zeit.',
        options: ['hast', 'habe', 'hat', 'haben'],
        correctAnswer: 0,
        explanation: 'du hast.',
        hint: 'hast',
        category: 'Verbs'
      },
      {
        id: 'a1e2-13',
        question: 'Er ___ (haben) ein Auto.',
        options: ['hat', 'hast', 'habe', 'haben'],
        correctAnswer: 0,
        explanation: 'er hat.',
        hint: 'hat',
        category: 'Verbs'
      },
      {
        id: 'a1e2-14',
        question: 'Sie (Pl) ___ (haben) Geld.',
        options: ['haben', 'hat', 'hast', 'habe'],
        correctAnswer: 0,
        explanation: 'sie haben.',
        hint: 'haben',
        category: 'Verbs'
      },
      {
        id: 'a1e2-15',
        question: '___ (Sein) Sie Herr Müller?',
        options: ['Sind', 'Seid', 'Ist', 'Bin'],
        correctAnswer: 0,
        explanation: 'Sind Sie.',
        hint: 'Sind',
        category: 'Verbs'
      },
      {
        id: 'a1e2-16',
        question: 'Das Wetter ___ (sein) gut.',
        options: ['ist', 'sind', 'bist', 'bin'],
        correctAnswer: 0,
        explanation: 'Es ist.',
        hint: 'ist',
        category: 'Verbs'
      },
      {
        id: 'a1e2-17',
        question: 'Übersetze: Ich verstehe nicht.',
        options: ['Ich verstehe nicht', 'Ich nicht verstehe', 'Nicht ich verstehe', 'Ich verstehe kein'],
        correctAnswer: 0,
        explanation: 'Ich verstehe nicht.',
        hint: 'Verstehe nicht',
        category: 'Translation'
      },
      {
        id: 'a1e2-18',
        question: 'Übersetze: Lernst du Deutsch?',
        options: ['Lernst du Deutsch?', 'Lernen du Deutsch?', 'Lernst Deutsch du?', 'Du lernst Deutsch?'],
        correctAnswer: 0,
        explanation: 'Lernst du Deutsch?',
        hint: 'Lernst du',
        category: 'Translation'
      },
      {
        id: 'a1e2-19',
        question: 'Übersetze: Wie heißt du?',
        options: ['Wie heißt du?', 'Wie du heißt?', 'Was ist dein Name?', 'Wie heißen du?'],
        correctAnswer: 0,
        explanation: 'Wie heißt du?',
        hint: 'Wie heißt',
        category: 'Translation'
      },
      {
        id: 'a1e2-20',
        question: 'Übersetze: Ich komme aus Berlin.',
        options: ['Ich komme aus Berlin', 'Ich bin von Berlin', 'Ich komme von Berlin', 'Ich aus Berlin'],
        correctAnswer: 0,
        explanation: 'Ich komme aus Berlin.',
        hint: 'komme aus',
        category: 'Translation'
      },
      {
        id: 'a1e2-21',
        question: 'Übersetze: Guten Abend.',
        options: ['Guten Abend', 'Guten Morgen', 'Gute Nacht', 'Guten Tag'],
        correctAnswer: 0,
        explanation: 'Guten Abend.',
        hint: 'Abend',
        category: 'Translation'
      },
      {
        id: 'a1e2-22',
        question: 'Übersetze: Danke schön.',
        options: ['Danke schön', 'Bitte schön', 'Guten Tag', 'Hallo'],
        correctAnswer: 0,
        explanation: 'Danke schön.',
        hint: 'Danke',
        category: 'Translation'
      },
      {
        id: 'a1e2-23',
        question: 'Übersetze: Bis bald.',
        options: ['Bis bald', 'Auf Wiedersehen', 'Tschüss', 'Hallo'],
        correctAnswer: 0,
        explanation: 'Bis bald.',
        hint: 'Bald',
        category: 'Translation'
      },
      {
        id: 'a1e2-24',
        question: 'Übersetze: Entschuldigung.',
        options: ['Entschuldigung', 'Bitte', 'Hallo', 'Danke'],
        correctAnswer: 0,
        explanation: 'Entschuldigung.',
        hint: 'Entschuldigung',
        category: 'Translation'
      },
      {
        id: 'a1e2-25',
        question: 'Das ist ___ (ein) Computer.',
        options: ['ein', 'eine', 'einen', 'der'],
        correctAnswer: 0,
        explanation: 'Computer ist maskulin. Nominativ: ein.',
        hint: 'Maskulin Nominativ',
        category: 'Articles'
      },
      {
        id: 'a1e2-26',
        question: 'Ich kaufe ___ (der) Ball.',
        options: ['den', 'das', 'der', 'dem'],
        correctAnswer: 0,
        explanation: 'Ball ist maskulin. Akkusativ: den.',
        hint: 'Maskulin Akkusativ',
        category: 'Cases'
      },
      {
        id: 'a1e2-27',
        question: 'Wir haben ___ (kein) Brot.',
        options: ['kein', 'keine', 'keinen', 'nicht'],
        correctAnswer: 0,
        explanation: 'Brot ist neutral. Akkusativ Negation: kein.',
        hint: 'Neutral Negation',
        category: 'Articles'
      },
      {
        id: 'a1e2-28',
        question: 'Ist das ___ (dein) Tasche?',
        options: ['deine', 'dein', 'deinen', 'dir'],
        correctAnswer: 0,
        explanation: 'Tasche ist feminin. Possessiv: deine.',
        hint: 'Feminin Possessiv',
        category: 'Pronouns'
      },
      {
        id: 'a1e2-29',
        question: 'Ich esse ___ (ein) Salat.',
        options: ['einen', 'ein', 'eine', 'der'],
        correctAnswer: 0,
        explanation: 'Salat ist maskulin. Akkusativ: einen.',
        hint: 'Maskulin Akkusativ',
        category: 'Cases'
      },
      {
        id: 'a1e2-30',
        question: 'Ich trinke ___ (kein) Wein.',
        options: ['keinen', 'kein', 'keine', 'nicht'],
        correctAnswer: 0,
        explanation: 'Wein ist maskulin. Akkusativ Negation: keinen.',
        hint: 'Maskulin Akkusativ',
        category: 'Articles'
      },
      {
        id: 'a1e2-31',
        question: 'Er wohnt ___ (in) Paris.',
        options: ['in', 'aus', 'bei', 'nach'],
        correctAnswer: 0,
        explanation: 'in Paris.',
        hint: 'in',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-32',
        question: 'Wir gehen ___ (nach) Hause.',
        options: ['nach', 'zu', 'in', 'bei'],
        correctAnswer: 0,
        explanation: 'nach Hause (Richtung).',
        hint: 'nach',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-33',
        question: 'Wir sind ___ (zu) Hause.',
        options: ['zu', 'nach', 'in', 'bei'],
        correctAnswer: 0,
        explanation: 'zu Hause (Ort).',
        hint: 'zu',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-34',
        question: 'Ich fahre ___ (mit) dem Zug.',
        options: ['mit', 'bei', 'in', 'zu'],
        correctAnswer: 0,
        explanation: 'mit dem Zug.',
        hint: 'mit',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-35',
        question: 'Das Buch liegt ___ (auf) dem Tisch.',
        options: ['auf', 'in', 'an', 'zu'],
        correctAnswer: 0,
        explanation: 'auf dem Tisch.',
        hint: 'auf',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-36',
        question: 'Das Bild hängt ___ (an) der Wand.',
        options: ['an', 'auf', 'in', 'bei'],
        correctAnswer: 0,
        explanation: 'an der Wand.',
        hint: 'an',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-37',
        question: 'Ich gehe ___ (in) die Schule.',
        options: ['in', 'nach', 'zu', 'bei'],
        correctAnswer: 0,
        explanation: 'in die Schule.',
        hint: 'in',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-38',
        question: 'Er kommt ___ (aus) der Schweiz.',
        options: ['aus', 'von', 'in', 'nach'],
        correctAnswer: 0,
        explanation: 'aus der Schweiz.',
        hint: 'aus',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-39',
        question: 'Ich spreche ___ (mit) dir.',
        options: ['mit', 'bei', 'zu', 'von'],
        correctAnswer: 0,
        explanation: 'mit dir.',
        hint: 'mit',
        category: 'Prepositions'
      },
      {
        id: 'a1e2-40',
        question: 'Das ist ___ (für) mich.',
        options: ['für', 'mit', 'zu', 'bei'],
        correctAnswer: 0,
        explanation: 'für mich.',
        hint: 'für',
        category: 'Prepositions'
      }
    ]
  }
];