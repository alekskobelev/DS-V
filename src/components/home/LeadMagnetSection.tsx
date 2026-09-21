import React from 'react';
import { 
  Scan, 
  Download, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  FileSpreadsheet,
  Award,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeadMagnetSection: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Спецпредложения и сервис для промышленных предприятий</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Проверьте технологии <span className="whitespace-nowrap inline-block">«ДС&#8209;Инжиниринг»</span> до принятия решения о покупке
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Мы уверены в точности нашего оборудования и софта. Воспользуйтесь бесплатными инженерными сервисами для оценки эффективности.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Free Test Scan */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xs border-2 border-blue-200 dark:border-blue-900/60 group hover:border-blue-400 dark:hover:border-blue-600 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                <Scan className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full shadow-2xs">
                Бесплатно
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Тестовое 3D-сканирование детали заказчика
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Привезите контрольную деталь в наш измерительный центр или пришлите по почте. Мы выполним оцифровку на сканере FreeScan / PMT Arm и предоставим STL-сетку и цветовую карту отклонений.
              </p>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Оценка реальной точности и скорости</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Готовый протокол контроля первого изделия (FAI)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Консультация ведущего инженера-метролога</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() =>
                openContactModal({
                  title: 'Заказ бесплатного тестового сканирования',
                  defaultProduct: 'Тестовое 3D-сканирование детали',
                  formType: 'consultation',
                })
              }
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Записаться на сканирование</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: 30-Day Software Trial */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between border-2 border-amber-200 dark:border-amber-900/60 shadow-xs relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-600 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
                <Download className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-3.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700 shadow-2xs">
                Триал 30 дней
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Демо-доступ к TopSolid 7, PolyWorks и EXModel
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Получите полнофункциональную временную лицензию для тестирования на реальных проектах вашего конструкторско-технологического отдела с методической поддержкой.
              </p>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Полный доступ ко всем модулям CAD/CAM/Metrology</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Вводный технический инструктаж и консультации специалистов</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Проверка совместимости с вашим станочным парком</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() =>
                openContactModal({
                  title: 'Запрос 30-дневной демонстрационной лицензии ПО',
                  defaultProduct: 'TopSolid 7 / PolyWorks / Shining 3D Inspect (Trial)',
                  formType: 'consultation',
                })
              }
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Запросить демо-лицензию</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 3: CNC & Postprocessor Express Audit */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between border-2 border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-3.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs">
                Экспресс-аудит
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Аудит управляющих программ и постпроцессоров
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Экспертная проверка ЧПУ-программ и кинематики 3-5 осевых станков на риск зарезов и простоев. Разработка и адаптация постпроцессоров под стойки Fanuc, Heidenhain, Siemens, Mazak.
              </p>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% исключение коллизий шпинделя со столом</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Оптимизация траекторий инструмента (High-Speed Machining)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Сокращение машинного времени до 25–40%</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() =>
                openContactModal({
                  title: 'Заказ аудита станочного парка и постпроцессоров',
                  defaultProduct: 'Разработка и аудит постпроцессоров ЧПУ',
                  formType: 'service',
                })
              }
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Заказать аудит постпроцессора</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
