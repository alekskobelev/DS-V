import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
  scrollStep?: number;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({ 
  children, 
  className = '', 
  scrollStep = 400 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [children]); // Re-check if content changes

  const scrollBoard = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollStep : scrollStep,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Left Scroll Button */}
      <button 
        onClick={() => scrollBoard('left')}
        disabled={!canScrollLeft}
        title="Прокрутить влево"
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/40 backdrop-blur-sm border border-gray-200 shadow-sm shadow-slate-900/10 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#2563EB] focus:outline-none flex items-center justify-center ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-30 group-hover:opacity-90 text-slate-500'}`}
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
      </button>

      {/* Right Scroll Button */}
      <button 
        onClick={() => scrollBoard('right')}
        disabled={!canScrollRight}
        title="Прокрутить вправо"
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/40 backdrop-blur-sm border border-gray-200 shadow-sm shadow-slate-900/10 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#2563EB] focus:outline-none flex items-center justify-center ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-30 group-hover:opacity-90 text-slate-500'}`}
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
      </button>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`overflow-x-auto no-scrollbar scroll-smooth no-scrollbar ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
