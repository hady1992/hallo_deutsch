import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, FileText, Target, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
function Home() {
  const navigate = useNavigate();
  const features = [{
    icon: <BookOpen className="w-8 h-8" />,
    title: 'دروس مبسطة ومنظمة',
    description: 'محتوى تعليمي منظم حسب المستويات من A1 إلى B2'
  }, {
    icon: <Brain className="w-8 h-8" />,
    title: 'تمارين تفاعلية',
    description: 'تمارين متنوعة وتفاعلية مع نتائج فورية'
  }, {
    icon: <FileText className="w-8 h-8" />,
    title: 'نماذج امتحانات رسمية',
    description: 'نماذج امتحانات حقيقية لجميع المستويات'
  }, {
    icon: <Target className="w-8 h-8" />,
    title: 'تحديد مستوى دقيق',
    description: 'اختبار شامل لتحديد مستواك الحالي بدقة'
  }];
  return <>
      <Helmet>
        <title>{'Hallo Deutsch  - تعلم اللغة الألمانية'}</title>
        <meta name="description" content="تعلم اللغة الألمانية من المبتدئ إلى المتقدم مع دروس مبسطة وتمارين تفاعلية ونماذج امتحانات رسمية." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden group">
        {/* Background Image */}
        <div className="hero-bg absolute inset-0 z-0" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1694468693882-62b3be812a4a)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-blue-900/40 to-blue-950/75 z-0"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white pt-20">
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          ease: "easeOut"
        }}>
            <h1 className="german-text text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-tight tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
              Hallo Deutsch
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-blue-100 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
              بوابتك لإتقان اللغة الألمانية
            </h2>
          </motion.div>
          
          <motion.p initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.3
        }} className="text-lg md:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
            رحلة تعليمية متكاملة من الصفر حتى الاحتراف.. دروس تفاعلية، تمارين ذكية، وامتحانات تحاكي الواقع.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={() => navigate('/levels')} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[60px] px-10 text-lg md:text-xl rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
              ابدأ التعلّم الآن 🚀
            </Button>
            <Button onClick={() => navigate('/placement-test')} variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm min-h-[60px] px-10 text-lg md:text-xl rounded-full transition-all duration-300 w-full sm:w-auto">
              اختبر مستواك
            </Button>
          </motion.div>
        </div>

        {/* Fallback Admin Button */}
        <div className="fixed bottom-4 left-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="bg-slate-900/50 text-white/50 hover:bg-slate-900 hover:text-white backdrop-blur-sm" title="Admin Access (Hidden)">
            <ShieldCheck size={16} />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              لماذا تختار <span className="german-text text-blue-600">Hallo Deutsch</span>؟
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              نقدم لك تجربة تعليمية فريدة تجمع بين المتعة والفائدة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} whileHover={{
            y: -10
          }} className="bg-slate-50 p-8 rounded-3xl hover:bg-blue-50 transition-colors duration-300 border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>
    </>;
}
export default Home;