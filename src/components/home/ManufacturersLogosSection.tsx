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
    <div className="space-y-4">
      {/* Header Block - Compact & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pt-6 sm:pt-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200/80 dark:border-blue-800 mb-2 shadow-xs">
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Официальные производители оборудования и ПО</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Бренды мирового уровня и партнерская сеть
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md text-left sm:text-right leading-relaxed">
          Прямые поставки оборудования, лицензионного софта и сертифицированное внедрение
        </p>
      </div>

      {/* 2 Dedicated Groups: Software Systems and Measurement Hardware */}
      <div className="space-y-6">
        {/* Group 1: Software Systems */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Программные комплексы (CAD / CAM / CAE / Метрология)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {PARTNERS_DATA.filter(p => p.category === 'software').map((partner) => (
              <div
                key={partner.name}
                onClick={() => handleBrandClick(partner)}
                className="group relative bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-300 dark:border-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-700/60">
                    <div className="h-9 flex items-center">
                      <BrandLogo brandId={partner.name} className="h-8 max-w-[170px] w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 shrink-0">
                      <Globe2 className="w-3 h-3 text-slate-400" />
                      <span>{partner.country}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 line-clamp-2">
                    {partner.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700/40">
                  <div className="flex flex-wrap gap-1.5 overflow-hidden h-6">
                    {partner.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 shrink-0">
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
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-amber-500"></span>
            <span>Измерительное оборудование и КИМ (Координатные машины, 3D-сканеры, трекеры)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {PARTNERS_DATA.filter(p => p.category !== 'software').map((partner) => (
              <div
                key={partner.name}
                onClick={() => handleBrandClick(partner)}
                className="group relative bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-300 dark:border-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-blue-600 dark:hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-700/60">
                    <div className="h-9 flex items-center">
                      <BrandLogo brandId={partner.name} className="h-8 max-w-[170px] w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 shrink-0">
                      <Globe2 className="w-3 h-3 text-slate-400" />
                      <span>{partner.country}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 line-clamp-2">
                    {partner.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700/40">
                  <div className="flex flex-wrap gap-1.5 overflow-hidden h-6">
                    {partner.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-amber-400 group-hover:text-blue-800 dark:group-hover:text-amber-300 shrink-0">
                    <span>Оборудование</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Guarantee Compact Note */}
      <div className="bg-slate-50 dark:bg-slate-900/80 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
