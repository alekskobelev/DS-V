import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Box, 
  Wrench, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronRight, 
  ArrowRight, 
  ExternalLink, 
  SlidersHorizontal, 
  Sparkles, 
  Info, 
  Bookmark,
  Share2,
  X,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { 
  ENGINEERING_GLOSSARY_TERMS, 
  GLOSSARY_CATEGORIES, 
  GlossaryTerm, 
  getGlossaryAlphabet,
  searchGlossaryTerms 
} from '../data/engineeringGlossary';
import { copyToClipboard } from '../utils/clipboard';

export const GlossaryPage: React.FC = () => {
  const { navigateTo, openContactModal, showToast } = useApp();

  useSEO({
    title: 'Технический глоссарий: GD&T, ISO 1101, КИМ, постпроцессоры и CAD/CAM | ДС‑Инжиниринг',
    description: 'Инженерный глоссарий терминов метрологии, координатных измерений и станков с ЧПУ: GD&T, ISO 1101, кинематическая модель станка, постпроцессор, B-Rep, NURBS, MPE, RTCP, Leapfrog.',
    keywords: 'технический глоссарий, GD&T, ISO 1101, кинематическая модель станка, постпроцессор, B-Rep, NURBS, MPE, RTCP, Leapfrog, FAI, координатные измерения, САПР термины, ДС‑Инжиниринг'
  });

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const alphabet = useMemo(() => getGlossaryAlphabet(), []);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return searchGlossaryTerms(query, selectedCategory, selectedLetter);
  }, [query, selectedCategory, selectedLetter]);

  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleCopyTerm = async (term: GlossaryTerm, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${term.term} (${term.termRu}${term.termEn ? ' / ' + term.termEn : ''})\n\nОпределение:\n${term.shortDefinition}\n\nПодробно:\n${term.fullDescription}\n\nСтандарты: ${term.keyStandards.join(', ')}\n\nПрименение «ДС-Инжиниринг»:\n${term.practicalApplication}\n\nИсточник: Технический глоссарий «ДС-Инжиниринг» (https://ds-engineering.ru/glossary)`;
    await copyToClipboard(text);
    setCopiedId(term.id);
    showToast(`Определение «${term.term}» скопировано в буфер`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gdt_standards':
        return <Target className="w-4 h-4 text-amber-500" />;
      case 'metrology_cmm':
        return <Box className="w-4 h-4 text-blue-500" />;
      case 'cnc_postprocessors':
        return <Cpu className="w-4 h-4 text-purple-500" />;
      case 'cad_cam':
        return <Layers className="w-4 h-4 text-emerald-500" />;
      case 'reverse_scanning':
        return <Wrench className="w-4 h-4 text-cyan-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Хлебные крошки" className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2">
        <button 
          onClick={() => navigateTo('home')} 
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          Главная
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button 
          onClick={() => navigateTo('knowledge')} 
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          База знаний
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-medium">Технический глоссарий</span>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Инженерный справочник терминов и стандартов</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Технический глоссарий инженера и метролога
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Формализованные определения терминов геометрических допусков (GD&T, ISO 1101), кинематики станков с ЧПУ, постпроцессоров, 3D-метрологии и CAD/CAM/PDM систем. Разработано ведущими инженерами-технологами «ДС-Инжиниринг».
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-white/10 rounded-md font-mono text-amber-300">
              {ENGINEERING_GLOSSARY_TERMS.length} базовых понятий
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md text-slate-200">
              Стандарты ISO, ASME, ГОСТ Р
            </span>
          </div>
        </div>

        {/* Quick Action in Header */}
        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => openContactModal({ title: 'Вопрос по метрологическим стандартам и GD&T', formType: 'question' })}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
          >
            Задать вопрос метрологу
          </button>
          <button
            onClick={() => navigateTo('knowledge')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            ← Вся база знаний
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по термину, аббревиатуре, стандарту или определению (например: GD&T, ISO 1101, кинематика, постпроцессор, КЛТР)..."
            className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Очистить поиск"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GLOSSARY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedLetter('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Alphabet Index Filter */}
        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">Алфавит:</span>
          <button
            onClick={() => setSelectedLetter('')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
              selectedLetter === ''
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Все
          </button>
          {alphabet.map((letter) => {
            const isActive = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(isActive ? '' : letter)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Найдено терминов: <strong className="font-bold text-slate-900 dark:text-white font-mono">{filteredTerms.length}</strong>
        </span>
        {(query || selectedCategory !== 'all' || selectedLetter) && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
              setSelectedLetter('');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Glossary Cards Grid */}
      {filteredTerms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">По вашему запросу терминов не найдено</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Попробуйте изменить формулировку поиска или задать вопрос инженерам метрологического отдела.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
              setSelectedLetter('');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Показать все термины
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            return (
              <div
                key={term.id}
                id={`term-${term.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Badge, Term Name & Copy Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {getCategoryIcon(term.category)}
                          <span>{term.categoryLabel}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                          [{term.letter}]
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span>{term.term}</span>
                      </h2>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {term.termRu}
                        {term.termEn && <span className="text-slate-400 dark:text-slate-500 font-normal"> • {term.termEn}</span>}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleCopyTerm(term, e)}
                      title="Скопировать формулировку термина"
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedId === term.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Short Crisp Definition */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                    {term.shortDefinition}
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <strong className="text-slate-900 dark:text-white block mb-1 text-[11px] uppercase tracking-wider font-mono">
                          Инженерное пояснение и физический смысл:
                        </strong>
                        <p>{term.fullDescription}</p>
                      </div>

                      {term.exampleSymbols && term.exampleSymbols.length > 0 && (
                        <div>
                          <strong className="text-slate-900 dark:text-white block mb-1 text-[11px] uppercase tracking-wider font-mono">
                            Обозначения и символы на чертеже:
                          </strong>
                          <div className="flex flex-wrap gap-1.5">
                            {term.exampleSymbols.map((sym, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[11px] font-mono"
                              >
                                {sym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50">
                        <strong className="text-blue-900 dark:text-blue-300 block mb-0.5 text-[11px] font-semibold">
                          Применение в практике «ДС-Инжиниринг»:
                        </strong>
                        <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                          {term.practicalApplication}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Standards Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mr-1">Стандарты:</span>
                    {term.keyStandards.map((std, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {std}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Expand Toggle & Context Link */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                  <button
                    onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Свернуть описание' : 'Подробный технический анализ'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {term.actionLink && (
                    <button
                      onClick={() => navigateTo(term.actionLink!.page, term.actionLink!.detailId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{term.actionLink.text}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Engineering Consultation Card */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Инженерный аудит чертежей и допусков</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Требуется метрологическая экспертиза конструкторской документации или подбор баз?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Инженеры «ДС-Инжиниринг» выполняют анализ технологичности чертежей по стандартам ISO 1101 и ASME Y14.5, настраивают RPS-базирование для КИМ и разрабатывают индивидуальные постпроцессоры с кинематической защитой от столкновений.
          </p>
        </div>

        <button
          onClick={() => openContactModal({ title: 'Запрос на метрологический аудит чертежей (GD&T)', formType: 'service' })}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          Заказать экспертизу чертежа
        </button>
      </div>
    </div>
  );
};
