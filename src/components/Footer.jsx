import React from 'react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'الرئيسية', path: '/' },
  { label: 'المستويات', path: '/levels' },
  { label: 'المفردات', path: '/vocabulary' },
  { label: 'القواعد', path: '/grammar' },
];

const LEARNING_LINKS = [
  { label: 'التمارين', path: '/exercises' },
  { label: 'الامتحانات', path: '/exams' },
  { label: 'تحديد المستوى', path: '/placement-test' },
  { label: 'قسم الأطفال', path: '/kids' },
];

function Footer() {
  return (
    <footer className="border-t-4 border-[#d71920] bg-[#111111] py-12 text-white md:py-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="brand-focus inline-flex items-center gap-3 rounded-md">
              <img
                src="/brand/hallo-deutsch-mark.webp"
                width="48"
                height="48"
                loading="lazy"
                alt="Hallo Deutsch – تعلم اللغة الألمانية"
                className="h-12 w-12 rounded-md bg-white object-contain"
              />
              <span dir="ltr" className="german-text text-xl font-black">
                <span className="text-white">Hallo </span>
                <span className="text-[#ef2b32]">Deutsch</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-stone-400">
              منصة عربية لتعلّم اللغة الألمانية عبر دروس منظمة، مفردات وقواعد، تمارين تفاعلية واختبارات حسب المستوى.
            </p>
          </div>

          <div>
            <h2 className="font-black text-[#e8b21e]">روابط سريعة</h2>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="brand-focus inline-flex min-h-11 items-center rounded-md text-sm text-stone-300 transition-colors hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-black text-[#e8b21e]">ابدأ من هنا</h2>
            <ul className="mt-4 space-y-2">
              {LEARNING_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="brand-focus inline-flex min-h-11 items-center rounded-md text-sm text-stone-300 transition-colors hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-center text-xs text-stone-500 md:flex-row md:items-center md:justify-between md:text-right">
          <p>© {new Date().getFullYear()} Hallo Deutsch. جميع الحقوق محفوظة.</p>
          <p dir="ltr" className="german-text md:text-left">Deutsch lernen, Schritt für Schritt.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
