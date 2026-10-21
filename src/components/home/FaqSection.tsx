import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  MessageSquare, 
  Phone, 
  ArrowRight, 
  Info,
  Layers, 
  Box, 
  Wrench, 
  Cpu, 
  Share2,
  Check,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useJsonLdFaq } from '../../hooks/useJsonLdFaq';
import { COMPANY_INFO } from '../../data/mockData';
import { FAQ_ITEMS } from '../../data/knowledgeBase';
import { FaqItem } from '../../types';

export const FaqSection: React.FC = () => {
  const { navigateTo, openContactModal, showToast } = useApp();
  const { faqItems: hookFaqItems } = useJsonLdFaq();
  const faqItems = hookFaqItems && hookFaqItems.length > 0 ? hookFaqItems : FAQ_ITEMS;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(() => {
    // По умолчанию раскрываем первый вопрос
    return faqItems.length > 0 ? [faqItems[0].id] : ['faq-01'];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Динамическое формирование списка категорий на основе реально присутствующих в схеме элементов
  const categories = useMemo(() => {
    const list: Array<{ id: string; label: string; icon: React.FC<{ className?: string }>; count: number }> = [
      { id: 'all', label: 'Все вопросы', icon: HelpCircle, count: faqItems.length }
    ];

    const categoryMap: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
      software: { label: 'Инженерное ПО (CAD/CAM)', icon: Layers },
      hardware: { label: 'Оборудование КИМ', icon: Box },
      metrology: { label: 'Метрологическая экспертиза', icon: CheckCircle2 },
      services: { label: '3D-сканирование и реверс', icon: Wrench },
      postprocessors: { label: 'Постпроцессоры ЧПУ', icon: Cpu },
      training: { label: 'Консультации', icon: HelpCircle }
    };

    const counts: Record<string, number> = {};
    faqItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    Object.keys(counts).forEach((catId) => {
      const meta = categoryMap[catId] || { label: catId, icon: HelpCircle };
      list.push({
        id: catId,
        label: meta.label,
        icon: meta.icon,
        count: counts[catId]
      });
    });

    return list;
  }, [faqItems]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenIds(faqItems.map((item) => item.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        (item.highlight && item.highlight.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  const handleActionClick = (faq: FaqItem) => {
    if (!faq.actionPage) {
      openContactModal({ title: `Вопрос по теме: ${faq.question}`, formType: 'question' });
      return;
    }

    if (faq.actionPage === 'contacts') {
      navigateTo('contacts');
    } else if (faq.actionPage === 'calculator') {
      navigateTo('services', 'calculator');
    } else if (faq.actionPage === 'software') {
      navigateTo('software', faq.actionTargetId);
    } else if (faq.actionPage === 'hardware') {
      navigateTo('hardware', faq.actionTargetId);
    } else if (faq.actionPage === 'services') {
      navigateTo('services', faq.actionTargetId);
    }
  };

  const handleCopyQuestionLink = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${faq.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(faq.id);
        showToast('Прямая ссылка на вопрос скопирована в буфер обмена');
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      showToast('Ссылка: ' + url);
    }
  };

  return (
    <section 
      id="section-faq" 
      aria-labelledby="faq-main-heading" 
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 snap-section scroll-mt-24 pt-4 sm:pt-6"
    >
      <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800 p-5 sm:p-8 lg:p-10 shadow-xs">
        {/* Заголовок секции */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-800 rounded-full text-xs font-semibold text-blue-900 dark:text-blue-300 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>База знаний инженера</span>
          </div>

          <h2 id="faq-main-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Часто задаваемые вопросы и технические ответы
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Официальные ответы ведущих инженеров «ДС‑Инжиниринг» по возможностям сквозной системы TopSolid 7, метрологическому софту PolyWorks, 3D-сканированию, КИМ и постпроцессорам.
          </p>
        </div>

        {/* Панель поиска и фильтрации */}
        <div className="bg-white dark:bg-slate-950/90 rounded-xl border border-slate-300 dark:border-slate-800 p-4 sm:p-5 shadow-xs mb-6 sm:mb-8 space-y-4">
          {/* Поле быстрого поиска */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросу: TopSolid, PolyWorks, КИМ, точность сканирования, ЧПУ..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                Очистить
              </button>
            )}
          </div>

          {/* Категории и переключатели разворота */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-blue-800 dark:bg-blue-800 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-slate-400 shrink-0 select-none">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
              >
                Развернуть все
              </button>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
              >
                Свернуть все
              </button>
            </div>
          </div>
        </div>

        {/* Список вопросов и ответов (Аккордеон) */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white dark:bg-slate-950/90 rounded-xl border border-slate-300 dark:border-slate-800 p-8 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">По вашему запросу вопросов не найдено</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Попробуйте изменить формулировку поискового запроса или обратитесь напрямую к инженеру «ДС‑Инжиниринг».
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`bg-white dark:bg-slate-950/90 rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
                  }`}
                >
                  {/* Заголовок вопроса */}
                  <div className="w-full p-4 sm:p-5 flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleItem(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      className="flex-1 text-left group cursor-pointer space-y-1.5 min-w-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                          {faq.categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {faq.question}
                      </h3>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyQuestionLink(faq, e)}
                        title="Скопировать ссылку на этот вопрос"
                        aria-label="Скопировать ссылку на этот вопрос"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedId === faq.id ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleItem(faq.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Свернуть ответ" : "Развернуть ответ"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 cursor-pointer ${
                          isOpen ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Развернутый ответ с анимацией */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        role="region"
                        aria-labelledby={faq.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                          <p className="leading-relaxed text-slate-800 dark:text-slate-200 text-[13px] sm:text-sm">
                            {faq.answer}
                          </p>

                          {/* Ключевой инженерный вывод */}
                          {faq.highlight && (
                            <div className="p-3.5 bg-blue-50/90 dark:bg-blue-950/50 border-l-4 border-blue-600 dark:border-blue-400 rounded-r-xl text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5 shadow-2xs">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed font-medium">{faq.highlight}</span>
                            </div>
                          )}

                          {/* Кнопки целевых действий */}
                          <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => openContactModal({ title: `Вопрос по теме: ${faq.question}`, formType: 'question' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Уточнить у инженера</span>
                            </button>

                            {faq.actionText && (
                              <button
                                type="button"
                                onClick={() => handleActionClick(faq)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                              >
                                <span>{faq.actionText}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Нижний блок прямой связи с инженером */}
        <div className="mt-8 sm:mt-10 bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl p-5 sm:p-7 text-slate-900 dark:text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Индивидуальный инженерный консалтинг</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Не нашли ответ на ваш производственный вопрос?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Дежурные инженеры «ДС‑Инжиниринг» ответят в течение 15 минут: поможем подобрать конфигурацию TopSolid 7, методику 3D-контроля в PolyWorks или станок под постпроцессор.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs"
            >
              <Phone className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              <span className="font-mono">{COMPANY_INFO.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => openContactModal({ title: 'Задать технический вопрос инженеру', formType: 'question' })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-extrabold rounded-xl text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Задать вопрос эксперту</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
