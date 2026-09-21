import React from 'react';
import { Layers, Cpu, ShieldCheck, Workflow, Box } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SoftwareCategoryNavProps {
  currentCategory: string; // 'all' | 'topsolid' | 'polyworks' | 'geomagic' | 'shining3d-sw'
}

export const SOFTWARE_FAMILIES = [
  {
    id: 'all',
    title: 'Все программы',
    badge: 'Каталог ПО',
    icon: Layers,
    desc: 'Полный каталог CAD/CAM/PDM и метрологического софта'
  },
  {
    id: 'topsolid',
    title: 'TopSolid 7',
    badge: 'Сквозная CAD/CAM/PDM',
    icon: Cpu,
    desc: 'Сквозное проектирование, PDM и ЧПУ 2D–5D'
  },
  {
    id: 'polyworks',
    title: 'PolyWorks',
    badge: '3D-Метрология',
    icon: ShieldCheck,
    desc: 'Контроль точности геометрии и КИМ'
  },
  {
    id: 'geomagic',
    title: 'Geomagic',
    badge: 'Реверс и контроль',
    icon: Workflow,
    desc: 'Design X & Control X по сканам'
  },
  {
    id: 'shining3d-sw',
    title: 'ПО Shining 3D',
    badge: '3D-сканирование',
    icon: Box,
    desc: 'EXModel Pro и SHINING 3D Inspect'
  },
];

export const SoftwareCategoryNav: React.FC<SoftwareCategoryNavProps> = ({
  currentCategory,
}) => {
  const { navigateTo } = useApp();

  const handleSelectFamily = (catId: string) => {
    navigateTo('software', catId === 'all' ? undefined : catId);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {SOFTWARE_FAMILIES.map((fam) => {
          const Icon = fam.icon;
          const isActive = currentCategory === fam.id;
          
          return (
            <button
              key={fam.id}
              onClick={() => handleSelectFamily(fam.id)}
              className={`relative flex flex-col p-3.5 sm:p-4 text-left rounded-xl transition-all cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 border-blue-500 shadow-md text-white ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xs text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                <div className={`p-2 rounded-xl ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className={`font-bold text-xs sm:text-sm mb-0.5 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {fam.title}
              </h3>
              <p className={`text-[11px] leading-tight line-clamp-1 ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {fam.badge}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

