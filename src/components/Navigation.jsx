import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Baby,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Layers,
  Menu,
  Shield,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAuthorizedAdminEmail } from '@/components/AdminGate';

const NAV_ITEMS = [
  { path: '/', label: 'الرئيسية' },
  { path: '/levels', label: 'المستويات', icon: Layers },
  { path: '/vocabulary', label: 'المفردات', icon: BookOpen },
  { path: '/kids', label: 'أطفال', icon: Baby },
  { path: '/exercises', label: 'التمارين', icon: Dumbbell },
  { path: '/exams', label: 'الامتحانات', icon: Trophy },
  { path: '/placement-test', label: 'تحديد المستوى', icon: GraduationCap },
];

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = isAuthorizedAdminEmail(user?.email);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : previousOverflow;
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const handleLogoClick = (event) => {
    if (event.shiftKey) {
      event.preventDefault();
      navigate('/admin');
    }
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-black/10 bg-[#fcfaf6] md:h-[72px]" dir="rtl">
      <div className="container mx-auto flex w-full items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="brand-focus relative z-50 flex min-h-11 items-center gap-2 rounded-md"
          title="Hallo Deutsch"
        >
          <img
            src="/brand/hallo-deutsch-mark.webp"
            width="48"
            height="48"
            alt="Hallo Deutsch – تعلم اللغة الألمانية"
            className="h-10 w-10 object-contain md:h-12 md:w-12"
          />
          <span dir="ltr" className="german-text flex flex-col text-left text-lg font-black leading-[0.9] md:text-xl">
            <span className="text-[#111111]">Hallo</span>
            <span className="text-[#d71920]">Deutsch</span>
          </span>
          {isAdmin && <ShieldCheck size={16} className="text-emerald-600" aria-label="حساب أدمن" />}
        </Link>

        <div className="hidden items-stretch lg:flex">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                aria-current={isActive ? 'page' : undefined}
                className={`brand-focus relative flex min-h-11 items-center gap-1.5 px-3 text-sm font-bold transition-colors xl:px-4 ${
                  isActive ? 'text-[#d71920]' : 'text-[#44403c] hover:text-[#b08916]'
                }`}
              >
                {Icon && <Icon size={17} aria-hidden="true" />}
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 bg-[#d71920] transition-transform ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="brand-focus relative z-50 flex h-12 w-12 items-center justify-center rounded-md text-[#111111] transition-colors hover:bg-black/5 lg:hidden"
          aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X size={27} /> : <Menu size={27} />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`fixed inset-x-0 bottom-0 top-0 z-40 overflow-y-auto bg-[#fcfaf6] px-4 pb-8 pt-20 transition-transform duration-200 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="mx-auto grid max-w-xl gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                tabIndex={isOpen ? 0 : -1}
                aria-current={isActive ? 'page' : undefined}
                className={`brand-focus flex min-h-[56px] items-center justify-between rounded-md border px-4 text-base font-bold ${
                  isActive
                    ? 'border-red-200 bg-red-50 text-[#b91218]'
                    : 'border-transparent text-[#292524] hover:border-black/10 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {Icon && <Icon size={20} aria-hidden="true" />}
                  {label}
                </span>
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#d71920]' : 'bg-transparent'}`} aria-hidden="true" />
              </Link>
            );
          })}

          {isAdmin && (
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => { navigate('/admin'); setIsOpen(false); }}
              className="brand-focus mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 font-bold text-emerald-800"
            >
              <Shield size={20} />
              لوحة التحكم
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
