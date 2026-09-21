import React, { useEffect, useState } from 'react';

interface ScrollspyProps {
  sections: { id: string; label: string }[];
}

export const Scrollspy: React.FC<ScrollspyProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    setActiveSection(sections[0]?.id || '');
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sections.length) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if user is at the bottom of the page
      if (scrollPosition + windowHeight >= documentHeight - 80) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
          setActiveSection(lastSection.id);
          return;
        }
      }

      let currentSectionId = sections[0]?.id || '';

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollPosition;
          
          if (scrollPosition >= elementTop - 220) {
            currentSectionId = section.id;
          }
        }
      }

      setActiveSection(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initially after render
    const timeout = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 90;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  };

  if (!sections.length) return null;

  return (
    <div className="hidden xl:flex fixed right-1 2xl:right-2 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 bg-white/40 dark:bg-slate-900/40 hover:bg-white/75 dark:hover:bg-slate-900/75 backdrop-blur-xs border border-gray-200/50 dark:border-slate-800/50 p-1.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`group relative w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            activeSection === section.id
              ? 'bg-blue-600 dark:bg-blue-400 scale-125 ring-2 ring-blue-500/30'
              : 'bg-slate-300/80 dark:bg-slate-700/80 hover:bg-slate-400 dark:hover:bg-slate-500'
          }`}
          title={section.label}
          aria-label={section.label}
        >
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gray-900/95 dark:bg-slate-800/95 backdrop-blur-xs text-white text-[11px] font-medium rounded-lg shadow-lg border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {section.label}
            {/* Tooltip arrow */}
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-l-gray-900/95 dark:border-l-slate-800/95"></span>
          </span>
        </button>
      ))}
    </div>
  );
};

