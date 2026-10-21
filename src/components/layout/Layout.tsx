import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { BottomNavigationActions } from './BottomNavigationActions';
import { MobileTabBar } from './MobileTabBar';
import { ContactModal } from '../modals/ContactModal';
import { CallbackModal } from '../modals/CallbackModal';
import { CompareDrawer } from '../modals/CompareDrawer';
import { SearchModal } from '../modals/SearchModal';
import { PrivacyModal } from '../modals/PrivacyModal';
import { SmartLeadPopup } from '../modals/SmartLeadPopup';
import { MetrologyConfiguratorModal } from '../modals/MetrologyConfiguratorModal';
import { RoiCalculatorModal } from '../modals/RoiCalculatorModal';
import { ManagerLiveAlerts } from '../notifications/ManagerLiveAlerts';
import { FluidBackgroundCanvas } from '../common/FluidBackgroundCanvas';
import { OfflineIndicator } from '../OfflineIndicator';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Standard Application Layout Component
 * - Universal Fullscreen Fluid & Metrology Point Cloud Canvas in background
 * - Sticky Header at the top of the viewport (position: sticky)
 * - Breadcrumbs for contextual inner navigation
 * - Main content container that flows naturally with window scroll (no internal scrollbars)
 * - Sticky Footer at the bottom of viewport on short pages (flex-1 expansion), naturally scrolled on long pages
 * - Responsive on Mobile, Tablet, and Desktop without content overlap
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    toastMessage, 
    isConfiguratorModalOpen, 
    closeConfiguratorModal,
    isRoiCalculatorModalOpen,
    closeRoiCalculatorModal
  } = useApp();

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-clip pb-24 sm:pb-28 xl:pb-0 bg-slate-50/50 dark:bg-[#070e1b]/60 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Universal 3D Canvas Fluid & Particles background across all pages */}
      <FluidBackgroundCanvas />

      {/* Sticky Header: pins to top on scroll, respects document flow without overlapping content */}
      <Header />

      {/* Breadcrumbs navigation for subpages */}
      <div>
        <Breadcrumbs />
      </div>

      {/* Main Content Area: expands on short pages to push footer down, scrolls naturally with window */}
      <main id="main-content" className="flex-1 w-full flex flex-col min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Footer: natural position at the bottom of the page */}
      <div>
        <Footer />
      </div>

      {/* Global Interactive Overlays & Drawers */}
      <MobileTabBar />
      <BottomNavigationActions />
      <CompareDrawer />
      <SearchModal />
      <ContactModal />
      <CallbackModal />
      <PrivacyModal />
      <SmartLeadPopup />
      <MetrologyConfiguratorModal 
        isOpen={isConfiguratorModalOpen} 
        onClose={closeConfiguratorModal} 
      />
      <RoiCalculatorModal
        isOpen={isRoiCalculatorModalOpen}
        onClose={closeRoiCalculatorModal}
      />
      <ManagerLiveAlerts />
      <OfflineIndicator />

      {/* Global Notification Toast */}
      {toastMessage && (
        <div 
          id="toast-notification"
          data-testid="toast-notification"
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-xl shadow-md border border-blue-400/40 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-3 flex items-center gap-2 max-w-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
          <span data-testid="toast-message">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
