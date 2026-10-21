import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Search,
  Terminal,
  Layers,
  Box,
  Wrench,
  HelpCircle,
  ChevronRight,
  FileText,
  Video,
  Code,
  ExternalLink,
  CheckCircle2,
  Copy,
  Clock,
  Calendar,
  Info,
  ArrowRight,
  ShieldCheck,
  X,
  LifeBuoy,
  Share2,
  Filter,
} from "lucide-react";
import { KnowledgeItem, FaqItem, FaqCategoryGroup } from "../types";
import { FAQ_ITEMS, FAQ_GROUPS } from "../data/knowledgeBase";
import { ENGINEERING_GLOSSARY_TERMS } from "../data/engineeringGlossary";
import { useApp } from "../context/AppContext";
import { useSEO } from "../hooks/useSEO";
import { Scrollspy } from "../components/common/Scrollspy";

export const KnowledgeBasePage: React.FC = () => {
  const {
    knowledgeBase,
    openContactModal,
    customPages,
    selectedKnowledgeItem,
    setSelectedKnowledgeItem,
    selectedKnowledgeCategory,
    setSelectedKnowledgeCategory,
    navigateTo,
  } = useApp();
  const cmsPage = customPages.find(p => p.id === 'knowledge');
  
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || "Инженерная база знаний и руководства | ДС‑Инжиниринг",
    description: cmsPage?.metaDescription || cmsPage?.description || "Технические статьи, руководства и обучающие материалы по CAD/CAM/PDM TopSolid 7, PolyWorks, Geomagic, 3D-сканированию, КИМ и разработке постпроцессоров ЧПУ.",
    keywords: cmsPage?.metaKeywords?.join(', ') || "база знаний TopSolid, руководство PolyWorks, настройка 3D сканера, калибровка КИМ, постпроцессоры ЧПУ, реверс-инжиниринг, уроки Geomagic, FAQ 3d моделирование",
  });
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>(selectedKnowledgeCategory || "all");
  const [activeArticle, setActiveArticle] = useState<KnowledgeItem | null>(
    selectedKnowledgeItem || null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);

  // Synchronize when breadcrumbs or external navigation changes
  useEffect(() => {
    if (selectedKnowledgeCategory && selectedKnowledgeCategory !== selectedCat) {
      setSelectedCat(selectedKnowledgeCategory);
    } else if (!selectedKnowledgeCategory && selectedCat !== 'all' && !selectedKnowledgeItem) {
      setSelectedCat('all');
    }
  }, [selectedKnowledgeCategory]);

  useEffect(() => {
    if (selectedKnowledgeItem !== activeArticle) {
      setActiveArticle(selectedKnowledgeItem);
    }
  }, [selectedKnowledgeItem]);

  const handleSelectArticle = (item: KnowledgeItem | null) => {
    setActiveArticle(item);
    setSelectedKnowledgeItem(item);
    if (item && item.category) {
      setSelectedCat(item.category);
      setSelectedKnowledgeCategory(item.category);
    }
  };

  const handleSelectCategory = (catId: string) => {
    if (catId === 'glossary') {
      navigateTo('glossary');
      return;
    }
    setSelectedCat(catId);
    setSelectedKnowledgeCategory(catId === 'all' ? null : catId);
    setActiveArticle(null);
    setSelectedKnowledgeItem(null);
  };

  useEffect(() => {
    if (activeArticle && detailRef.current) {
      const y =
        detailRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [activeArticle]);

  useEffect(() => {
    if (activeArticle) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleSelectArticle(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeArticle]);

  const categories = [
    { id: "all", label: "Все материалы", icon: BookOpen },
    { id: "software", label: "Программное обеспечение", icon: Layers },
    { id: "hardware", label: "Метрологическое оборудование", icon: Box },
    { id: "services", label: "Услуги и методики", icon: Wrench },
    {
      id: "postprocessors",
      label: "Разработка постпроцессоров",
      icon: Terminal,
    },
    { id: "glossary", label: "Технический глоссарий", icon: FileText },
    { id: "faq", label: "Частые вопросы (FAQ)", icon: HelpCircle },
  ];

  const categoryMap: Record<string, string[]> = {
    software: ["software", "ПО", "Программное обеспечение"],
    hardware: ["hardware", "Оборудование", "Метрологическое оборудование", "metrology", "Метрология", "Метрологическая экспертиза"],
    services: ["services", "Услуги", "Услуги и методики"],
    postprocessors: [
      "postprocessors",
      "Разработка постпроцессоров",
      "Постпроцессоры",
    ],
    faq: ["faq", "Общие вопросы", "Частые вопросы (FAQ)", "FAQ"],
  };

  const getCategoryLabel = (catId: string) => {
    const direct = categories.find((c) => c.id === catId);
    if (direct) return direct.label;
    for (const [key, aliases] of Object.entries(categoryMap)) {
      if (aliases.includes(catId)) {
        return categories.find((c) => c.id === key)?.label || catId;
      }
    }
    return catId;
  };

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return knowledgeBase.length;
    if (catId === "faq") return FAQ_ITEMS.length;
    if (catId === "glossary") return ENGINEERING_GLOSSARY_TERMS.length;
    const validCats = categoryMap[catId] || [catId];
    return knowledgeBase.filter(
      (item) => item.category === catId || validCats.includes(item.category),
    ).length;
  };

  const [faqGroup, setFaqGroup] = useState<FaqCategoryGroup>('all');
  const [copiedFaqId, setCopiedFaqId] = useState<string | null>(null);

  const [openFaqIds, setOpenFaqIds] = useState<string[]>(() => {
    return FAQ_ITEMS.length > 0 ? [FAQ_ITEMS[0].id] : ['faq-01'];
  });

  // Deep linking: support direct navigation to specific FAQ via #faq-...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#faq-')) {
        const targetId = hash.replace('#', '');
        setSelectedCat('faq');
        setSelectedKnowledgeCategory('faq');
        setOpenFaqIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
        // Auto-switch group if item belongs to a specific group
        const targetItem = FAQ_ITEMS.find((f) => f.id === targetId);
        if (targetItem && targetItem.group) {
          setFaqGroup(targetItem.group);
        }
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 350);
      }
    }
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExpandAllFaqs = () => {
    setOpenFaqIds(filteredFaqs.map((f) => f.id));
  };

  const handleCollapseAllFaqs = () => {
    setOpenFaqIds([]);
  };

  const handleCopyFaqLink = (faqId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/knowledge#${faqId}`
      : `https://ds-engineering.ru/knowledge#${faqId}`;
    navigator.clipboard.writeText(url);
    setCopiedFaqId(faqId);
    setTimeout(() => setCopiedFaqId(null), 2500);
  };

  const handleFaqAction = (faq: FaqItem) => {
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

  const filteredFaqs = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchesGroup = faqGroup === 'all' || item.group === faqGroup;
      if (!matchesGroup) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.groupLabel && item.groupLabel.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
        (item.highlight && item.highlight.toLowerCase().includes(q))
      );
    });
  }, [query, faqGroup]);

  const faqGroupsWithCount = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return FAQ_GROUPS.map((g) => {
      const count = FAQ_ITEMS.filter((item) => {
        const inGroup = g.id === 'all' || item.group === g.id;
        if (!inGroup) return false;
        if (!q) return true;
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.groupLabel && item.groupLabel.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
          (item.highlight && item.highlight.toLowerCase().includes(q))
        );
      }).length;
      return { ...g, count };
    });
  }, [query]);

  const handleCopyContent = (item: KnowledgeItem) => {
    const textToCopy = `${item.title}\n\nКраткое описание:\n${item.summary}\n\nСодержание:\n${item.content}\n\nИсточник: База знаний «ДС‑Инжиниринг»`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = knowledgeBase.filter((item) => {
    const validCats = categoryMap[selectedCat] || [];
    const matchesCat =
      selectedCat === "all" ||
      item.category === selectedCat ||
      validCats.includes(item.category);
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const scrollSections = [
    { id: 'kb-hero', label: 'База знаний' },
    { id: 'kb-categories', label: 'Категории' },
    { id: 'kb-articles', label: 'Статьи и регламенты' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <Scrollspy sections={scrollSections} />
      {/* Header Banner with live search */}
      <div id="kb-hero" className="bg-gradient-to-br from-[#1E3A8A] via-blue-900 to-[#1D4ED8] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-4.5 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300 border border-white/10">
              <BookOpen className="w-4 h-4" />
              <span>
                Инженерная база знаний & Обучающий центр • {knowledgeBase.length}{" "}
                материалов
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Инженерная база знаний и руководства
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
              Практические руководства по CAD/CAM/PDM TopSolid 7, метрологической
              калибровке КИМ, 3D-сканированию, разработке постпроцессоров ЧПУ и
              ответы на частые вопросы заказчиков.
            </p>

            {/* Big Search Input */}
            <div className="relative max-w-2xl pt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 mt-1" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по статьям: TopSolid 7, ISO 10360, HASP, постпроцессоры, 3D-сканирование..."
                className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 border-none shadow-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-500 rounded-full hover:bg-gray-100 cursor-pointer mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Glossary Callout Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigateTo('glossary')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Технический глоссарий: GD&T, ISO 1101, КИМ, постпроцессоры →</span>
              </button>
            </div>
          </div>

          {/* Visual Image Card */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 relative z-10 hidden sm:block">
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80" 
                alt="Технические статьи и инженерная документация" 
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Мануалы • Инструкции • ГОСТ</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                </div>
                <div className="text-[11px] text-blue-200 mt-0.5">
                  База знаний инженеров «ДС‑Инжиниринг»
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT WRAPPER */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* SIDEBAR (Categories) */}
        <div id="kb-categories" className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 z-10">
          <div className="bg-white lg:bg-transparent lg:border-none lg:p-0 rounded-xl border border-gray-200 p-4 shadow-sm lg:shadow-none">
            <h3 className="font-bold text-gray-900 mb-4 hidden lg:block text-sm uppercase tracking-wider">Разделы базы знаний</h3>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-col gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleSelectCategory(cat.id);
                    }}
                    className={`flex items-center justify-between w-full text-left px-4.5 py-3 rounded-xl font-medium transition-all cursor-pointer text-sm border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-semibold"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2.5 pb-2 no-scrollbar -mx-2 px-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleSelectCategory(cat.id);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer text-xs border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-semibold"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-xs"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                    <span>{cat.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Engineering Glossary Sidebar Module */}
            <div className="mt-5 hidden lg:block bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4.5 border border-blue-800/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                    <FileText className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Технический глоссарий</h4>
                    <p className="text-[10px] text-blue-200">GD&T • ISO 1101 • КИМ • ЧПУ</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-amber-300">
                  {ENGINEERING_GLOSSARY_TERMS.length} терминов
                </span>
              </div>

              <p className="text-[11px] text-blue-100/90 leading-relaxed">
                Справочник терминов для главных инженеров: формулировки допусков, кинематика и метрология.
              </p>

              {/* Quick Key Term Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Ключевые термины:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['GD&T', 'ISO 1101', 'Кинематика станка', 'Постпроцессор', 'MPE', 'RTCP', 'B-Rep', 'КЛТР'].map((termName) => (
                    <button
                      key={termName}
                      onClick={() => navigateTo('glossary')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-colors cursor-pointer border border-white/10"
                    >
                      {termName}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigateTo('glossary')}
                className="w-full mt-2 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Открыть полный глоссарий</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="w-full lg:w-3/4 space-y-8 min-w-0">
          {/* Article Detail Reader Card */}
      {activeArticle && (
        <div
          ref={detailRef}
          className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-600/30 dark:border-blue-500/40 p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in duration-200 relative scroll-mt-24"
        >
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800 gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold rounded-md uppercase tracking-wider border border-blue-200 dark:border-blue-800/60">
                  {getCategoryLabel(activeArticle.category)}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-400 dark:text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeArticle.updatedAt}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-400 dark:text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  ~4 мин чтения
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                {activeArticle.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopyContent(activeArticle)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                title="Копировать текст статьи"
              >
                {copiedId === activeArticle.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      Скопировано
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSelectArticle(null)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors shrink-0 cursor-pointer"
                title="Закрыть (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="font-medium text-gray-900 dark:text-slate-100 text-sm bg-slate-100/90 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-blue-900 dark:text-blue-300 font-semibold mb-1">
                  Инженерное резюме регламента:
                </strong>
                <p className="text-gray-800 dark:text-slate-200 leading-relaxed">
                  {activeArticle.summary}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="prose prose-blue max-w-none text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line text-sm">
                {activeArticle.content}
              </div>

              {/* Dynamic Snippet for Postprocessors */}
              {((activeArticle.category as string) === "postprocessors" ||
                activeArticle.category === "Разработка постпроцессоров") && (
                <div className="bg-slate-950 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto no-scrollbar border border-slate-800 shadow-inner">
                  <div className="text-slate-400 mb-3 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-200">
                        Фрагмент управляющей программы (TopSolid Post):
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">
                      ISO / DIN 66025
                    </span>
                  </div>
                  <pre className="text-emerald-400 leading-relaxed font-mono">
                    {`N100 G90 G17 G40 G80 ; Инициализация системы\nN110 TRAORI ; Включение непрерывной 5-осевой кинематики (RTCP)\nN120 CYCLE832(0.005, 1) ; High-Speed Machining точность 5 мкм\nN130 G00 X0 Y0 Z150 A0 C0\nN140 G01 Z120 F1500`}
                  </pre>
                </div>
              )}

              {/* Interactive Help Card */}
              <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong className="font-semibold block mb-0.5 text-amber-950 dark:text-amber-100">
                    Экспертиза «ДС‑Инжиниринг»:
                  </strong>
                  Все методики, допуски и формулы проверены на действующих
                  производственных площадках и измерительных лабораториях
                  Самарской области и технопарка «Жигулевская долина».
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                Теги темы:
              </span>
              {activeArticle.tags.map((t) => (
                <span
                  key={t}
                  onClick={() => setQuery(t)}
                  className="px-4 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                ДС
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">
                  Требуется консультация инженера по данному регламенту?
                </span>
                <span className="text-gray-500 dark:text-slate-400">
                  Ведущие специалисты ДС‑Инжиниринг ответят на вопросы и
                  проведут аудит
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handleSelectArticle(null);
                openContactModal({
                  title: `Вопрос по теме: ${activeArticle.title}`,
                  formType: "consultation",
                });
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Задать вопрос эксперту</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Technical Articles Section (Header & Grid) */}
      <div id="kb-articles" className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {selectedCat === 'faq' ? 'Часто задаваемые вопросы (FAQ) и регламенты' : 'Технические статьи, регламенты метрологии и САПР'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {selectedCat === 'faq'
                ? 'Официальные ответы экспертов «ДС‑Инжиниринг» по стандартам «Пиши, сокращай»'
                : 'Статьи по калибровке КИМ, постпроцессорам ЧПУ и обработке поверхностей'}
            </p>
          </div>
          {query && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Найдено:{" "}
              <strong className="text-gray-900 dark:text-white">
                {selectedCat === 'faq' ? filteredFaqs.length : filtered.length}
              </strong>
            </span>
          )}
        </div>

        {/* Results Header when searching */}
        {query && (
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Найдено {selectedCat === 'faq' ? 'вопросов' : 'статей'} по запросу «
              <strong className="text-gray-900 dark:text-white">{query}</strong>»:{" "}
              {selectedCat === 'faq' ? filteredFaqs.length : filtered.length}
            </span>
            <button
              onClick={() => setQuery("")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Сбросить поиск
            </button>
          </div>
        )}

        {/* FAQ or Articles Grid */}
        {selectedCat === 'faq' ? (
          <div className="space-y-6">
            {/* SUB-CATEGORY DIRECTIONS FILTER BAR (4 Key Focus Vectors) */}
            <div className="bg-slate-50 dark:bg-slate-850 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Направления регламентных вопросов:</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleExpandAllFaqs}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
                  >
                    Развернуть все
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleCollapseAllFaqs}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
                  >
                    Свернуть все
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Найдено: {filteredFaqs.length}
                  </span>
                </div>
              </div>

              {/* Direction Pills with Live Item Counts */}
              <div className="flex flex-wrap gap-2 pt-1">
                {faqGroupsWithCount.map((group) => {
                  const isActive = faqGroup === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setFaqGroup(group.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1E3A8A] text-white shadow-xs dark:bg-blue-600 dark:text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                      title={group.description}
                    >
                      <span>{group.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {group.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions List */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700 text-center space-y-4 shadow-xs">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  По выбранным критериям вопросов не найдено
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                  {query
                    ? `По запросу «${query}» в выбранном направлении совпадений нет. Попробуйте сбросить поисковую фразу или выбрать другое направление.`
                    : 'В данном направлении пока нет активных вопросов.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFaqGroup("all");
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Показать все вопросы FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openContactModal({
                        title: "Вопрос в инженерную службу «ДС-Инжиниринг»",
                        formType: "question",
                      })
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Задать свой вопрос инженеру
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqIds.includes(faq.id);
                  const isCopied = copiedFaqId === faq.id;

                  return (
                    <div
                      key={faq.id}
                      id={faq.id}
                      className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 scroll-mt-24 ${
                        isOpen
                          ? 'border-blue-300 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/10'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-start sm:items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-750/50"
                      >
                        <div className="space-y-1.5 pr-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                              {faq.groupLabel || faq.categoryLabel}
                            </span>
                            {faq.tags && faq.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="hidden md:inline-block text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopyFaqLink(faq.id, e)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-700 transition-colors"
                            title="Копировать прямую ссылку на вопрос"
                          >
                            {isCopied ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <ChevronRight
                              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                                isOpen ? "rotate-90 text-blue-600 dark:text-blue-400" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/80 space-y-3.5">
                          <p className="font-normal text-slate-700 dark:text-slate-200 leading-relaxed">
                            {faq.answer}
                          </p>

                          {faq.highlight && (
                            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl text-blue-900 dark:text-blue-200 text-xs font-medium flex items-start gap-2.5">
                              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{faq.highlight}</span>
                            </div>
                          )}

                          {faq.tags && faq.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                Ключевые слова:
                              </span>
                              {faq.tags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => setQuery(tag)}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-mono cursor-pointer"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-750">
                            <div className="flex flex-wrap items-center gap-2">
                              {faq.actionText && (
                                <button
                                  type="button"
                                  onClick={() => handleFaqAction(faq)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                >
                                  <span>{faq.actionText}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  openContactModal({
                                    title: `Вопрос по теме: ${faq.question}`,
                                    formType: "question",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                              >
                                <span>Задать вопрос эксперту</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyFaqLink(faq.id)}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer ml-auto"
                            >
                              {isCopied ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Ссылка скопирована</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Копировать ссылку на вопрос</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">
              По вашему запросу ничего не найдено
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Попробуйте изменить ключевые слова или выберите другую категорию в
              фильтре выше.
            </p>
            <button
              onClick={() => {
                setQuery("");
                handleSelectCategory("all");
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const categoryLabel = getCategoryLabel(item.category);
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectArticle(item)}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 font-bold rounded-lg text-[11px] truncate shrink min-w-0">
                        {categoryLabel}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium shrink-0">
                        {item.updatedAt}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs gap-2">
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md font-medium truncate max-w-[110px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0 text-xs">
                      Читать <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;

