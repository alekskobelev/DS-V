import React from 'react';
import { 
  Building2, 
  Award, 
  Globe2, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { PARTNERS_DATA } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export const ManufacturersLogosSection: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();

  const handleBrandClick = (partner: typeof PARTNERS_DATA[0]) => {
    if (partner.category === 'software') {
      navigateTo('software');
    } else if (partner.category === 'cmm' || partner.category === 'scanners') {
      navigateTo('hardware');
    } else {
      openContactModal({ 
        title: `Запрос информации по оборудованию и ПО: ${partner.name}`,
        defaultProduct: partner.name,
        formType: 'quote'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block - Compact & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 text-xs font-bold rounded-md uppercase tracking-wider border border-blue-200 dark:border-blue-800 mb-2 shadow-xs">
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Официальные производители оборудования и ПО</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Бренды мирового уровня и партнерская сеть
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md text-left sm:text-right leading-relaxed">
          Прямые поставки оборудования, лицензионного софта и сертифицированное внедрение
        </p>
      </div>

      {/* 2 Dedicated Groups: Software Systems and Measurement Hardware */}
      <div className="space-y-6">
        {/* Group 1: Software Systems */}
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-xs font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 mt-1"></span>
            <span className="leading-snug">Программные комплексы (CAD / CAM / CAE / Метрология)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {PARTNERS_DATA.filter(p => p.category === 'software').map((partner) => (
              <div
                key={partner.name}
                onClick={() => handleBrandClick(partner)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
                    <div className="h-8 sm:h-9 flex items-center min-w-0 flex-1 bg-white px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <BrandLogo brandId={partner.name} className="h-6 sm:h-7 max-w-[125px] sm:max-w-[150px] w-auto object-contain" />
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                      <Globe2 className="w-3 h-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">{partner.country}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 line-clamp-2">
                    {partner.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1 overflow-hidden h-6">
                    {partner.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-800 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:text-blue-700 shrink-0">
                    <span>Каталог ПО</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group 2: Measurement Hardware */}
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0 mt-1"></span>
            <span className="leading-snug">Измерительное оборудование и КИМ (Координатные машины, 3D-сканеры, трекеры)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {PARTNERS_DATA.filter(p => p.category !== 'software').map((partner) => (
              <div
                key={partner.name}
                onClick={() => handleBrandClick(partner)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
                    <div className="h-8 sm:h-9 flex items-center min-w-0 flex-1 bg-white px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <BrandLogo brandId={partner.name} className="h-6 sm:h-7 max-w-[125px] sm:max-w-[150px] w-auto object-contain" />
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                      <Globe2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{partner.country}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 line-clamp-2">
                    {partner.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1 overflow-hidden h-6">
                    {partner.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 shrink-0">
                    <span>Оборудование</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Industrial Partners Trust Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-blue-900/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Нам доверяют лидеры промышленности России с 1995 года</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-slate-300 font-medium">
            <span className="text-white font-bold">АВТОВАЗ</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">РКЦ «Прогресс»</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">ОДК-Кузнецов</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">Авиастар</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">Корпорация «Иркут»</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">Уралвагонзавод</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">ОДК-УМПО</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">ПО «Старт» (Росатом)</span>
            <span className="text-blue-500">•</span>
            <span className="text-white font-bold">Роствертол</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('about')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Реестр заказчиков (20+ предприятий)</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Guarantee Compact Note */}
      <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Прямые поставки оборудования, оригинальные лицензии ПО и внесение средств измерений в реестр ФГИС «АРШИН».
          </span>
        </div>
        <button
          onClick={() => openContactModal({ 
            title: 'Запрос авторизации и сертификатов производителей',
            formType: 'consultation'
          })}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold whitespace-nowrap text-xs cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>Запросить сертификаты</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
