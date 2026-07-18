import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import AdminGate from '@/components/AdminGate';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { runContentResetMigration } from '@/utils/contentResetMigration';

const DEFAULT_DATA_VERSION = '2026-07-18-kids-defaults-v1';
const INITIALIZED_VERSION_KEY = 'halloDeutschDefaultDataVersion';

const Levels = lazy(() => import('@/pages/Levels'));
const CourseLevelPage = lazy(() => import('@/pages/CourseLevelPage'));
const CourseLessonPage = lazy(() => import('@/pages/CourseLessonPage'));
const Vocabulary = lazy(() => import('@/pages/Vocabulary'));
const Grammar = lazy(() => import('@/pages/Grammar'));
const Exercises = lazy(() => import('@/pages/Exercises'));
const Exams = lazy(() => import('@/pages/Exams'));
const PlacementTest = lazy(() => import('@/pages/PlacementTest'));
const Kids = lazy(() => import('@/pages/Kids'));
const PlacementMigration = lazy(() => import('@/pages/PlacementMigration'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const VerbConjugationExplorer = lazy(() => import('@/components/VerbConjugationExplorer'));
const GrammarRulesDatabase = lazy(() => import('@/components/GrammarRulesDatabase'));

const RouteLoader = () => (
  <div dir="rtl" className="flex min-h-[55vh] items-center justify-center px-4 text-center">
    <div role="status" className="space-y-3">
      <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />
      <p className="font-bold text-slate-600">جاري تحميل الصفحة...</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    document.documentElement.dataset.appReady = 'true';
    if (window.__halloDeutschBootTimer) window.clearTimeout(window.__halloDeutschBootTimer);

    runContentResetMigration();
    if (localStorage.getItem(INITIALIZED_VERSION_KEY) === DEFAULT_DATA_VERSION) return undefined;

    let cancelled = false;
    const initialize = () => {
      import('@/utils/dataInitializer')
        .then(({ initializeDefaultData }) => {
          if (!cancelled) initializeDefaultData();
        })
        .catch((error) => console.error('[App] Deferred data initialization failed:', error));
    };

    const idleId = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(initialize, { timeout: 2500 })
      : window.setTimeout(initialize, 800);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Helmet>
          <html lang="ar" dir="rtl" />
        </Helmet>
        <AppErrorBoundary>
          <Layout>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/levels" element={<Levels />} />
                <Route path="/level/:level" element={<CourseLevelPage />} />
                <Route path="/level/:level/lesson/:lessonSlug" element={<CourseLessonPage />} />
                <Route path="/vocabulary" element={<Vocabulary />} />
                <Route path="/grammar" element={<Grammar />} />
                <Route path="/kids" element={<Kids />} />
                <Route
                  path="/admin"
                  element={(
                    <AdminErrorBoundary>
                      <AdminPanel />
                    </AdminErrorBoundary>
                  )}
                />
                <Route
                  path="/migration"
                  element={(
                    <AdminGate>
                      <PlacementMigration />
                    </AdminGate>
                  )}
                />
                <Route path="/grammar/rules" element={<GrammarRulesDatabase />} />
                <Route
                  path="/verbs/explorer"
                  element={(
                    <div className="container mx-auto min-h-screen px-4 py-24">
                      <VerbConjugationExplorer />
                    </div>
                  )}
                />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/placement-test" element={<PlacementTest />} />
              </Routes>
            </Suspense>
          </Layout>
        </AppErrorBoundary>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
