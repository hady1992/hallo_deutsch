import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Levels from '@/pages/Levels';
import LevelA1 from '@/pages/LevelA1';
import LevelA2 from '@/pages/LevelA2';
import LevelB1 from '@/pages/LevelB1';
import LevelB2 from '@/pages/LevelB2';
import Vocabulary from '@/pages/Vocabulary';
import Grammar from '@/pages/Grammar';
import Exercises from '@/pages/Exercises';
import Exams from '@/pages/Exams';
import PlacementTest from '@/pages/PlacementTest';
import AdminPanel from '@/pages/AdminPanel';
import Kids from '@/pages/Kids'; 
import PlacementMigration from '@/pages/PlacementMigration';
import AdminGate from '@/components/AdminGate';
import { Toaster } from '@/components/ui/toaster';
import VerbConjugationExplorer from '@/components/VerbConjugationExplorer';
import GrammarRulesDatabase from '@/components/GrammarRulesDatabase';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { initializeDefaultData } from '@/utils/dataInitializer';
import { syncLocalStorageToSupabase } from '@/utils/storageManager';

function App() {
  
  // App Initialization
  useEffect(() => {
    const init = async () => {
        try {
            // 1. Initialize Defaults (Local Storage)
            initializeDefaultData();
            
            // 2. Initial Sync to Supabase (Background)
            // Prevent spamming sync on every reload if recently synced
            const lastSync = localStorage.getItem('lastSupabaseSync');
            const now = Date.now();
            if (!lastSync || (now - new Date(lastSync).getTime() > 1000 * 60 * 60)) { // 1 hour
                console.log("Triggering background sync...");
                const result = await syncLocalStorageToSupabase();
                if (result.success) {
                    localStorage.setItem('lastSupabaseSync', new Date().toLocaleString());
                }
            }
        } catch (e) {
            console.error("App initialization error:", e);
        }
    };
    init();
  }, []);

  return (
    <AuthProvider>
        <BrowserRouter>
        <Helmet>
            <html lang="ar" dir="rtl" />
        </Helmet>
        <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/level/a1" element={<LevelA1 />} />
            <Route path="/level/a2" element={<LevelA2 />} />
            <Route path="/level/b1" element={<LevelB1 />} />
            <Route path="/level/b2" element={<LevelB2 />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/grammar" element={<Grammar />} />
            
            {/* Kids Route */}
            <Route path="/kids" element={<Kids />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/migration" element={<AdminGate><PlacementMigration /></AdminGate>} />
            
            {/* Feature Routes */}
            <Route path="/grammar/rules" element={<GrammarRulesDatabase />} />
            <Route path="/verbs/explorer" element={
                <div className="container mx-auto px-4 py-24 min-h-screen">
                <VerbConjugationExplorer />
                </div>
            } />

            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/placement-test" element={<PlacementTest />} />
            </Routes>
        </Layout>
        <Toaster />
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
