export const grammarA2Full = [
  {
    id: 'a2-01',
    title: { de: 'Das Perfekt (Vergangenheit)', ar: 'الماضي التام (Perfekt)' },
    explanation: 'زمن البرفكت هو الزمن الرئيسي للتحدث عن الماضي في اللغة المحكية (الشفهية). يتكون من فعل مساعد (haben أو sein) في الموقع الثاني، والتصريف الثالث (Partizip II) في نهاية الجملة.',
    examples: [
      { de: 'Ich habe einen Apfel gegessen.', ar: 'أكلت تفاحة.' },
      { de: 'Er ist nach Hause gegangen.', ar: 'ذهب إلى المنزل.' },
      { de: 'Wir haben Fußball gespielt.', ar: 'لعبنا كرة القدم.' },
      { de: 'Bist du gestern gekommen?', ar: 'هل أتيت البارحة؟' },
      { de: 'Sie hat das Buch gelesen.', ar: 'قرأت الكتاب.' }
    ],
    table: {
      headers: ['الفاعل', 'الفعل المساعد', 'المفعول/الباقي', 'Partizip II'],
      rows: [
        ['Ich', 'habe', 'einen Tee', 'getrunken'],
        ['Du', 'bist', 'schnell', 'gerannt'],
        ['Wir', 'haben', 'viel', 'gelacht']
      ]
    },
    notes: ['نستخدم "sein" مع أفعال الحركة (gehen, fahren) وتغيير الحالة (aufwachen, sterben)، و"haben" مع معظم الأفعال الأخرى.'],
    level: 'A2'
  },
  {
    id: 'a2-02',
    title: { de: 'Präteritum: Sein und Haben', ar: 'الماضي البسيط: sein و haben' },
    explanation: 'في اللغة الألمانية، غالباً ما نستخدم الماضي البسيط (Präteritum) لفعل الكينونة (sein) وفعل الملكية (haben) بدلاً من البرفكت، حتى في المحادثة اليومية.',
    examples: [
      { de: 'Ich war müde.', ar: 'كنت متعباً.' },
      { de: 'Wir waren im Kino.', ar: 'كنا في السينما.' },
      { de: 'Er hatte keine Zeit.', ar: 'لم يكن لديه وقت.' },
      { de: 'Hattest du Spaß?', ar: 'هل استمتعت؟' },
      { de: 'Sie war glücklich.', ar: 'كانت سعيدة.' }
    ],
    table: {
      headers: ['الضمير', 'Sein (كان)', 'Haben (ملك)'],
      rows: [
        ['ich', 'war', 'hatte'],
        ['du', 'warst', 'hattest'],
        ['er/sie/es', 'war', 'hatte'],
        ['wir', 'waren', 'hatten'],
        ['ihr', 'wart', 'hattet'],
        ['sie/Sie', 'waren', 'hatten']
      ]
    },
    notes: ['لاحظ أن تصريف ich و er/sie/es متطابق في الماضي البسيط.'],
    level: 'A2'
  },
  {
    id: 'a2-03',
    title: { de: 'Präteritum: Regelmäßige Verben', ar: 'الماضي البسيط: الأفعال المنتظمة' },
    explanation: 'يتكون الماضي البسيط للأفعال المنتظمة بإضافة "-te-" بين جذر الفعل والنهاية الشخصية. يستخدم بشكل أساسي في الكتابة والسرد.',
    examples: [
      { de: 'Ich lernte Deutsch.', ar: 'تعلمت الألمانية.' },
      { de: 'Wir spielten Fußball.', ar: 'لعبنا كرة القدم.' },
      { de: 'Er kaufte ein Auto.', ar: 'اشترى سيارة.' },
      { de: 'Sie arbeitete gestern.', ar: 'عملت البارحة.' },
      { de: 'Es regnete stark.', ar: 'أمطرت بغزارة.' }
    ],
    table: {
      headers: ['الضمير', 'النهاية', 'مثال (machen)'],
      rows: [
        ['ich', '-te', 'machte'],
        ['du', '-test', 'machtest'],
        ['er/sie/es', '-te', 'machte'],
        ['wir', '-ten', 'machten'],
        ['ihr', '-tet', 'machtet'],
        ['sie/Sie', '-ten', 'machten']
      ]
    },
    notes: ['إذا انتهى جذر الفعل بـ t أو d، نضيف -ete لتسهيل النطق (z.B. arbeitete).'],
    level: 'A2'
  },
  {
    id: 'a2-04',
    title: { de: 'Adjektivdeklination (Bestimmter Artikel)', ar: 'إعراب الصفات (مع أداة التعريف)' },
    explanation: 'عندما تأتي الصفة بين أداة التعريف (der, die, das) والاسم، تتغير نهايتها. القاعدة الأساسية: إذا كانت الأداة واضحة ومعرفة، نضيف "-e" (للمفرد الفاعل) أو "-en" (للجمع والحالات الأخرى).',
    examples: [
      { de: 'Der nette Mann hilft mir.', ar: 'الرجل اللطيف يساعدني.' },
      { de: 'Ich sehe den netten Mann.', ar: 'أرى الرجل اللطيف.' },
      { de: 'Die schöne Frau singt.', ar: 'المرأة الجميلة تغني.' },
      { de: 'Das kleine Kind spielt.', ar: 'الطفل الصغير يلعب.' },
      { de: 'Die alten Bücher sind hier.', ar: 'الكتب القديمة هنا.' }
    ],
    table: {
      headers: ['Kasus', 'Maskulin', 'Feminin', 'Neutrum', 'Plural'],
      rows: [
        ['Nom', '-e (der gute)', '-e (die gute)', '-e (das gute)', '-en (die guten)'],
        ['Akk', '-en (den guten)', '-e (die gute)', '-e (das gute)', '-en (die guten)'],
        ['Dat', '-en (dem guten)', '-en (der guten)', '-en (dem guten)', '-en (den guten)']
      ]
    },
    notes: ['في الجمع، النهاية دائماً "-en" مع أدوات التعريف.'],
    level: 'A2'
  },
  {
    id: 'a2-05',
    title: { de: 'Verben mit Dativ', ar: 'أفعال تتطلب حالة Dativ' },
    explanation: 'بعض الأفعال في الألمانية تأخذ مفعولاً به في حالة Dativ دائماً وليس Akkusativ. يجب حفظ هذه الأفعال.',
    examples: [
      { de: 'Ich helfe dir.', ar: 'أنا أساعدك.' },
      { de: 'Das Auto gehört mir.', ar: 'السيارة تخصني.' },
      { de: 'Der Film gefällt uns.', ar: 'الفيلم يعجبنا.' },
      { de: 'Das schmeckt dem Kind.', ar: 'هذا يعجب الطفل (طعماً).' },
      { de: 'Ich danke Ihnen.', ar: 'أشكر حضرتك.' }
    ],
    table: {
      headers: ['الفعل', 'المعنى', 'مثال'],
      rows: [
        ['helfen', 'يساعد', 'Er hilft der Frau.'],
        ['danken', 'يشكر', 'Wir danken dem Lehrer.'],
        ['gefallen', 'يعجب', 'Das gefällt mir.'],
        ['gehören', 'يخص/يملك', 'Das gehört ihm.'],
        ['schmecken', 'يعجب (طعام)', 'Pizza schmeckt mir.']
      ]
    },
    notes: ['تتغير الضمائر في الداتيف: ich->mir, du->dir, er->ihm, sie->ihr, wir->uns, ihr->euch, sie->ihnen.'],
    level: 'A2'
  },
  {
    id: 'a2-06',
    title: { de: 'Wechselpräpositionen', ar: 'حروف الجر المكانية (المشتركة)' },
    explanation: 'حروف جر تأخذ Akkusativ إذا كان هناك حركة وتغيير مكان (wohin?)، وتأخذ Dativ إذا كان هناك سكون وثبات (wo?).',
    examples: [
      { de: 'Ich lege das Buch auf den Tisch.', ar: 'أضع الكتاب على الطاولة (حركة -> Akk).' },
      { de: 'Das Buch liegt auf dem Tisch.', ar: 'الكتاب على الطاولة (سكون -> Dat).' },
      { de: 'Wir gehen in den Park.', ar: 'نذهب إلى الحديقة.' },
      { de: 'Wir sind im Park.', ar: 'نحن في الحديقة.' },
      { de: 'Häng das Bild an die Wand!', ar: 'علق الصورة على الحائط!' }
    ],
    table: {
      headers: ['حرف الجر', 'معنى', 'مثال حركة/سكون'],
      rows: [
        ['in', 'في/إلى داخل', 'in den Kino / im Kino'],
        ['auf', 'على (من فوق)', 'auf den Berg / auf dem Berg'],
        ['an', 'على (بجانب/ملامس)', 'an die Wand / an der Wand'],
        ['unter', 'تحت', 'unter den Tisch / unter dem Tisch']
      ]
    },
    notes: ['الحروف التسعة هي: in, an, auf, neben, zwischen, vor, hinter, über, unter.'],
    level: 'A2'
  },
  {
    id: 'a2-07',
    title: { de: 'Reflexive Verben', ar: 'الأفعال الانعكاسية' },
    explanation: 'الأفعال الانعكاسية تتطلب ضميراً انعكاسياً يعود على الفاعل. معظمها يأخذ ضمير Akkusativ.',
    examples: [
      { de: 'Ich wasche mich.', ar: 'أنا أغتسل.' },
      { de: 'Er freut sich.', ar: 'هو يفرح.' },
      { de: 'Wir treffen uns.', ar: 'نحن نلتقي.' },
      { de: 'Interessierst du dich für Musik?', ar: 'هل تهتم بالموسيقى؟' },
      { de: 'Sie ärgert sich über den Bus.', ar: 'هي تنزعج من الحافلة.' }
    ],
    table: {
      headers: ['الضمير', 'Reflexivpronomen (Akk)'],
      rows: [
        ['ich', 'mich'],
        ['du', 'dich'],
        ['er/sie/es', 'sich'],
        ['wir', 'uns'],
        ['ihr', 'euch'],
        ['sie/Sie', 'sich']
      ]
    },
    notes: ['انتبه: مع بعض الأفعال، الضمير الانعكاسي قد يكون Dativ (z.B. Ich putze mir die Zähne - أغسل أسناني).'],
    level: 'A2'
  },
  {
    id: 'a2-08',
    title: { de: 'Komparation: Komparativ', ar: 'مقارنة الصفات: صيغة التفضيل (أفعل من)' },
    explanation: 'للمقارنة بين شيئين، نضيف "-er" للصفة، وغالباً ما نستخدم كلمة "als" (من).',
    examples: [
      { de: 'Mein Auto ist schneller als dein Auto.', ar: 'سيارتي أسرع من سيارتك.' },
      { de: 'Er ist größer als ich.', ar: 'هو أطول مني.' },
      { de: 'Deutschland ist kälter als Spanien.', ar: 'ألمانيا أبرد من إسبانيا.' },
      { de: 'Der Kaffee ist besser als der Tee.', ar: 'القهوة أفضل من الشاي.' },
      { de: 'Lisa läuft schneller als Anna.', ar: 'ليزا تجري أسرع من آنا.' }
    ],
    table: {
      headers: ['الصفة', 'Komparativ', 'مثال'],
      rows: [
        ['schnell', 'schneller', 'schneller als'],
        ['klein', 'kleiner', 'kleiner als'],
        ['gut', 'besser (شاذ)', 'besser als'],
        ['viel', 'mehr (شاذ)', 'mehr als'],
        ['hoch', 'höher (شاذ)', 'höher als']
      ]
    },
    notes: ['الصفات القصيرة بحرف علة واحد غالباً تأخذ Umlaut (alt -> älter, groß -> größer).'],
    level: 'A2'
  },
  {
    id: 'a2-09',
    title: { de: 'Komparation: Superlativ', ar: 'مقارنة الصفات: صيغة المبالغة (الأفعل)' },
    explanation: 'للتعبير عن الأفضلية المطلقة، نستخدم "am" + الصفة + "-sten" أو أداة التعريف + الصفة + "-ste".',
    examples: [
      { de: 'Dieser Berg ist am höchsten.', ar: 'هذا الجبل هو الأعلى.' },
      { de: 'Der Ferrari ist das schnellste Auto.', ar: 'فيراري هي أسرع سيارة.' },
      { de: 'Wer ist der beste Spieler?', ar: 'من هو أفضل لاعب؟' },
      { de: 'Im Winter ist es am kältesten.', ar: 'في الشتاء يكون الجو الأكثر برودة.' },
      { de: 'Sie ist die schönste Frau.', ar: 'هي أجمل امرأة.' }
    ],
    table: {
      headers: ['الصفة', 'Superlativ (am ...)', 'Superlativ (der/die/das ...)'],
      rows: [
        ['schnell', 'am schnellsten', 'der schnellste'],
        ['gut', 'am besten', 'der beste'],
        ['viel', 'am meisten', 'der meiste'],
        ['groß', 'am größten', 'der größte']
      ]
    },
    notes: ['إذا انتهت الصفة بـ t, d, s, z، نضيف "-esten" لتسهيل النطق (z.B. am kürzesten).'],
    level: 'A2'
  },
  {
    id: 'a2-10',
    title: { de: 'Nebensätze mit "dass"', ar: 'الجمل الجانبية بـ "dass" (أن)' },
    explanation: 'الرابط "dass" يربط جملة رئيسية بجملة جانبية. في الجملة الجانبية، ينتقل الفعل المصرف إلى نهاية الجملة تماماً.',
    examples: [
      { de: 'Ich weiß, dass du kommst.', ar: 'أعرف أنك قادم.' },
      { de: 'Er sagt, dass er krank ist.', ar: 'يقول إنه مريض.' },
      { de: 'Es ist wichtig, dass wir lernen.', ar: 'من المهم أن نتعلم.' },
      { de: 'Ich hoffe, dass es nicht regnet.', ar: 'آمل ألا تمطر.' },
      { de: 'Sie glaubt, dass sie Recht hat.', ar: 'هي تعتقد أنها على حق.' }
    ],
    table: {
      headers: ['الجملة الرئيسية', 'الرابط', 'الجملة الجانبية (الفعل في النهاية)'],
      rows: [
        ['Ich hoffe,', 'dass', 'du bald kommst.'],
        ['Er denkt,', 'dass', 'Deutsch einfach ist.'],
        ['Stimmt es,', 'dass', 'er in Berlin wohnt?']
      ]
    },
    notes: ['لا تنسَ الفاصلة (Komma) قبل "dass".'],
    level: 'A2'
  },
  {
    id: 'a2-11',
    title: { de: 'Nebensätze mit "weil"', ar: 'الجمل السببية بـ "weil" (لأن)' },
    explanation: 'تستخدم "weil" لذكر السبب. مثل "dass"، الفعل المصرف يأتي في نهاية الجملة.',
    examples: [
      { de: 'Ich lerne Deutsch, weil ich in Deutschland arbeiten will.', ar: 'أتعلم الألمانية لأني أريد العمل في ألمانيا.' },
      { de: 'Er kommt nicht, weil er krank ist.', ar: 'هو لن يأتي لأنه مريض.' },
      { de: 'Wir essen Pizza, weil wir Hunger haben.', ar: 'نأكل البيتزا لأننا جائعون.' },
      { de: 'Sie ist müde, weil sie wenig geschlafen hat.', ar: 'هي متعبة لأنها نامت قليلاً.' },
      { de: 'Ich bin glücklich, weil du hier bist.', ar: 'أنا سعيد لأنك هنا.' }
    ],
    table: {
      headers: ['النتيجة', 'الرابط', 'السبب (الفعل في النهاية)'],
      rows: [
        ['Ich gehe ins Bett,', 'weil', 'ich müde bin.'],
        ['Er kauft das Auto,', 'weil', 'es billig ist.'],
        ['Wir bleiben zu Hause,', 'weil', 'es regnet.']
      ]
    },
    notes: ['في المحادثة السريعة، قد تسمع الألمان يستخدمون "denn" (موقع صفر) بدلاً من "weil" للحفاظ على ترتيب الجملة العادي.'],
    level: 'A2'
  },
  {
    id: 'a2-12',
    title: { de: 'Konjunktiv II (Höflichkeit)', ar: 'الطلب المهذب (Konjunktiv II)' },
    explanation: 'نستخدم Konjunktiv II (صيغة التمني) للتعبير عن الطلبات بشكل مهذب جداً، خاصة مع فعلي "können" و "werden".',
    examples: [
      { de: 'Könnten Sie mir helfen?', ar: 'هل يمكن لحضرتك مساعدتي؟' },
      { de: 'Ich hätte gern einen Kaffee.', ar: 'أرغب (بودي) بقهوة.' },
      { de: 'Würden Sie bitte das Fenster schließen?', ar: 'هلا أغلقت النافذة من فضلك؟' },
      { de: 'Dürfte ich etwas fragen?', ar: 'هل يُسمح لي بسؤال؟' },
      { de: 'Das wäre toll.', ar: 'ذلك سيكون رائعاً.' }
    ],
    table: {
      headers: ['الفعل العادي', 'صيغة KII المهذبة'],
      rows: [
        ['können', 'könnten (الاستطاعة المهذبة)'],
        ['haben', 'hätten (الرغبة المهذبة)'],
        ['werden', 'würden (+ مصدر للفعل الآخر)'],
        ['sein', 'wären (التمني/الافتراض)']
      ]
    },
    notes: ['العبارة "Ich will" (أريد) تعتبر غير مهذبة عند الطلب، استبدلها بـ "Ich hätte gern" أو "Ich möchte".'],
    level: 'A2'
  },
  {
    id: 'a2-13',
    title: { de: 'Adjektivdeklination (Unbestimmter Artikel)', ar: 'إعراب الصفات (مع أداة النكرة)' },
    explanation: 'عندما تأتي الصفة بعد أداة نكرة (ein, eine) أو أداة نفي (kein) أو ملكية (mein)، تأخذ الصفة النهاية المميزة للجنس في حالة Nominativ (مذكر -er, محايد -es, مؤنث -e).',
    examples: [
      { de: 'Das ist ein schöner Mann.', ar: 'هذا رجل وسيم (مذكر Nom -> er).' },
      { de: 'Ich habe ein neues Auto.', ar: 'لدي سيارة جديدة (محايد Akk -> es).' },
      { de: 'Sie ist eine gute Freundin.', ar: 'هي صديقة جيدة.' },
      { de: 'Er trägt einen schwarzen Mantel.', ar: 'هو يرتدي معطفاً أسود (مذكر Akk -> en).' },
      { de: 'Das sind keine guten Nachrichten.', ar: 'هذه ليست أخباراً جيدة (جمع -> en).' }
    ],
    table: {
      headers: ['Kasus', 'Maskulin', 'Feminin', 'Neutrum', 'Plural'],
      rows: [
        ['Nom', '-er (ein guter)', '-e (eine gute)', '-es (ein gutes)', '-en (keine guten)'],
        ['Akk', '-en (einen guten)', '-e (eine gute)', '-es (ein gutes)', '-en (keine guten)'],
        ['Dat', '-en (einem guten)', '-en (einer guten)', '-en (einem guten)', '-en (keinen guten)']
      ]
    },
    notes: ['لاحظ: ein للمذكر في Nominativ تتطلب -er في الصفة لتوضيح الجنس، لأن ein وحدها لا توضح ذلك.'],
    level: 'A2'
  },
  {
    id: 'a2-14',
    title: { de: 'Relativsätze (Nominativ/Akkusativ)', ar: 'الجمل الموصولة (الذي/التي)' },
    explanation: 'الجملة الموصولة هي جملة جانبية تصف اسماً سابقاً. الضمير الموصول يعتمد على جنس الاسم وحالته الإعرابية.',
    examples: [
      { de: 'Das ist der Mann, der hier wohnt.', ar: 'هذا هو الرجل الذي يسكن هنا (Nom).' },
      { de: 'Das ist der Mann, den ich suche.', ar: 'هذا هو الرجل الذي أبحث عنه (Akk).' },
      { de: 'Die Frau, die dort steht, ist meine Mutter.', ar: 'المرأة التي تقف هناك هي أمي.' },
      { de: 'Das Auto, das ich kaufe, ist rot.', ar: 'السيارة التي أشتريها حمراء.' },
      { de: 'Die Kinder, die spielen, sind laut.', ar: 'الأطفال الذين يلعبون صاخبون.' }
    ],
    table: {
      headers: ['Kasus', 'Maskulin', 'Feminin', 'Neutrum', 'Plural'],
      rows: [
        ['Nom', 'der', 'die', 'das', 'die'],
        ['Akk', 'den', 'die', 'das', 'die']
      ]
    },
    notes: ['ضمير الوصل يشبه أداة التعريف، والفعل يأتي في نهاية الجملة الموصولة.'],
    level: 'A2'
  },
  {
    id: 'a2-15',
    title: { de: 'Indirekte Fragen', ar: 'الأسئلة غير المباشرة' },
    explanation: 'تستخدم لطرح الأسئلة بطريقة أكثر تهذيباً. تبدأ بعبارة مقدمة، وينتقل الفعل إلى نهاية الجملة. إذا لم يكن هناك أداة استفهام، نستخدم "ob" (إذا/لو).',
    examples: [
      { de: 'Ich möchte wissen, wie spät es ist.', ar: 'أود أن أعرف كم الساعة.' },
      { de: 'Können Sie mir sagen, wo der Bahnhof ist?', ar: 'هل يمكنك إخباري أين المحطة؟' },
      { de: 'Ich weiß nicht, ob er kommt.', ar: 'لا أعرف ما إذا كان سيأتي.' },
      { de: 'Frag ihn, wann er Zeit hat.', ar: 'اسأله متى يكون لديه وقت.' },
      { de: 'Darf ich fragen, ob Sie verheiratet sind?', ar: 'هل لي أن أسأل إذا كنت متزوجاً؟' }
    ],
    table: {
      headers: ['نوع السؤال', 'الرابط', 'مثال'],
      rows: [
        ['W-Frage', 'نفس الأداة (wo, wie...)', 'Weißt du, wo er ist?'],
        ['Ja/Nein Frage', 'ob', 'Ich frage mich, ob es regnet.']
      ]
    },
    notes: ['لا تنسَ تغيير ترتيب الجملة: الفاعل يأتي بعد الرابط مباشرة، والفعل في النهاية.'],
    level: 'A2'
  }
];