import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentItem } from './types';
import { FALLBACK_SEED_CONTENTS } from './data/fallbackContent';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContentLibraryPage } from './pages/ContentLibraryPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { AdminPage } from './pages/AdminPage';
import { UploadModal } from './components/admin/UploadModal';
import { MySubmissions } from './components/content/MySubmissions';
import { UploadCloud } from 'lucide-react';

function NexusApp() {
  const { user, loading, fetchWithAuth } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalUploadOpen, setIsGlobalUploadOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchContents = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/content');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.contents && data.contents.length > 0) {
          setContents(data.contents);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend content fetch notice:', err);
    }
    // Fallback seed catalog ensures full functionality on Vercel
    setContents((prev) => (prev.length > 0 ? prev : FALLBACK_SEED_CONTENTS));
  }, [fetchWithAuth]);

  useEffect(() => {
    if (user) {
      fetchContents();
    }
  }, [user, fetchContents]);

  // Keyboard shortcut: Cmd+K / Ctrl+K to jump to search in Content Library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentView('content');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectContent = (content: ContentItem) => {
    setSelectedContent(content);
    setCurrentView('content-detail');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'content-detail') {
      setSelectedContent(null);
    }
  };

  // Loading Session Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-emerald-300 tracking-wider uppercase">
          INITIALIZING ZERO-TRUST SECURE ENCLAVE...
        </p>
      </div>
    );
  }

  // Not logged in -> Render login page
  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Logged in -> Render Main Workspace Layout
  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky TopBar */}
        <TopBar
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentView !== 'content') {
              setCurrentView('content');
            }
          }}
        />

        {/* Viewport View Switcher */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardPage
              contents={contents}
              onSelectContent={handleSelectContent}
              onNavigate={handleNavigate}
              onRefreshContents={fetchContents}
              onToast={addToast}
            />
          )}

          {currentView === 'content' && (
            <ContentLibraryPage
              contents={contents}
              onSelectContent={handleSelectContent}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onUploadClick={() => setIsGlobalUploadOpen(true)}
            />
          )}

          {currentView === 'my-uploads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f151c] border border-slate-800 shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-2">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span>USER FILE REPOSITORY &amp; STATUS</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Upload &amp; My Stored Files
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Securely upload training videos, PDF documents, and HTML files to be stored. Uploaded files are automatically sent to the Administrator for approval or rejection.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-upload-my-files"
                  onClick={() => setIsGlobalUploadOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New File to Store</span>
                </button>
              </div>

              <MySubmissions
                onOpenUpload={() => setIsGlobalUploadOpen(true)}
                onUploadNew={() => setIsGlobalUploadOpen(true)}
                onToast={addToast}
              />
            </div>
          )}

          {currentView === 'content-detail' && selectedContent && (
            <ContentDetailPage
              content={selectedContent}
              onBack={() => handleNavigate('content')}
              onRefreshContent={fetchContents}
            />
          )}

          {currentView.startsWith('admin-') && (
            <AdminPage
              initialSubTab={
                currentView === 'admin-queue'
                  ? 'queue'
                  : currentView === 'admin-security'
                  ? 'security'
                  : currentView === 'admin-activity'
                  ? 'activity'
                  : 'content'
              }
              contents={contents}
              onSelectContent={handleSelectContent}
              onRefreshContents={fetchContents}
              onToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isGlobalUploadOpen}
        onClose={() => setIsGlobalUploadOpen(false)}
        onSuccess={async () => {
          await fetchContents();
          addToast('success', 'Submitted', 'Your content was uploaded.');
        }}
        onToast={addToast}
      />

      {/* Toast Notification Enclave */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NexusApp />
    </AuthProvider>
  );
}
