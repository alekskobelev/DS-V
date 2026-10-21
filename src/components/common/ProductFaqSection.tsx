import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  Check,
  Copy,
  MessageSquare,
  Info,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Product, ProductFaqItem } from '../../types';
import { getFaqByCategory, FAQ_ITEMS } from '../../data/knowledgeBase';

interface ProductFaqSectionProps {
  product?: Product | null;
  faqs?: ProductFaqItem[];
  title?: string;
  subtitle?: string;
  onAskQuestion?: () => void;
  onOrderDemo?: () => void;
  compact?: boolean;
}

export const ProductFaqSection: React.FC<ProductFaqSectionProps> = ({
  product,
  faqs: customFaqs,
  title,
  subtitle,
  onAskQuestion,
  onOrderDemo,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // First item open by default
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const items: ProductFaqItem[] = useMemo(() => {
    const list: ProductFaqItem[] = [];

    // 1. Специфичные вопросы из канонической базы знаний по идентификатору или наименованию продукта
    if (product) {
      const prodName = product.name.toLowerCase();
      const directMatches = FAQ_ITEMS.filter(
        (f) =>
          f.actionTargetId === product.id ||
          (prodName.length > 3 && f.question.toLowerCase().includes(prodName.split(' ')[0]))
      );
      directMatches.forEach(f => {
        list.push({
          question: f.question,
          answer: f.answer,
          highlight: f.highlight,
          categoryTag: f.categoryLabel,
        });
      });
    }

    // 2. Пользовательские или индивидуальные FAQ из карточки продукта
    const explicitFaqs = (customFaqs && customFaqs.length > 0) ? customFaqs : (product?.faq || []);
    explicitFaqs.forEach(ef => {
      if (!list.some(existing => existing.question.toLowerCase() === ef.question.toLowerCase())) {
        list.push(ef);
      }
    });

    // 3. Если вопросов мало (< 3) или нет, дополняем из базы знаний по типу оборудования / ПО
    if (list.length < 3 && product?.type) {
      const kbCategory = product.type === 'software' ? 'software' : 'hardware';
      const categoryFaqs = getFaqByCategory(kbCategory);
      categoryFaqs.forEach(cf => {
        if (!list.some(existing => existing.question.toLowerCase() === cf.question.toLowerCase())) {
          list.push({
            question: cf.question,
            answer: cf.answer,
            highlight: cf.highlight,
            categoryTag: cf.categoryLabel,
          });
        }
      });
    }

    return list;
  }, [customFaqs, product]);

  // Extract unique category tags
  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.categoryTag) {
        set.add(item.categoryTag);
      }
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTag = selectedTag === 'all' || item.categoryTag === selectedTag;
      if (!matchesTag) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.highlight && item.highlight.toLowerCase().includes(q))
      );
    });
  }, [items, selectedTag, searchQuery]);

  const toggleItem = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const expandAll = () => {
    setOpenIndexes(filteredItems.map((_, i) => i));
  };

  const collapseAll = () => {
    setOpenIndexes([]);
  };

  const handleCopy = (text: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (items.length === 0) {
    return null;
  }

  const sectionTitle = title || (product ? `Часто задаваемые вопросы по ${product.name}` : 'Часто задаваемые технические вопросы');
  const sectionSubtitle =
    subtitle ||
    'Ответы на ключевые технические вопросы, стандарты совместимости, форматы обмена данными и требования к оборудованию.';

  return (
    <div
      id="product-faq-section"
      className={`rounded-xl border transition-all ${
        compact
          ? 'bg-slate-50/80 border-slate-200 p-5 sm:p-6'
          : 'bg-gradient-to-b from-slate-900/95 to-slate-900 text-white border-blue-900/40 p-6 sm:p-8 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>База инженерных ответов (FAQ)</span>
          </div>
          <h3
            className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              compact ? 'text-gray-900' : 'text-white'
            }`}
          >
            {sectionTitle}
          </h3>
          <p
            className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${
              compact ? 'text-slate-500' : 'text-slate-300'
            }`}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Action button in header */}
        <div className="flex items-center gap-2 shrink-0">
          {onAskQuestion && (
            <button
              onClick={onAskQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Задать свой вопрос</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter bar */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросу или ключевому слову (G-код, RTCP, Parasolid, GD&T, STEP, PTB)..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:outline-hidden transition-all ${
                compact
                  ? 'bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
                  : 'bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Очистить
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                compact
                  ? 'bg-gray-200 hover:bg-gray-300 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Развернуть все
            </button>
            <button
              onClick={collapseAll}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                compact
                  ? 'bg-gray-200 hover:bg-gray-300 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Свернуть все
            </button>
          </div>
        </div>

        {/* Tags filter if available */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTag === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : compact
                  ? 'bg-white border border-gray-200 text-slate-500 hover:bg-gray-100'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Все темы ({items.length})
            </button>
            {tags.map((t) => {
              const count = items.filter((i) => i.categoryTag === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-4 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTag === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : compact
                      ? 'bg-white border border-gray-200 text-slate-500 hover:bg-gray-100'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion list */}
      <div className="mt-5 space-y-3">
        {filteredItems.length === 0 ? (
          <div
            className={`p-6 text-center rounded-xl border border-dashed ${
              compact
                ? 'border-gray-300 text-gray-500 bg-white'
                : 'border-slate-700 text-slate-400 bg-slate-800/40'
            }`}
          >
            <p className="text-sm">По вашему запросу вопросов не найдено.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
              }}
              className="mt-2 text-xs text-blue-500 hover:underline font-semibold"
            >
              Сбросить фильтры поиска
            </button>
          </div>
        ) : (
          filteredItems.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? compact
                      ? 'bg-white border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-slate-800 border-blue-500/60 shadow-lg ring-1 ring-blue-500/30'
                    : compact
                    ? 'bg-white/80 border-gray-200 hover:border-gray-300'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Question Row */}
                <div
                  onClick={() => toggleItem(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleItem(idx);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                        isOpen
                          ? 'bg-blue-600 text-white'
                          : compact
                          ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                          : 'bg-slate-700 text-blue-300 group-hover:bg-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      {faq.categoryTag && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                            compact
                              ? 'bg-gray-100 text-slate-500 border border-gray-200'
                              : 'bg-slate-700 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {faq.categoryTag}
                        </span>
                      )}
                      <h4
                        className={`text-sm sm:text-base font-bold transition-colors leading-snug break-words ${
                          isOpen
                            ? compact
                              ? 'text-blue-900'
                              : 'text-white'
                            : compact
                            ? 'text-gray-900 group-hover:text-blue-700'
                            : 'text-slate-100 group-hover:text-blue-300'
                        }`}
                      >
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(`${faq.question}\n\n${faq.answer}`, idx, e)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        compact
                          ? 'text-gray-400 hover:text-slate-500 hover:bg-gray-100'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Скопировать вопрос и ответ"
                    >
                      {copiedId === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Answer Content */}
                {isOpen && (
                  <div
                    className={`px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t transition-all ${
                      compact
                        ? 'border-gray-100 text-slate-500'
                        : 'border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-3 pt-2">
                      {faq.answer}
                    </div>

                    {/* Highlight Box if present */}
                    {faq.highlight && (
                      <div
                        className={`mt-3 p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                          compact
                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                        }`}
                      >
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 leading-relaxed font-medium">
                          <strong>Важно:</strong> {faq.highlight}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Banner */}
      <div
        className={`mt-6 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          compact
            ? 'border-gray-200 text-slate-500'
            : 'border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Все ответы верифицированы ведущими инженерами ДС‑Инжиниринг</span>
        </div>

        <div className="flex items-center gap-3">
          {onOrderDemo && (
            <button
              onClick={onOrderDemo}
              className="text-amber-500 hover:text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Заказать живую онлайн-демонстрацию</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onAskQuestion && (
            <button
              onClick={onAskQuestion}
              className="text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Задать технический вопрос</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
