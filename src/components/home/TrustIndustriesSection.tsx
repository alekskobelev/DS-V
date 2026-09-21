import React from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Cpu, 
  Plane, 
  Flame, 
  Truck, 
  Wrench
} from 'lucide-react';
import { motion } from 'motion/react';

const INDUSTRIES = [
  {
    icon: Plane,
    name: 'Авиационно-космический комплекс',
    desc: 'Контроль геометрии лопаток, элементов планера, стапельной оснастки и оцифровка сложных отливок',
  },
  {
    icon: Flame,
    name: 'Двигателестроение и турбины',
    desc: 'Высокоточный контроль колес, моноколес (блисков), корпусных деталей с допусками в единицы микрон',
  },
  {
    icon: ShieldCheck,
    name: 'Оборонно-промышленный комплекс',
    desc: 'Соблюдение требований ГОСТ, строгая конфиденциальность и работа по утвержденным методикам контроля',
  },
  {
    icon: Truck,
    name: 'Транспорт и машиностроение',
    desc: 'Оцифровка штамповой оснастки, корпусов редукторов, крупногабаритных рам и узлов спецтехники',
  },
  {
    icon: Cpu,
    name: 'Приборостроение и электроника',
    desc: 'Микроизмерения прецизионных контактов, корпусных элементов и литьевых пресс-форм',
  },
  {
    icon: Wrench,
    name: 'Инструментальное производство',
    desc: 'Разработка постпроцессоров, многоосевая ЧПУ обработка и контроль износа режущего инструмента',
  },
];

export const TrustIndustriesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Блок отраслевой экспертизы */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10 mt-6 sm:mt-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full mb-3 uppercase tracking-wider border border-blue-200/80 dark:border-blue-800 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Отраслевая экспертиза</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Отрасли применения инженерных решений <span className="whitespace-nowrap">«ДС‑Инжиниринг»</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            Внедряем CAD/CAM комплексы и метрологическое оборудование на ведущих машиностроительных и оборонных предприятиях России
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 border border-slate-300 dark:border-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {ind.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {ind.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
