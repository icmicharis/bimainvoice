import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useThemeStore } from '@/stores/theme-store';

const queryClient = new QueryClient();

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<'invoices' | 'payments' | 'settings'>('invoices');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service worker registration failed');
      });
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'invoices' && <InvoicesPage />}
            {currentPage === 'payments' && <PaymentsPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
