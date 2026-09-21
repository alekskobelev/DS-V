import React, { useEffect } from 'react';
import { CrmAdminView } from '../components/CrmAdminView';
import { usePageVisits } from '../hooks/usePageVisits';
import { useApp } from '../context/AppContext';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export const CrmPage: React.FC = () => {
  usePageVisits('crm');
  const { currentUser, isAdmin, userPermissions, navigateTo } = useApp();
  const hasCrmAccess = !!currentUser && (isAdmin || !!userPermissions?.canAccessCrm || currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'manager');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!hasCrmAccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Доступ к CRM ограничен</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Раздел управления сделками, воронками и контактами предназначен исключительно для уполномоченных менеджеров и инженеров компании «ДС‑Инжиниринг».
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => navigateTo('account')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти в личный кабинет сотрудника</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Вернуться на главную страницу</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f3f4f6]">
      <div className="bg-[#1e3a8a] py-8 text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">CRM & Онлайн-инженер</h1>
          <p className="mt-2 text-blue-100">Управление заявками, диалогами и поддержкой</p>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CrmAdminView />
      </div>
    </div>
  );
};
