import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden" dir="rtl">
      <Navigation />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;