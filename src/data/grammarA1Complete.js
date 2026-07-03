export const grammarA1Complete = [
  {
    id: 'a1-cases-intro',
    title: 'مقدمة في الحالات الإعرابية (Die 4 Fälle)',
    level: 'A1',
    category: 'Cases',
    explanation: {
      ar: 'اللغة الألمانية تحتوي على أربع حالات إعرابية تحدد وظيفة الاسم في الجملة. هذه الحالات هي: Nominativ (الفاعل)، Akkusativ (المفعول به المباشر)، Dativ (المفعول به غير المباشر)، و Genitiv (المضاف إليه). في مستوى A1، نركز بشكل أساسي على Nominativ و Akkusativ.',
      de: 'Einführung in die vier Fälle: Nominativ, Akkusativ, Dativ, Genitiv.'
    },
    examples: [
      { de: 'Der Mann (Nom) isst den Apfel (Akk).', ar: 'الرجل يأكل التفاحة.', note: 'الفاعل vs المفعول به' },
      { de: 'Das ist ein Buch (Nom).', ar: 'هذا كتاب.', note: 'فعل sein يأخذ دائماً Nominativ' }
    ],
    tables: {
      headers: ['Fall', 'Maskulin', 'Feminin', 'Neutrum', 'Plural'],
      rows: [
        ['Nominativ', 'der / ein', 'die / eine', 'das / ein', 'die / -'],
        ['Akkusativ', 'den / einen', 'die / eine', 'das / ein', 'die / -']
      ]
    },
    notes: ['تتغير أداة المذكر فقط في حالة الأكوستيف (der -> den, ein -> einen).'],
    tips: ['احفظ الأفعال التي تأخذ أكوستيف مثل haben, essen, trinken.']
  },
  {
    id: 'a1-pronouns',
    title: 'الضمائر الشخصية (Personalpronomen)',
    level: 'A1',
    category: 'Pronouns',
    explanation: {
      ar: 'الضمائر الشخصية تستخدم للتعويض عن الأسماء. تتغير هذه الضمائر حسب الحالة الإعرابية (Nominativ vs Akkusativ).',
      de: 'Ich, du, er, sie, es...'
    },
    examples: [
      { de: 'Ich liebe dich.', ar: 'أنا أحبك.', note: 'ich (Nom) -> dich (Akk)' },
      { de: 'Er sieht uns.', ar: 'هو يرانا.', note: 'er (Nom) -> uns (Akk)' }
    ],
    tables: {
      headers: ['Person', 'Nominativ', 'Akkusativ'],
      rows: [
        ['Ich', 'ich', 'mich'],
        ['Du', 'du', 'dich'],
        ['Er', 'er', 'ihn'],
        ['Sie', 'sie', 'sie'],
        ['Es', 'es', 'es'],
        ['Wir', 'wir', 'uns'],
        ['Ihr', 'ihr', 'euch'],
        ['Sie/sie', 'Sie/sie', 'Sie/sie']
      ]
    },
    notes: ['لاحظ أن sie (هي) و sie (هم) و Sie (حضرتك) يتشابهون في الشكل لكن يختلفون في المعنى وتصريف الفعل.']
  },
  {
    id: 'a1-sentence-structure',
    title: 'ترتيب الكلمات: الجملة البسيطة (Satzbau)',
    level: 'A1',
    category: 'Word Order',
    explanation: {
      ar: 'القاعدة الذهبية في اللغة الألمانية: الفعل المصرف يأتي دائماً في الموقع الثاني في الجملة الخبرية (Aussagesatz). العنصر الأول يمكن أن يكون الفاعل أو ظرف الزمان أو المكان.',
      de: 'Verb an Position 2.'
    },
    examples: [
      { de: 'Ich gehe heute ins Kino.', ar: 'أنا ذاهب اليوم للسينما.', note: 'الفاعل أولاً' },
      { de: 'Heute gehe ich ins Kino.', ar: 'اليوم أذهب أنا للسينما.', note: 'الظرف أولاً، الفاعل بعد الفعل' }
    ],
    notes: ['إذا بدأت الجملة بغير الفاعل، يجب أن يأتي الفاعل مباشرة بعد الفعل (Inversion).']
  },
  {
    id: 'a1-negation',
    title: 'النفي: nicht vs kein',
    level: 'A1',
    category: 'Negation',
    explanation: {
      ar: 'نستخدم "kein" لنفي الأسماء التي تأتي مع أداة نكرة أو بدون أداة. نستخدم "nicht" لنفي الأفعال، الصفات، والأسماء المعرفة.',
      de: 'Verneinung mit nicht und kein.'
    },
    examples: [
      { de: 'Das ist kein Apfel.', ar: 'هذه ليست تفاحة.', note: 'نفي اسم نكرة' },
      { de: 'Ich schlafe nicht.', ar: 'أنا لا أنام.', note: 'نفي فعل' },
      { de: 'Das Auto ist nicht rot.', ar: 'السيارة ليست حمراء.', note: 'نفي صفة' }
    ],
    tips: ['تذكر: kein + اسم. nicht + فعل/صفة.']
  },
  {
    id: 'a1-modal-verbs',
    title: 'الأفعال الناقصة (Modalverben)',
    level: 'A1',
    category: 'Verbs',
    explanation: {
      ar: 'الأفعال الناقصة (können, müssen, wollen, dürfen, sollen, mögen) تغير معنى الجملة لتفيد الإمكانية، الضرورة، أو الرغبة. في الجملة البسيطة، يأتي الفعل الناقص مصرفاً في الموقع الثاني، والفعل الأساسي في المصدر في نهاية الجملة.',
      de: 'Modalverben ändern die Aussage des Satzes.'
    },
    examples: [
      { de: 'Ich kann Deutsch sprechen.', ar: 'أستطيع تحدث الألمانية.', note: 'können (2) ... sprechen (Ende)' },
      { de: 'Wir müssen jetzt gehen.', ar: 'يجب أن نذهب الآن.', note: 'müssen (2) ... gehen (Ende)' }
    ],
    tables: {
      headers: ['Modalverb', 'Bedeutung'],
      rows: [
        ['können', 'القدرة / الاستطاعة'],
        ['müssen', 'الإجبار / الضرورة القصوى'],
        ['wollen', 'الإرادة / الرغبة القوية'],
        ['dürfen', 'السماح / الإذن'],
        ['sollen', 'النصيحة / التكليف'],
        ['mögen', 'الإعجاب / الحب']
      ]
    },
    notes: ['تصريف المفرد (ich, er/sie/es) متطابق في الأفعال الناقصة.']
  }
];