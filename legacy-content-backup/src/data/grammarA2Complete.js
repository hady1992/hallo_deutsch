export const grammarA2Complete = [
  {
    id: 'a2-perfekt',
    title: 'الماضي التام (Das Perfekt)',
    level: 'A2',
    category: 'Tenses',
    explanation: {
      ar: 'زمن البرفكت هو زمن الماضي الأساسي في المحادثة الشفهية. يتكون من فعل مساعد (haben أو sein) في الموقع الثاني + التصريف الثالث (Partizip II) في نهاية الجملة.',
      de: 'Vergangenheit in der gesprochenen Sprache.'
    },
    examples: [
      { de: 'Ich habe einen Apfel gegessen.', ar: 'أكلت تفاحة.' },
      { de: 'Er ist nach Hause gegangen.', ar: 'ذهب إلى المنزل.' }
    ],
    notes: ['نستخدم sein مع أفعال الحركة وتغيير الحالة. نستخدم haben مع باقي الأفعال.']
  },
  {
    id: 'a2-reflexive',
    title: 'الأفعال الانعكاسية (Reflexive Verben)',
    level: 'A2',
    category: 'Verbs',
    explanation: {
      ar: 'الأفعال الانعكاسية هي التي يكون فيها الفاعل والمفعول به هما نفس الشخص. تتطلب ضمير انعكاسي (mich, dich, sich, uns, euch, sich).',
      de: 'Verben mit Reflexivpronomen.'
    },
    examples: [
      { de: 'Ich wasche mich.', ar: 'أنا أغتسل (أغسل نفسي).' },
      { de: 'Er freut sich.', ar: 'هو يفرح (يسعد نفسه).' }
    ],
    tables: {
      headers: ['Person', 'Akkusativ', 'Dativ'],
      rows: [
        ['ich', 'mich', 'mir'],
        ['du', 'dich', 'dir'],
        ['er/sie/es', 'sich', 'sich'],
        ['wir', 'uns', 'uns'],
        ['ihr', 'euch', 'euch'],
        ['sie/Sie', 'sich', 'sich']
      ]
    }
  }
];