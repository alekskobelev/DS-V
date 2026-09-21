import React from 'react';
import { Home, Box, Wrench, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileTabBar: React.FC = () => {
  const { currentPage, navigateTo } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'hardware', icon: Box, label: 'Оборудование' },
    { id: 'services', icon: Wrench, label: 'Услуги' },
    { id: 'contacts', icon: Phone, label: 'Контакты' },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 inset-x-0 z-[60] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
      <div className="flex items-center justify-around h-14 sm:h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as any)}
              className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] space-y-1 transition-all cursor-pointer active:scale-95 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'fill-blue-600/10 dark:fill-blue-400/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
