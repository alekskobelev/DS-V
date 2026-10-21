import React from 'react';
import { Zap, FileText, Layers, Info } from 'lucide-react';
import { DetailLevel } from '../../../types/proposalEditor';

interface DetailLevelSelectorProps {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
  className?: string;
  showDescriptions?: boolean;
}

export const DetailLevelSelector: React.FC<DetailLevelSelectorProps> = ({
  value,
  onChange,
  className = '',
  showDescriptions = false
}) => {
  const normalizedValue = value === 'engineering_opk' ? 'complex_project' : value;

  const options: Array<{
    id: DetailLevel;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string;
    bgActive: string;
    borderActive: string;
    textActive: string;
    badge: string;
    description: string;
  }> = [
    {
      id: 'express',
      label: 'Экспресс (Счет-КП)',
      shortLabel: 'Экспресс',
      icon: Zap,
      color: 'text-amber-700 dark:text-amber-400',
      bgActive: 'bg-amber-100 dark:bg-amber-950/70',
      borderActive: 'border-amber-500 dark:border-amber-600',
      textActive: 'text-amber-950 dark:text-amber-100',
      badge: '1 стр.',
      description: 'Быстрый счет/КП за 30 секунд: базовые реквизиты, спецификация, расчет НДС 22% без опросных листов ТЗ.'
    },
    {
      id: 'standard',
      label: 'Стандарт (ТКП)',
      shortLabel: 'Стандарт ТКП',
      icon: FileText,
      color: 'text-blue-700 dark:text-blue-400',
      bgActive: 'bg-blue-100 dark:bg-blue-950/80',
      borderActive: 'border-blue-500 dark:border-blue-600',
      textActive: 'text-blue-950 dark:text-blue-100',
      badge: '1–2 стр.',
      description: 'Официальное ТКП: автозаполнение DaData, спецификация с артикулами, условия оплаты/поставки, гарантия и подписант.'
    },
    {
      id: 'complex_project',
      label: 'Комплексный проект (ТКП + Листы ТЗ)',
      shortLabel: 'ТКП + Листы ТЗ',
      icon: Layers,
      color: 'text-emerald-700 dark:text-emerald-400',
      bgActive: 'bg-emerald-100 dark:bg-emerald-950/70',
      borderActive: 'border-emerald-500 dark:border-emerald-600',
      textActive: 'text-emerald-950 dark:text-emerald-100',
      badge: 'Пакет + ТЗ',
      description: 'Коммерческое предложение + отдельные листы Технических заданий (ТЗ) на измерения/сканирование с допусками IT5–IT12 и GD&T.'
    }
  ];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner gap-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = normalizedValue === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? `${opt.bgActive} ${opt.borderActive} ${opt.textActive} border shadow-xs`
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80 border border-transparent'
              }`}
              title={opt.description}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? opt.color : 'text-slate-600 dark:text-slate-400'}`} />
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                isActive 
                  ? 'bg-white/90 dark:bg-black/50 text-slate-900 dark:text-white border border-slate-300/80 dark:border-slate-700 font-extrabold' 
                  : 'bg-slate-300/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
              }`}>
                {opt.badge}
              </span>
            </button>
          );
        })}
      </div>

      {showDescriptions && (
        <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            {options.find(o => o.id === normalizedValue)?.description}
          </span>
        </div>
      )}
    </div>
  );
};
