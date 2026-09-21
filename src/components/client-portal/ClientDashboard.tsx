import React from 'react';
import { Package, Truck, CheckCircle2, Wrench, ShieldCheck, Download, ArrowRight, Activity, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';

interface ClientDashboardProps {
  currentUser: UserProfile;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-50">
          Кабинет клиента: <span className="text-emerald-700 dark:text-emerald-400">{currentUser.company || 'Ваша компания'}</span>
        </h2>
        <p className="text-sm text-emerald-800/80 dark:text-emerald-200/70 mt-2 max-w-3xl leading-relaxed">
          Здравствуйте, {currentUser.fullName}. Здесь вы можете отслеживать статусы поставок, управлять лицензиями и получать техподдержку.
        </p>
      </div>

      {/* Active Deliveries Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Активные поставки и проекты</h3>
        </div>

        {/* Mock Delivery Item */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                Договор: ДОГ-2026-СМР/04
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Поставка мостовой КИМ Mitutoyo CRYSTA-Apex V9168
              </h4>
              <div className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ожидаемая дата завершения: <strong className="text-slate-700 dark:text-slate-300">15.11.2026</strong>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Activity className="w-4 h-4 text-emerald-500" />
              Статус: В пути (Таможня)
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative px-2 md:px-6">
            <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full hidden sm:block" />
            <div className="absolute left-6 top-5 -translate-y-1/2 w-[55%] h-1 bg-blue-600 rounded-full transition-all duration-1000 hidden sm:block" />
            
            <div className="relative flex justify-between gap-2 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Заказ<br/>размещен
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Производство
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-blue-50 dark:border-slate-800 shadow-sm ring-4 ring-blue-500/20 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Доставка
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border-4 border-white dark:border-slate-900 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider leading-tight">
                  Монтаж<br/>и ПНР
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border-4 border-white dark:border-slate-900 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider leading-tight">
                  Поверка<br/>АРШИН
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Documents */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Новые документы для скачивания</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <span className="font-black text-[10px]">PDF</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Счет-фактура №1123</div>
                  <div className="text-xs text-slate-500 mt-0.5">От 14.09.2026 • 245 КБ</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <span className="font-black text-[10px]">PDF</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Сертификат PolyWorks|Inspector</div>
                  <div className="text-xs text-slate-500 mt-0.5">От 01.09.2026 • 1.2 МБ</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Support quick link */}
        <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 shadow-xs text-slate-900 dark:text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">Техническая поддержка</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-sm">
              У вас есть вопросы по работе оборудования или требуется обновление лицензии `.v2c`? Создайте сервисное обращение, привязанное к вашему серийному номеру.
            </p>
          </div>
          <button className="relative z-10 w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs">
            <span>Создать B2B-тикет</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
