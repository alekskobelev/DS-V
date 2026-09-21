import React from 'react';
import { CallbackFloatingButton } from './CallbackFloatingButton';
import { BackToTop } from './BackToTop';
import { ChatWidget } from './ChatWidget';

/**
 * Mobile-Specific & Universal Container for Bottom Navigation Actions
 * - Contact Engineer (ChatWidget)
 * - Callback Request (CallbackFloatingButton)
 * - Back to Top with circular progress (BackToTop)
 * 
 * Uses CSS Flexbox positioning pinned strictly at the viewport bottom (fixed bottom-0 inset-x-0)
 * with safe-area padding to ensure actions never overlap mid-page content on mobile devices.
 */
export const BottomNavigationActions: React.FC = () => {
  return (
    <div
      id="mobile-bottom-nav-actions"
      data-testid="bottom-navigation-actions"
      role="region"
      aria-label="Быстрые действия и связь с инженером"
      className="fixed bottom-14 sm:bottom-16 xl:bottom-6 inset-x-0 z-40 pointer-events-none pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] px-4 md:px-6 w-full flex items-end justify-between transition-all duration-300"
    >
      {/* Left Action: Callback Request */}
      <div className="pointer-events-auto flex items-end">
        <CallbackFloatingButton />
      </div>

      {/* Right Actions: Back to Top and Engineer Chat in unified horizontal flex group */}
      <div className="pointer-events-auto flex items-end gap-2.5 sm:gap-3">
        <BackToTop />
        <ChatWidget />
      </div>
    </div>
  );
};
