import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center"
      >
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">
          Страница не найдена
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Возможно, она была удалена, переименована, или вы ввели неверный адрес. Пожалуйста, проверьте правильность ссылки.
        </p>
        
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto"
        >
          <Home className="w-5 h-5" />
          <span>Вернуться на главную</span>
        </button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;

