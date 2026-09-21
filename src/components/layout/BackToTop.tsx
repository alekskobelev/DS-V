import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    const triggerShow = (isScrollingUp: boolean) => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollY / docHeight) * 100)) : 0;
      
      setScrollProgress(progress);

      // Only show if user has scrolled down at least 150px
      if (scrollY > 150) {
        setVisible(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        // Always show the circular progress on the right edge, auto-hide after 3s of inactivity unless hovered
        hideTimerRef.current = setTimeout(() => {
          if (!isHovered) {
            setVisible(false);
          }
        }, 3000);
      } else {
        setVisible(false);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;
      triggerShow(isScrollingUp);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 1200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setVisible(false);
  };

  // Calculate SVG stroke dasharray values
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`transition-all duration-300 ${
        visible
          ? 'opacity-100 scale-100 pointer-events-auto max-w-[56px]'
          : 'opacity-0 scale-75 pointer-events-none max-w-0 overflow-hidden'
      }`}
    >
      <button
        id="back-to-top-btn"
        onClick={scrollToTop}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group focus:outline-none cursor-pointer flex items-center justify-center"
        title={`Наверх (${scrollProgress}%)`}
        aria-label="Прокрутить наверх страницы"
      >
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-[52px] sm:h-[52px]">
          {/* SVG Circular Progress Background */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 transform text-gray-200"
            viewBox="0 0 52 52"
          >
            <circle
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200/80 dark:text-slate-700/80"
            />
            <circle
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-blue-600 transition-all duration-300 ease-out"
            />
          </svg>

          {/* Button Core */}
          <div className="w-10 h-10 sm:w-[44px] sm:h-[44px] bg-white/95 dark:bg-slate-800/95 hover:bg-blue-600 text-slate-500 dark:text-gray-200 hover:text-white rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center z-10">
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
};
