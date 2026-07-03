export const grammarB2Full = [
  {
    id: 'b2-01',
    title: { de: 'Konjunktiv I (Indirekte Rede)', ar: 'الكلام المنقول (Konjunktiv I)' },
    explanation: 'يستخدم Konjunktiv I بشكل رئيسي في الأخبار والتقارير لنقل كلام شخص آخر بحيادية، دون تأكيد صحته أو خطأه.',
    examples: [
      { de: 'Er sagt, er sei krank.', ar: 'يقول إنه مريض.' },
      { de: 'Der Minister erklärte, die Steuern würden sinken.', ar: 'أوضح الوزير أن الضرائب ستنخفض.' },
      { de: 'Sie behauptet, sie habe nichts gewusst.', ar: 'تزعم أنها لم تكن تعلم شيئاً.' },
      { de: 'Man sagt, er sei sehr reich.', ar: 'يُقال إنه غني جداً.' },
      { de: 'Der Arzt meint, du solltet mehr Sport machen.', ar: 'يرى الطبيب أنه يجب عليكم ممارسة رياضة أكثر.' }
    ],
    table: {
      headers: ['Person', 'sein', 'haben', 'Regelmäßig'],
      rows: [
        ['ich', 'sei', 'habe', '-e'],
        ['du', 'seiest', 'habest', '-est'],
        ['er/sie/es', 'sei', 'habe', '-e'],
        ['wir', 'seien', 'haben', '-en'],
        ['ihr', 'seiet', 'habet', '-et'],
        ['sie/Sie', 'seien', 'haben', '-en']
      ]
    },
    notes: ['إذا كان Konjunktiv I مطابقاً للمضارع (Indikativ)، نستخدم Konjunktiv II لتوضيح أنه كلام منقول.'],
    level: 'B2'
  },
  {
    id: 'b2-02',
    title: { de: 'Passiversatzformen', ar: 'بدائل المبني للمجهول' },
    explanation: 'تراكيب لغوية تعطي معنى المبني للمجهول دون استخدام صيغة الباسيف التقليدية، وتستخدم غالباً للتعبير عن الإمكانية أو الضرورة.',
    examples: [
      { de: 'Die Aufgabe ist zu lösen.', ar: 'المهمة يجب/يمكن حلها (sein + zu + Infinitiv).' },
      { de: 'Das Wasser ist trinkbar.', ar: 'الماء قابل للشرب (-bar).' },
      { de: 'Das Problem lässt sich lösen.', ar: 'المشكلة تدع نفسها تُحل (sich lassen + Infinitiv).' },
      { de: 'Die schwer verständliche Theorie.', ar: 'النظرية صعبة الفهم (صفة).' },
      { de: 'Das Buch ist lesenswert.', ar: 'الكتاب يستحق القراءة.' }
    ],
    table: {
      headers: ['البديل', 'المعنى المساوي للباسيف'],
      rows: [
        ['sein + zu + Inf', 'können/müssen + Passiv'],
        ['sich lassen + Inf', 'können + Passiv'],
        ['-bar / -lich Endung', 'können + Passiv']
      ]
    },
    notes: ['هذه الصيغ شائعة في اللغة الأكاديمية والعلمية لتبسيط الجمل وتجنب تكرار "werden".'],
    level: 'B2'
  },
  {
    id: 'b2-03',
    title: { de: 'Nominalisierung (Verbalstil)', ar: 'تحويل الجمل الفعلية إلى اسمية' },
    explanation: 'في اللغة الرسمية والأكاديمية، غالباً ما نحول الجمل الجانبية (Nebensätze) إلى تراكيب اسمية (Prepositional Phrases) لجعل النص أكثر كثافة.',
    examples: [
      { de: 'Weil es regnet, bleiben wir hier. -> Wegen des Regens bleiben wir hier.', ar: 'بسبب المطر (بدلاً من: لأنها تمطر).' },
      { de: 'Bevor wir essen, waschen wir Hände. -> Vor dem Essen waschen wir Hände.', ar: 'قبل الأكل (بدلاً من: قبل أن نأكل).' },
      { de: 'Wenn man viel lernt, besteht man. -> Durch vieles Lernen besteht man.', ar: 'عن طريق التعلم الكثير (بدلاً من: إذا تعلمت كثيراً).' },
      { de: 'Nachdem er angekommen war... -> Nach seiner Ankunft...', ar: 'بعد وصوله...' },
      { de: 'Obwohl er krank ist... -> Trotz seiner Krankheit...', ar: 'رغم مرضه...' }
    ],
    table: {
      headers: ['الرابط الفعلي', 'حرف الجر الاسمي', 'الحالة'],
      rows: [
        ['weil / da', 'wegen / aufgrund', 'Genitiv'],
        ['obwohl', 'trotz', 'Genitiv'],
        ['bevor', 'vor', 'Dativ'],
        ['nachdem', 'nach', 'Dativ'],
        ['wenn / als', 'bei', 'Dativ']
      ]
    },
    notes: ['هذه المهارة أساسية لاجتياز امتحانات B2 و C1 وكتابة الرسائل الرسمية.'],
    level: 'B2'
  },
  {
    id: 'b2-04',
    title: { de: 'Subjektive Bedeutung der Modalverben', ar: 'المعاني الذاتية للأفعال الناقصة' },
    explanation: 'تستخدم الأفعال الناقصة أيضاً للتعبير عن التخمين، الشك، أو نقل الكلام، وليس فقط للمعنى الأصلي (القدرة، الإجبار...).',
    examples: [
      { de: 'Er muss zu Hause sein.', ar: 'لابد أنه في المنزل (تخمين شبه مؤكد 90%).' },
      { de: 'Sie dürfte gleich kommen.', ar: 'من المحتمل أن تأتي قريباً (تخمين محتمل 75%).' },
      { de: 'Er könnte krank sein.', ar: 'قد يكون مريضاً (احتمال 50%).' },
      { de: 'Sie will reich sein.', ar: 'هي تدعي أنها غنية (شك في كلامها).' },
      { de: 'Er soll sehr gut spielen.', ar: 'يُشاع أنه يلعب جيداً (نقل كلام الناس).' }
    ],
    table: {
      headers: ['الفعل', 'درجة التأكد / المعنى', 'مثال'],
      rows: [
        ['müssen', 'يقين عالٍ', 'Das Licht brennt, er muss da sein.'],
        ['dürfte', 'احتمال قوي', 'Es dürfte klappen.'],
        ['sollen', 'قيل عنه (إشاعة)', 'Der Film soll gut sein.'],
        ['wollen', 'ادعاء شخصي', 'Er will alles wissen.']
      ]
    },
    notes: ['هذه الاستخدامات تغير معنى الجملة كلياً من إجبار/قدرة إلى تخمين/شك.'],
    level: 'B2'
  },
  {
    id: 'b2-05',
    title: { de: 'Feste Nomen-Verb-Verbindungen', ar: 'متلازمات الاسم والفعل' },
    explanation: 'تعبيرات ثابتة تتكون من اسم وفعل، تعطي معنى خاصاً وغالباً ما تكون أكثر رسمية من الفعل البسيط.',
    examples: [
      { de: 'eine Entscheidung treffen', ar: 'يتخذ قراراً (بدلاً من entscheiden).' },
      { de: 'in Frage kommen', ar: 'يكون وارداً / متاحاً.' },
      { de: 'Kritik üben an', ar: 'ينقد / يوجه نقداً (بدلاً من kritisieren).' },
      { de: 'Einfluss nehmen auf', ar: 'يؤثر على (بدلاً من beeinflussen).' },
      { de: 'Hilfe leisten', ar: 'يقدم المساعدة (بدلاً من helfen).' }
    ],
    table: {
      headers: ['التركيب', 'الفعل البسيط', 'المعنى'],
      rows: [
        ['Abschied nehmen', 'sich verabschieden', 'يودع'],
        ['in Ordnung bringen', 'ordnen/reparieren', 'يصلح/يرتب'],
        ['ein Gespräch führen', 'sprechen', 'يجري محادثة'],
        ['zur Verfügung stehen', 'da sein', 'يكون متاحاً']
      ]
    },
    notes: ['استخدام هذه التراكيب يرفع مستوى لغتك بشكل ملحوظ ويظهر التمكن من B2/C1.'],
    level: 'B2'
  },
  {
    id: 'b2-06',
    title: { de: 'Partizipialattribute (Erweitert)', ar: 'النعوت الموسعة (بالمصدر واسم المفعول)' },
    explanation: 'توسيع الصفة المشتقة من الفعل (Partizip) بمعلومات إضافية توضع بين الأداة والاسم. هذا التركيب شائع جداً في النصوص المكتوبة.',
    examples: [
      { de: 'Das auf dem Tisch liegende Buch.', ar: 'الكتاب الموضوع على الطاولة (الكتاب الذي يقع...).' },
      { de: 'Die von vielen Leuten besuchte Stadt.', ar: 'المدينة التي زارها الكثير من الناس.' },
      { de: 'Die schwer zu lösende Aufgabe.', ar: 'المهمة الصعبة الحل (التي يصعب حلها).' },
      { de: 'Der gestern angekommene Brief.', ar: 'الرسالة التي وصلت البارحة.' },
      { de: 'Die sich schnell entwickelnde Technologie.', ar: 'التكنولوجيا المتطورة بسرعة.' }
    ],
    table: {
      headers: ['الجملة الموصولة (Relativsatz)', 'النعت الموسع (Partizipialattribut)'],
      rows: [
        ['Das Auto, das schnell fährt', 'Das schnell fahrende Auto'],
        ['Das Haus, das zerstört wurde', 'Das zerstörte Haus']
      ]
    },
    notes: ['لترجمة هذه الجمل، ابدأ بالاسم الأخير ثم عد للوراء لترجمة الصفات والمعلومات المسبقة.'],
    level: 'B2'
  },
  {
    id: 'b2-07',
    title: { de: 'Zustandspassiv', ar: 'مبني المجهول للحالة' },
    explanation: 'يصف حالة الشيء بعد انتهاء الحدث، وليس الحدث نفسه. يتكون من sein + Partizip II.',
    examples: [
      { de: 'Das Fenster ist geöffnet.', ar: 'النافذة مفتوحة (حالتها الآن).' },
      { de: 'Das Fenster wird geöffnet.', ar: 'النافذة تُفتح (الحدث الآن - Vorgangspassiv).' },
      { de: 'Das Essen ist gekocht.', ar: 'الطعام مطبوخ (جاهز).' },
      { de: 'Der Brief ist geschrieben.', ar: 'الرسالة مكتوبة.' },
      { de: 'Alles ist vorbereitet.', ar: 'كل شيء مجهز.' }
    ],
    table: {
      headers: ['النوع', 'الفعل المساعد', 'التركيز'],
      rows: [
        ['Vorgangspassiv', 'werden', 'على العمل/الحدث نفسه'],
        ['Zustandspassiv', 'sein', 'على النتيجة النهائية/الحالة']
      ]
    },
    notes: ['لا نستخدم "von + الفاعل" عادةً مع Zustandspassiv، لأن التركيز على النتيجة فقط.'],
    level: 'B2'
  },
  {
    id: 'b2-08',
    title: { de: 'Verweiswörter im Text', ar: 'كلمات الإحالة والربط النصي' },
    explanation: 'استخدام كلمات تشير إلى ما قبلها أو ما بعدها لربط أجزاء النص ببعضها (dafür, damit, hierbei, worüber...).',
    examples: [
      { de: 'Er liebt Musik. Dafür gibt er viel Geld aus.', ar: 'هو يحب الموسيقى. لذلك (لأجل الموسيقى) ينفق الكثير.' },
      { de: 'Sie kocht gerne. Dabei entspannt sie sich.', ar: 'تحب الطبخ. خلال ذلك (الطبخ) تسترخي.' },
      { de: 'Wir brauchen ein Auto. Darum kümmern wir uns morgen.', ar: 'نحتاج سيارة. سنهتم بهذا الأمر غداً.' },
      { de: 'Es regnet. Dessen bin ich mir bewusst.', ar: 'إنها تمطر. أنا مدرك لذلك.' },
      { de: 'Worauf wartest du? Darauf!', ar: 'على ماذا تنتظر؟ على ذلك!' }
    ],
    table: {
      headers: ['da + Präposition', 'الاستخدام', 'مثال'],
      rows: [
        ['dafür', 'für das', 'Ich bin dafür (مع ذلك).'],
        ['davon', 'von dem', 'Ich weiß nichts davon.'],
        ['daran', 'an das', 'Ich denke daran.']
      ]
    },
    notes: ['da-Wörter تستخدم لغير العاقل فقط. للعاقل نستخدم حروف الجر مع الضمائر (für ihn, mit ihr).'],
    level: 'B2'
  },
  {
    id: 'b2-09',
    title: { de: 'Lokale Präpositionen (Erweitert)', ar: 'حروف الجر المكانية المتقدمة' },
    explanation: 'حروف جر دقيقة لتحديد الموقع والاتجاه مثل: entlang, gegenüber, innerhalb, außerhalb, jenseits.',
    examples: [
      { de: 'Wir gehen den Fluss entlang.', ar: 'نمشي بمحاذاة النهر (entlang تأتي بعد الاسم + Akk).' },
      { de: 'Er wohnt der Post gegenüber.', ar: 'يسكن مقابل البريد (Dat).' },
      { de: 'Innerhalb der Stadt fahren Busse.', ar: 'داخل المدينة (Gen).' },
      { de: 'Außerhalb der Öffnungszeiten.', ar: 'خارج أوقات الدوام (Gen).' },
      { de: 'Jenseits der Berge.', ar: 'على الجانب الآخر من الجبال (Gen).' }
    ],
    table: {
      headers: ['Präposition', 'Kasus', 'Besonderheit'],
      rows: [
        ['entlang', 'Akkusativ', 'تأتي غالباً بعد الاسم (Postposition)'],
        ['gegenüber', 'Dativ', 'تأتي قبل أو بعد الاسم'],
        ['innerhalb', 'Genitiv', 'زمان ومكان']
      ]
    },
    notes: ['تساعد هذه الحروف في الوصف الدقيق للطريق والمواقع.'],
    level: 'B2'
  },
  {
    id: 'b2-10',
    title: { de: 'Vergleichssätze (je ... desto)', ar: 'جمل المقارنة التصاعدية' },
    explanation: 'تعبير عن علاقة طردية بين شيئين: "كلما ... كلما ...".',
    examples: [
      { de: 'Je mehr ich lerne, desto besser spreche ich.', ar: 'كلما تعلمت أكثر، تحدثت بشكل أفضل.' },
      { de: 'Je schneller, desto besser.', ar: 'كلما كان أسرع، كان أفضل.' },
      { de: 'Je älter man wird, umso ruhiger wird man.', ar: 'كلما كبر المرء، أصبح أكثر هدوءاً.' },
      { de: 'Je länger ich warte, desto nervöser werde ich.', ar: 'كلما انتظرت أطول، أصبحت أكثر توتراً.' }
    ],
    table: {
      headers: ['الجزء الأول (Nebensatz)', 'الجزء الثاني (Hauptsatz)'],
      rows: [
        ['Je + Komparativ (فعل بالنهاية)', 'desto/umso + Komparativ + Verb + Subjekt'],
        ['Je mehr du übst,', 'desto besser wirst du.']
      ]
    },
    notes: ['انتبه لترتيب الكلمات: في جملة desto، يأتي الفعل مباشرة بعد صفة المقارنة.'],
    level: 'B2'
  }
];