import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  FileCheck2,
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  Clock,
  X,
  Zap,
  Microscope,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CASE_STUDIES } from '../../data/mockData';

export const CasesGallerySection: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [activeCaseModal, setActiveCaseModal] = useState<typeof CASE_STUDIES[0] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lock body scroll when modal is open to prevent background scrolling & block clipping
  useEffect(() => {
    if (activeCaseModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [activeCaseModal]);

  const industries = ['all', ...Array.from(new Set(CASE_STUDIES.map(c => c.clientIndustry)))];

  const filteredCases = selectedIndustry === 'all' 
    ? CASE_STUDIES 
    : CASE_STUDIES.filter(c => c.clientIndustry === selectedIndustry);

  return (
    <div className="space-y-8">
      {/* Section Header with NDA notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6 sm:pt-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full mb-2 uppercase tracking-wider border border-blue-200/80 shadow-xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Инженерное портфолио</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Примеры выполненных работ и проектов
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Реальные производственные кейсы: от оцифровки лопаток авиадвигателей до настройки постпроцессоров для парка 18 станков с ЧПУ
          </p>
        </div>

        {/* NDA Disclaimer Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 shadow-2xs self-start md:self-auto">
          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Конфиденциальность:</strong> Материалы публикуются с соблюдением требований NDA заказчиков
          </span>
        </div>
      </div>

      {/* Industry Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-200 pb-4">
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() => setSelectedIndustry(ind)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedIndustry === ind
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {ind === 'all' ? 'Все отрасли' : ind}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredCases.map((cs, idx) => (
          <motion.div
            key={cs.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-blue-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Image Container */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={cs.image}
                  alt={cs.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs border border-white/20">
                  {cs.clientIndustry}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold leading-tight line-clamp-2">
                  {cs.title}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-0.5">
                    Было (проблема производства):
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cs.task}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Стало (результат «ДС-Инжиниринг»):
                  </span>
                  <div className="flex items-start gap-1.5 text-xs text-slate-800 font-medium line-clamp-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{cs.results[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveCaseModal(cs)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
              >
                Детали проекта →
              </button>
              <button
                onClick={() => openContactModal({
                  title: `Заявка по аналогии: ${cs.title}`,
                  formType: 'consultation'
                })}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                Аналогичный проект
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Case Details Modal: Rendered via Portal at document.body with z-[9999] so it can never be overlapped by sibling sections or widgets */}
      {activeCaseModal && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveCaseModal(null);
            }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`${isFullscreen ? 'fixed inset-0 z-[10000] w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-4xl w-full h-auto max-h-[92vh] rounded-2xl'} bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
          >
            {/* Header: Clean, high-contrast, non-overlapping with clear controls */}
            <div className="p-4 sm:p-5 bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[11px] font-bold rounded-full">
                    {activeCaseModal.clientIndustry}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    {activeCaseModal.year} г.
                  </span>
                  {activeCaseModal.timeline && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-400/30">
                      <Clock className="w-3 h-3" />
                      {activeCaseModal.timeline}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {activeCaseModal.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
                  className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 active:bg-white/30 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCaseModal(null)}
                  aria-label="Закрыть"
                  className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 active:bg-white/30 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with full engineering information */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm flex-1">
              {/* Photo Showcase & Key Metric Badges */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs">
                  <img
                    src={activeCaseModal.image}
                    alt={activeCaseModal.title}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </div>

                <div className="md:col-span-6 space-y-2.5">
                  {/* NDA Notice */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-950 dark:text-amber-100">Режим строгой конфиденциальности (NDA)</div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight mt-0.5">
                        {activeCaseModal.customerScope || 'Проект выполнен в соответствии с соглашением о неразглашении конфиденциальной информации.'}
                      </p>
                    </div>
                  </div>

                  {/* Accuracy & Metrology Spec */}
                  {activeCaseModal.accuracy && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2">
                      <Microscope className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-blue-900 dark:text-blue-100">Метрологический класс точности:</div>
                        <div className="text-[11px] text-blue-800 dark:text-blue-300 font-mono mt-0.5">{activeCaseModal.accuracy}</div>
                      </div>
                    </div>
                  )}

                  {/* Economic Effect */}
                  {activeCaseModal.economicEffect && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-100">Экономический и производственный эффект:</div>
                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">{activeCaseModal.economicEffect}</div>
                      </div>
                    </div>
                  )}

                  {/* Specialists / Team */}
                  {activeCaseModal.specialists && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
                      <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-indigo-900 dark:text-indigo-100">Инженерно-экспертная группа проекта:</div>
                        <div className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5">{activeCaseModal.specialists}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 1. Исходная проблема производства (Было) */}
              <div>
                <strong className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  1. Исходная производственная задача (Было):
                </strong>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm bg-red-50/70 dark:bg-red-950/30 p-3.5 rounded-xl border border-red-200/80 dark:border-red-900/50">
                  {activeCaseModal.task}
                </p>
              </div>

              {/* 2. Инженерное решение ДС-Инжиниринг */}
              <div>
                <strong className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  2. Инженерно-метрологическое решение «ДС‑Инжиниринг»:
                </strong>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50">
                  {activeCaseModal.solution}
                </p>
              </div>

              {/* 3. Подтвержденные результаты */}
              <div>
                <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  3. Подтвержденные результаты и метрики качества:
                </strong>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCaseModal.results.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Переданные заказчику артефакты и КД */}
              {activeCaseModal.deliverables && activeCaseModal.deliverables.length > 0 && (
                <div>
                  <strong className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    4. Переданные заказчику артефакты и документация:
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCaseModal.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 bg-indigo-50/40 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Оборудование и ПО */}
              <div>
                <strong className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  5. Примененные средства измерений, КИМ и программное обеспечение:
                </strong>
                <div className="flex flex-wrap gap-2">
                  {activeCaseModal.equipmentSoftware.map((eq, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold shadow-2xs">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* 6. Стандарты */}
              {activeCaseModal.standards && activeCaseModal.standards.length > 0 && (
                <div>
                  <strong className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    6. Нормативная база и стандарты контроля:
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCaseModal.standards.map((std, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono">
                        {std}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Actions */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Требуется решение аналогичной инженерной задачи для вашего предприятия?
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveCaseModal(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const title = activeCaseModal.title;
                    setActiveCaseModal(null);
                    openContactModal({
                      title: `Заявка по аналогии: ${title}`,
                      formType: 'consultation'
                    });
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold rounded-lg text-xs transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Заказать аналогичный проект</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
