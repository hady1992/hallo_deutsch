import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Baby,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Languages,
  Layers,
  LayoutGrid,
  PenTool,
  Target,
  Trophy,
} from 'lucide-react';

const SECTION_CARDS = [
  { title: 'المستويات', description: 'من A1 إلى B2', path: '/levels', icon: Layers, accent: 'red' },
  { title: 'المفردات', description: 'تعلّم كلمات وأمثلة جديدة', path: '/vocabulary?tab=words', icon: BookOpen, accent: 'gold' },
  { title: 'القواعد', description: 'شرح منظم وأمثلة', path: '/vocabulary?tab=grammar', icon: PenTool, accent: 'red' },
  { title: 'التمارين', description: 'تدريب تفاعلي ونتائج فورية', path: '/exercises', icon: Dumbbell, accent: 'gold' },
  { title: 'الامتحانات', description: 'نماذج واختبارات حسب المستوى', path: '/exams', icon: Trophy, accent: 'red' },
  { title: 'الأطفال', description: 'محتوى وألعاب تعليمية', path: '/kids', icon: Baby, accent: 'gold' },
];

const BENEFITS = [
  { title: 'مسار منظم حسب المستويات', description: 'انتقل بين A1 وA2 وB1 وB2 ضمن صفحات واضحة.', icon: LayoutGrid },
  { title: 'شرح عربي وأمثلة ألمانية', description: 'افهم الفكرة بالعربية وطبّقها على أمثلة ألمانية.', icon: Languages },
  { title: 'تعلّم وتدريب في مكان واحد', description: 'مفردات وقواعد وتمارين واختبارات ضمن تجربة واحدة.', icon: Target },
  { title: 'مساحة مخصصة للأطفال', description: 'كلمات ومحادثات وألعاب تعليمية مناسبة للصغار.', icon: Baby },
];

const LEVELS = [
  { level: 'A1', title: 'المبتدئ', status: 'متاح الآن', available: true, path: '/level/a1' },
  { level: 'A2', title: 'ما قبل المتوسط', status: 'قيد التطوير', path: '/level/a2' },
  { level: 'B1', title: 'المتوسط', status: 'قيد التطوير', path: '/level/b1' },
  { level: 'B2', title: 'فوق المتوسط', status: 'قيد التطوير', path: '/level/b2' },
];

function Home() {
  return (
    <div className="bg-[#fcfaf6]" dir="rtl">
      <Helmet>
        <title>Hallo Deutsch | تعلم اللغة الألمانية من A1 إلى B2</title>
        <meta name="description" content="تعلم اللغة الألمانية بالعربية من المستوى A1 إلى B2 من خلال دروس منظمة، مفردات، قواعد، تمارين تفاعلية واختبارات." />
        <link rel="canonical" href="https://hallodeutschpro.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hallodeutschpro.com/" />
        <meta property="og:title" content="Hallo Deutsch | تعلم اللغة الألمانية من A1 إلى B2" />
        <meta property="og:description" content="تعلم اللغة الألمانية بالعربية من خلال دروس منظمة، مفردات، قواعد، تمارين تفاعلية واختبارات." />
        <meta property="og:image" content="https://hallodeutschpro.com/brand/hallo-deutsch-logo.png" />
      </Helmet>

      <section className="relative mt-16 min-h-[650px] overflow-hidden md:mt-[72px] lg:h-[680px] lg:min-h-0">
        <picture>
          <source media="(max-width: 1280px)" srcSet="/home/academic-library-hero-1280.webp" />
          <img
            src="/home/academic-library-hero-1600.webp"
            width="1600"
            height="900"
            alt="مكتبة أكاديمية مع كتب وكرة أرضية وعلم ألمانيا"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-left"
          />
        </picture>
        <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

        <div className="container relative z-10 mx-auto grid min-h-[650px] items-center gap-5 px-4 py-8 text-white md:px-8 lg:h-full lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div className="max-w-2xl justify-self-end text-center lg:text-right">
            <p className="mb-3 text-sm font-bold text-[#f2c94c] md:text-base">Hallo Deutsch</p>
            <h1 className="text-4xl font-black leading-[1.2] md:text-6xl">
              بوابتك لإتقان
              <span className="mt-1 block text-[#e8b21e]">اللغة الألمانية</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-200 md:text-lg lg:mx-0">
              رحلة تعليمية متكاملة من الصفر حتى المستويات المتقدمة. دروس منظمة، مفردات وقواعد، تمارين تفاعلية، واختبارات تساعدك على قياس تقدمك.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/levels" className="brand-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d71920] px-7 py-3 font-black text-white transition-colors hover:bg-[#b91218]">
                ابدأ التعلم الآن
                <ArrowLeft size={19} aria-hidden="true" />
              </Link>
              <Link to="/placement-test" className="brand-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/55 bg-black/20 px-7 py-3 font-black text-white transition-colors hover:bg-white/10">
                اختبر مستواك
                <Target size={19} aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm text-stone-200 lg:justify-start">
              {['مستويات من A1 إلى B2', 'شرح عربي واضح', 'تمارين بنتائج فورية'].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-[#e8b21e]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-first mx-auto w-full max-w-[190px] lg:order-none lg:max-w-[360px]">
            <img
              src="/brand/hallo-deutsch-logo.webp"
              width="967"
              height="1000"
              alt="Hallo Deutsch – تعلم اللغة الألمانية"
              className="h-auto w-full rounded-full bg-white object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </section>

      <section aria-label="أقسام الموقع" className="border-b border-black/10 bg-[#fcfaf6] py-8 md:py-10">
        <div className="container mx-auto grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-3 xl:grid-cols-6">
          {SECTION_CARDS.map(({ title, description, path, icon: Icon, accent }) => (
            <Link key={path} to={path} className="brand-focus group relative min-h-[152px] rounded-lg border border-black/10 bg-white p-5 shadow-[0_8px_24px_rgba(28,25,23,0.06)] transition-transform hover:-translate-y-1">
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ${accent === 'red' ? 'bg-red-50 text-[#d71920]' : 'bg-amber-50 text-[#b08000]'}`}>
                <Icon size={23} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-black text-[#111111]">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-[#5f6368]">{description}</p>
              <span className={`absolute inset-x-5 bottom-0 h-0.5 ${accent === 'red' ? 'bg-[#d71920]' : 'bg-[#e8b21e]'}`} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <p className="font-bold text-[#b08000]">لماذا Hallo Deutsch؟</p>
            <h2 className="mt-2 text-3xl font-black text-[#111111] md:text-4xl">تجربة تعليمية متكاملة</h2>
            <p className="mt-4 leading-7 text-[#5f6368]">أدوات التعلّم الأساسية مرتبة في مسارات واضحة، لتنتقل من الشرح إلى التطبيق دون تشتت.</p>
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ title, description, icon: Icon }) => (
              <div key={title} className="border-r-2 border-[#e8b21e] pr-4">
                <Icon size={26} className="mb-4 text-[#d71920]" aria-hidden="true" />
                <h3 className="text-lg font-black text-[#111111]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5f6368]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#fcfaf6] py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-bold text-[#b08000]">مسارك الدراسي</p>
              <h2 className="mt-2 text-3xl font-black text-[#111111] md:text-4xl">اختر المستوى المناسب</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#5f6368]">ابدأ من الأساسيات في A1، وتابع الأقسام الأخرى بالتزامن مع توسّع المحتوى المنشور.</p>
            </div>
            <Link to="/levels" className="brand-focus inline-flex min-h-11 items-center gap-2 self-start rounded-md font-bold text-[#b91218] hover:text-[#8f0e13]">
              عرض جميع المستويات
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map(({ level, title, status, available, path }) => (
              <Link key={level} to={path} className="brand-focus group rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-[#d71920]/40">
                <div className="flex items-center justify-between gap-3">
                  <span dir="ltr" className="german-text text-3xl font-black text-[#111111]">{level}</span>
                  <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${available ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    {status}
                  </span>
                </div>
                <h3 className="mt-7 font-black text-[#111111]">{title}</h3>
                <span className="mt-5 block h-0.5 w-10 bg-[#e8b21e] transition-[width] group-hover:w-16" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
