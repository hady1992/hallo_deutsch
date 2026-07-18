export const grammarB1Full = [
  {
    id: 'b1-01',
    title: { de: 'Passiv mit Modalverben', ar: 'المبني للمجهول مع الأفعال الناقصة' },
    explanation: 'عند استخدام الباسيف مع المودال فيرب، يأتي الفعل الناقص في الموقع الثاني، ويأتي Partizip II + werden في نهاية الجملة.',
    examples: [
      { de: 'Das Auto muss repariert werden.', ar: 'يجب أن تُصلح السيارة.' },
      { de: 'Die Hausaufgaben sollen gemacht werden.', ar: 'الواجبات ينبغي أن تُعمل.' },
      { de: 'Hier darf nicht geraucht werden.', ar: 'لا يُسمح بالتدخين هنا.' },
      { de: 'Kann das Problem gelöst werden?', ar: 'هل يمكن حل المشكلة؟' },
      { de: 'Das Fenster musste geschlossen werden (Präteritum).', ar: 'كان يجب إغلاق النافذة.' }
    ],
    table: {
      headers: ['Modalverb', 'Partizip II', 'werden (Infinitiv)'],
      rows: [
        ['muss', 'gemacht', 'werden'],
        ['kann', 'gelöst', 'werden'],
        ['soll', 'geschrieben', 'werden']
      ]
    },
    notes: ['في الماضي، نصرف الفعل الناقص (z.B. musste ... werden).'],
    level: 'B1'
  },
  {
    id: 'b1-02',
    title: { de: 'Futur I (Zukunft)', ar: 'المستقبل البسيط' },
    explanation: 'يستخدم للتعبير عن أحداث مستقبلية أو وعود أو تخمينات. يتكون من werden + Infinitiv.',
    examples: [
      { de: 'Ich werde morgen nach Berlin fahren.', ar: 'سأسافر غداً إلى برلين.' },
      { de: 'Es wird bald regnen.', ar: 'ستمطر قريباً.' },
      { de: 'Wirst du mir helfen?', ar: 'هل ستساعدني؟' },
      { de: 'Wir werden sehen.', ar: 'سنرى.' },
      { de: 'Das wirst du nicht schaffen.', ar: 'لن تنجح في ذلك.' }
    ],
    table: {
      headers: ['الضمير', 'werden', 'Infinitiv (نهاية الجملة)'],
      rows: [
        ['ich', 'werde', 'gehen'],
        ['du', 'wirst', 'gehen'],
        ['er/sie/es', 'wird', 'gehen'],
        ['wir', 'werden', 'gehen'],
        ['ihr', 'werdet', 'gehen'],
        ['sie/Sie', 'werden', 'gehen']
      ]
    },
    notes: ['غالباً ما نستخدم المضارع مع ظرف زمان (z.B. morgen) بدلاً من المستقبل، لكن Futur I يؤكد النية أو التنبؤ.'],
    level: 'B1'
  },
  {
    id: 'b1-03',
    title: { de: 'Relativsätze mit Präpositionen', ar: 'الجمل الموصولة مع حروف الجر' },
    explanation: 'إذا كان الفعل في الجملة الموصولة يتطلب حرف جر، يوضع حرف الجر قبل الضمير الموصول.',
    examples: [
      { de: 'Das ist der Tisch, an dem ich sitze.', ar: 'هذه هي الطاولة التي أجلس عليها.' },
      { de: 'Die Frau, mit der ich spreche, ist nett.', ar: 'المرأة التي أتحدث معها لطيفة.' },
      { de: 'Das Buch, für das ich mich interessiere.', ar: 'الكتاب الذي أهتم به.' },
      { de: 'Der Freund, auf den ich warte.', ar: 'الصديق الذي أنتظره.' },
      { de: 'Das Land, aus dem ich komme.', ar: 'البلد الذي جئت منه.' }
    ],
    table: {
      headers: ['حرف الجر', 'الحالة', 'الضمير الموصول'],
      rows: [
        ['mit', 'Dativ', 'mit dem / mit der / mit denen'],
        ['für', 'Akkusativ', 'für den / für die / für das'],
        ['an', 'Dat/Akk', 'an dem / an den']
      ]
    },
    notes: ['حالة الضمير الموصول (Dativ/Akkusativ) تعتمد كلياً على حرف الجر.'],
    level: 'B1'
  },
  {
    id: 'b1-04',
    title: { de: 'Infinitiv mit zu', ar: 'المصدر مع zu' },
    explanation: 'يستخدم لربط فعلين عندما يكون الفاعل واحداً، أو بعد صفات واسماء معينة. الفعل الثاني يأتي في النهاية مسبوقاً بـ zu.',
    examples: [
      { de: 'Ich habe vor, ein Auto zu kaufen.', ar: 'أنوي شراء سيارة.' },
      { de: 'Es ist gesund, Sport zu treiben.', ar: 'من الصحي ممارسة الرياضة.' },
      { de: 'Er hat keine Zeit, fernzusehen.', ar: 'ليس لديه وقت لمشاهدة التلفاز.' },
      { de: 'Ich bitte dich, leise zu sein.', ar: 'أرجوك أن تكون هادئاً.' },
      { de: 'Es ist verboten, hier zu rauchen.', ar: 'ممنوع التدخين هنا.' }
    ],
    table: {
      headers: ['نوع الفعل', 'الموضع', 'مثال'],
      rows: [
        ['فعل بسيط', 'قبل الفعل', 'zu gehen'],
        ['فعل منفصل', 'بين البادئة والفعل', 'anzurufen'],
        ['فعلين', 'بين الفعلين', 'kennen zu lernen']
      ]
    },
    notes: ['لا نستخدم zu مع: الأفعال الناقصة (müssen, können..)، أفعال الحواس (sehen, hören)، و lassen, gehen, bleiben.'],
    level: 'B1'
  },
  {
    id: 'b1-05',
    title: { de: 'Genitiv (Der 2. Fall)', ar: 'المضاف إليه (Genitiv)' },
    explanation: 'حالة الجر (الإضافة) تعبر عن الملكية أو الانتماء. يتميز بإضافة -s لاسم المذكر والمحايد، وتغيير الأدوات.',
    examples: [
      { de: 'Das ist das Auto meines Vaters.', ar: 'هذه سيارة أبي.' },
      { de: 'Die Farbe der Blume ist rot.', ar: 'لون الزهرة أحمر.' },
      { de: 'Trotz des Regens gehen wir spazieren.', ar: 'رغم المطر سنتمشى (trotz + Gen).' },
      { de: 'Wegen der Arbeit habe ich keine Zeit.', ar: 'بسبب العمل ليس لدي وقت (wegen + Gen).' },
      { de: 'Das Ende des Films war traurig.', ar: 'نهاية الفيلم كانت حزينة.' }
    ],
    table: {
      headers: ['Genders', 'Artikel (Genitiv)', 'Endung Nomen'],
      rows: [
        ['Maskulin', 'des / eines', '+ s / es'],
        ['Neutrum', 'des / eines', '+ s / es'],
        ['Feminin', 'der / einer', '-'],
        ['Plural', 'der / -', '-']
      ]
    },
    notes: ['في اللغة المحكية، غالباً ما يُستبدل الجينيتيف بـ "von + Dativ" (z.B. Das Auto von meinem Vater).'],
    level: 'B1'
  },
  {
    id: 'b1-06',
    title: { de: 'Verben mit Präpositionen', ar: 'الأفعال مع حروف الجر الثابتة' },
    explanation: 'العديد من الأفعال الألمانية ترتبط بحرف جر محدد وحالة إعرابية محددة. يجب حفظها ككتلة واحدة.',
    examples: [
      { de: 'Ich warte auf den Bus (Akk).', ar: 'أنتظر الحافلة.' },
      { de: 'Er träumt von einem Haus (Dat).', ar: 'يحلم بمنزل.' },
      { de: 'Wir denken an den Urlaub (Akk).', ar: 'نفكر في العطلة.' },
      { de: 'Sie interessiert sich für Musik (Akk).', ar: 'تهتم بالموسيقى.' },
      { de: 'Ich spreche mit meinem Chef (Dat).', ar: 'أتحدث مع مديري.' }
    ],
    table: {
      headers: ['Verb', 'Präposition', 'Kasus'],
      rows: [
        ['warten', 'auf', 'Akkusativ'],
        ['denken', 'an', 'Akkusativ'],
        ['träumen', 'von', 'Dativ'],
        ['sprechen', 'mit', 'Dativ']
      ]
    },
    notes: ['استخدم "wo(r)+" للسؤال عن الأشياء (Worauf wartest du?) و حرف الجر + wen/wem للأشخاص (Auf wen wartest du?).'],
    level: 'B1'
  },
  {
    id: 'b1-07',
    title: { de: 'Plusquamperfekt', ar: 'الماضي الأسبق (تام التام)' },
    explanation: 'يستخدم للتعبير عن حدث وقع قبل حدث آخر في الماضي. يتكون من (war/hatte) + Partizip II.',
    examples: [
      { de: 'Nachdem er gegessen hatte, ging er ins Bett.', ar: 'بعد أن أكل (أولاً)، ذهب للفراش.' },
      { de: 'Ich war schon gegangen, als er kam.', ar: 'كنت قد رحلت بالفعل عندما وصل.' },
      { de: 'Sie hatte den Film schon gesehen.', ar: 'كانت قد رأت الفيلم مسبقاً.' },
      { de: 'Wir waren sehr müde gewesen.', ar: 'كنا متعبين جداً (في وقت سابق للماضي).' },
      { de: 'Hattest du das gewusst?', ar: 'هل كنت تعلم ذلك (قبل حدوث شيء)؟' }
    ],
    table: {
      headers: ['Präteritum Hilfsverb', 'Partizip II', 'الاستخدام'],
      rows: [
        ['war', 'gegangen', 'حدث أسبق مع أفعال الحركة'],
        ['hatte', 'gemacht', 'حدث أسبق مع باقي الأفعال']
      ]
    },
    notes: ['يستخدم غالباً مع الرابط "nachdem" (بعدما).'],
    level: 'B1'
  },
  {
    id: 'b1-08',
    title: { de: 'n-Deklination', ar: 'الأسماء الضعيفة (n-Deklination)' },
    explanation: 'بعض الأسماء المذكرة تأخذ النهاية "-n" أو "-en" في جميع الحالات الإعرابية ما عدا Nominativ المفرد.',
    examples: [
      { de: 'Ich kenne den Studenten.', ar: 'أعرف الطالب (Akk).' },
      { de: 'Ich helfe dem Studenten.', ar: 'أساعد الطالب (Dat).' },
      { de: 'Das ist das Buch des Studenten.', ar: 'هذا كتاب الطالب (Gen).' },
      { de: 'Der Name des Jungen ist Ali.', ar: 'اسم الصبي علي.' },
      { de: 'Wir sprechen mit dem Kunden.', ar: 'نتحدث مع الزبون.' }
    ],
    table: {
      headers: ['Kasus', 'Singular', 'Plural'],
      rows: [
        ['Nom', 'der Student', 'die Studenten'],
        ['Akk', 'den Studenten', 'die Studenten'],
        ['Dat', 'dem Studenten', 'den Studenten'],
        ['Gen', 'des Studenten', 'der Studenten']
      ]
    },
    notes: ['تنطبق غالباً على المذكر المنتهي بـ e (Junge, Kollege) وكلمات أجنبية (Student, Polizist, Elefant) وكلمة (Herr -> Herrn).'],
    level: 'B1'
  },
  {
    id: 'b1-09',
    title: { de: 'Partizip I und II als Adjektive', ar: 'اسم الفاعل واسم المفعول كصفات' },
    explanation: 'يمكن استخدام التصريفات الفعلية كصفات تسبق الاسم. Partizip I (Infinitiv+d) يعبر عن فاعل مستمر، Partizip II يعبر عن مفعول مكتمل.',
    examples: [
      { de: 'Das schlafende Kind.', ar: 'الطفل النائم (الذي ينام الآن).' },
      { de: 'Der reparierte Motor.', ar: 'المحرك المُصلح (الذي تم إصلاحه).' },
      { de: 'Die aufgehende Sonne.', ar: 'الشمس المشرقة.' },
      { de: 'Das gestohlene Fahrrad.', ar: 'الدراجة المسروقة.' },
      { de: 'Ein faszinierendes Buch.', ar: 'كتاب ممتع/ساحر.' }
    ],
    table: {
      headers: ['Form', 'Bedeutung', 'Beispiel'],
      rows: [
        ['Partizip I', 'Aktiv / Gleichzeitig', 'kochendes Wasser (ماء يغلي)'],
        ['Partizip II', 'Passiv / Vorzeitig', 'gekochtes Ei (بيض مسلوق)']
      ]
    },
    notes: ['تأخذ هذه التصريفات نهايات الصفات العادية حسب الموقع الإعرابي.'],
    level: 'B1'
  },
  {
    id: 'b1-10',
    title: { de: 'Konnektoren: Zweiteilige Konjunktionen', ar: 'الروابط المزدوجة' },
    explanation: 'روابط تتكون من جزأين وتؤكد العلاقة بين جملتين أو عنصرين.',
    examples: [
      { de: 'Sowohl ich als auch mein Bruder spielen Fußball.', ar: 'كلاي أنا وأخي نلعب كرة القدم.' },
      { de: 'Ich trinke weder Kaffee noch Tee.', ar: 'لا أشرب القهوة ولا الشاي.' },
      { de: 'Entweder wir gehen ins Kino oder wir bleiben hier.', ar: 'إما نذهب للسينما أو نبقى هنا.' },
      { de: 'Er ist nicht nur klug, sondern auch nett.', ar: 'هو ليس ذكياً فحسب، بل لطيف أيضاً.' },
      { de: 'Zwar ist es teuer, aber es ist gut.', ar: 'صحيح أنه غالٍ، لكنه جيد.' }
    ],
    table: {
      headers: ['الرابط', 'المعنى'],
      rows: [
        ['sowohl ... als auch', 'كلاً من ... و ...'],
        ['weder ... noch', 'لا ... ولا ...'],
        ['entweder ... oder', 'إما ... أو ...'],
        ['nicht nur ... sondern auch', 'ليس فقط ... بل أيضاً']
      ]
    },
    notes: ['انتبه لموقع الفعل وترتيب الجملة مع كل رابط.'],
    level: 'B1'
  }
];