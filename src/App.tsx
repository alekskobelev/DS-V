import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { PRODUCTS_DATA, SERVICES_DATA } from './data/mockData';
import { PageId } from './types';
import { updateDocumentSeo, resolveDynamicSeo } from './utils/seo';
import { getCanonicalUrl, parseUrl } from './utils/routes';
import { usePageVisits } from './hooks/usePageVisits';
import { ErrorBoundary } from './components/common/ErrorBoundary';

console.log('[BOOT] [5/5] src/App.tsx module loaded');

// Pages (Direct static imports for instant page switching and 100% resilient rendering)
import { HomePage } from './pages/HomePage';
import { SoftwarePage } from './pages/SoftwarePage';
import { HardwarePage } from './pages/HardwarePage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { GlossaryPage } from './pages/GlossaryPage';
import { NewsPage } from './pages/NewsPage';
import { ContactsPage } from './pages/ContactsPage';
import { CustomPageView } from './pages/CustomPageView';
import { AccountPage } from './pages/AccountPage';
import { CmsPage } from './pages/CmsPage';
import { CrmPage } from './pages/CrmPage';
import { SitemapPage } from './pages/SitemapPage';
import { ComparePage } from './pages/ComparePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { YandexMetrica } from './components/common/YandexMetrica';

const PageSkeletonFallback: React.FC = () => (
  <div className="w-full flex-1 flex flex-col items-center justify-center py-24 px-4 min-h-[45vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase font-sans">
        Загрузка инженерного модуля...
      </span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  console.log('[APP_BOOT] AppContent rendering...');
  const {
    currentPage,
    customPages,
    toastMessage,
    navigateTo,
    selectedProduct,
    selectedArticle,
    selectedKnowledgeItem,
    selectedServiceId,
    selectedKnowledgeCategory,
    services,
    isAdmin,
  } = useApp();

  console.log('[APP_BOOT] AppContent Context consumed. Current page:', currentPage);

  useEffect(() => {
    console.log('[APP_BOOT] AppContent mounted successfully. Pathname:', window.location.pathname, 'Hash:', window.location.hash);
  }, []);

  // Track page visit frequency into localStorage
  usePageVisits(currentPage);

  // Dynamic SEO Page Title, Meta Description, Keywords, Canonical, OpenGraph, Twitter, Robots & Schema.org Breadcrumbs
  useEffect(() => {
    const seoMeta = resolveDynamicSeo({
      page: currentPage,
      selectedProduct,
      selectedArticle,
      selectedKnowledgeItem,
      selectedServiceId,
      selectedKnowledgeCategory,
      customPages,
      services,
      isAdmin,
    });

    updateDocumentSeo(seoMeta);
  }, [
    currentPage,
    selectedProduct,
    selectedArticle,
    selectedKnowledgeItem,
    selectedServiceId,
    selectedKnowledgeCategory,
    customPages,
    services,
    isAdmin,
  ]);

  const lastProcessedHashRef = useRef<string | null>(null);

  // Deep linking via URL hash support (#software, #shining3d-inspect, #calculator, etc.)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash || rawHash === lastProcessedHashRef.current) return;
      lastProcessedHashRef.current = rawHash;

      const validPages: PageId[] = [
        'home', 'software', 'hardware', 'services', 'about', 
        'knowledge', 'news', 'contacts', 'account', 'cms', 'crm', 'sitemap'
      ];

      if (validPages.includes(rawHash as PageId)) {
        navigateTo(rawHash as PageId);
        return;
      }

      // Check if hash matches a service ID
      const srv = SERVICES_DATA.find((s) => s?.id && rawHash && s.id.toLowerCase() === rawHash.toLowerCase());
      if (srv) {
        navigateTo('services', srv.id);
        return;
      }

      // Check if hash matches a product ID
      const prod = PRODUCTS_DATA.find((p) => p?.id && rawHash && p.id.toLowerCase() === rawHash.toLowerCase());
      if (prod) {
        navigateTo(prod.type === 'software' ? 'software' : 'hardware', prod.id);
        return;
      }

      // If hash is calculator alias, navigate to services and scroll to calculator
      if (rawHash === 'calculator' || rawHash === 'service-calculator') {
        navigateTo('services');
        setTimeout(() => {
          const el = document.getElementById('service-calculator');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
        return;
      }

      // Check if hash matches custom page
      if (rawHash.startsWith('custom-')) {
        navigateTo(rawHash as PageId);
        return;
      }

      // Check if hash is an element on the page (e.g. #section-cases)
      const targetElem = document.getElementById(rawHash);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Check if hash matches known route via parseUrl
      const parsed = parseUrl(window.location.pathname, rawHash);
      if (parsed.page !== 'notfound') {
        navigateTo(parsed.page, parsed.detailId);
        return;
      }

      // If we got here, hash doesn't match anything
      navigateTo('notfound');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigateTo]);

  const renderPage = () => {
    console.log('[APP_BOOT] renderPage executing for currentPage:', currentPage);
    if (currentPage === 'crm') return <CrmPage />;
    if (currentPage === 'cms') {
      return <CmsPage />;
    }

    if (currentPage.startsWith('custom-')) {
      const foundCustomPage = customPages.find((p) => p.id === currentPage);
      if (foundCustomPage) {
        return <CustomPageView page={foundCustomPage} />;
      }
      return <HomePage />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'software':
        return <SoftwarePage />;
      case 'hardware':
        return <HardwarePage />;
      case 'services':
        return <ServicesPage />;
      case 'about':
        return <AboutPage />;
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'glossary':
        return <GlossaryPage />;
      case 'news':
        return <NewsPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'account':
        return <AccountPage />;
      case 'sitemap':
        return <SitemapPage />;
      case 'compare':
        return <ComparePage />;
      case 'notfound':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="w-full flex-1 flex flex-col min-h-[calc(100vh-140px)]"
        >
          <React.Suspense fallback={<PageSkeletonFallback />}>
            {renderPage()}
          </React.Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default function App() {
  console.log('[APP_BOOT] App component rendering root tree...');
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <YandexMetrica />
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
