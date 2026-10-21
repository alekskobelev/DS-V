import React from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeaderSearch: React.FC = () => {
  const { setIsSearchOpen } = useApp();

  return (
    <button
      type="button"
      id="header-search-btn"
      onClick={() => setIsSearchOpen(true)}
      className="p-1.5 sm:p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors shrink-0 flex items-center justify-center cursor-pointer"
      title="Поиск по сайту (Ctrl+K)"
      aria-label="Поиск по сайту"
    >
      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
};
