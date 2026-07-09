import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, PenTool, Shield, ShieldCheck, Baby, Trophy, Dumbbell, BookOpen, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAuthorizedAdminEmail } from '@/components/AdminGate';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = isAuthorizedAdminEmail(user?.email);

  const navItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/levels', label: 'المستويات', icon: <Layers size={16} className="inline ml-1" /> },
    { path: '/vocabulary', label: 'المفردات', icon: <BookOpen size={16} className="inline ml-1" /> },
    { path: '/grammar', label: 'القواعد', icon: <PenTool size={16} className="inline ml-1" /> },
    { path: '/kids', label: 'أطفال', icon: <Baby size={18} className="text-pink-500 inline ml-1" /> },
    { path: '/exercises', label: 'التمارين', icon: <Dumbbell size={16} className="inline ml-1" /> },
    { path: '/exams', label: 'الامتحانات', icon: <Trophy size={16} className="inline ml-1" /> },
    { path: '/placement-test', label: 'تحديد المستوى' }
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    // Only allow admin access with Shift+Click
    if (e.shiftKey) {
      e.preventDefault();
      navigate('/admin');
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-sm fixed top-0 w-full z-50 border-b border-slate-100 h-16 md:h-20 flex items-center transition-all" dir="rtl">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Logo Section */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="german-text text-xl md:text-2xl font-black text-blue-700 tracking-tight flex items-center gap-2 select-none z-50"
            title="Hallo Deutsch"
          >
            Hallo <span className="text-slate-800">Deutsch</span>
            {isAdmin && <ShieldCheck size={16} className="text-green-500" />}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 border-2 border-blue-100 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 z-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="القائمة"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
            {isOpen && (
                 <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: '100vh' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 top-0 bg-white z-40 xl:hidden overflow-y-auto pt-20 px-4 pb-10"
                >
                    <div className="flex flex-col gap-2">
                        {navItems.map((item, idx) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                to={item.path}
                                className={`flex items-center justify-between p-4 rounded-xl text-lg font-bold min-h-[60px] transition-colors border border-transparent ${
                                location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : 'text-slate-700 hover:bg-slate-50 hover:border-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    {item.label}
                                </div>
                                {location.pathname === item.path && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            </Link>
                        </motion.div>
                        ))}
                        
                        {/* Only show Admin panel link if user is actually an admin */}
                        {isAdmin && (
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <button 
                                    onClick={() => { navigate('/admin'); setIsOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold min-h-[60px] bg-green-50 text-green-700"
                                >
                                    <Shield size={20} />
                                    <span>لوحة التحكم (نشط)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navigation;
