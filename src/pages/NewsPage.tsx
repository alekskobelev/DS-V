import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Tag, 
  ArrowRight, 
  X, 
  Share2, 
  Sparkles,
  Search,
  BookOpen,
  User
} from 'lucide-react';
import { NEWS_ARTICLES } from '../data/mockData';
import { NewsArticle } from '../types';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { ArticleContentRenderer } from '../components/common/ArticleContentRenderer';
import { Scrollspy } from '../components/common/Scrollspy';

export const NewsPage: React.FC = () => {
  const { articles, openContactModal, showToast, customPages, selectedArticle, setSelectedArticle, navigateTo } = useApp();
  const cmsPage = customPages.find(p => p.id === 'news');
  
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || 'Новости и статьи | ДС‑Инжиниринг',
    description: cmsPage?.metaDescription || cmsPage?.description || 'Технические статьи, обзоры оборудования, обновления ПО (TopSolid, PolyWorks), новые поступления 3D-сканеров и расписание выставок и вебинаров.',
    keywords: cmsPage?.metaKeywords?.join(', ') || 'статьи 3d сканирования, технические статьи метрология, релиз TopSolid, обновление PolyWorks, выставки металлообработка, вебинары CAD CAM'
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<any | null>(selectedArticle || null);

  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedArticle) {
      setActiveArticle(selectedArticle);
    } else {
      setActiveArticle(null);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (activeArticle && detailRef.current) {
      const y = detailRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [activeArticle]);

  const handleCloseDetail = () => {
    setActiveArticle(null);
    setSelectedArticle(null);
    navigateTo('news');
  };

  useEffect(() => {
    if (activeArticle) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseDetail();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeArticle]);

  const categories = ['all', 'Релизы ПО', 'Выставки', 'Проекты', 'События', 'Статьи'];

  const filtered = articles.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  const scrollSections = [
    { id: 'news-hero', label: 'Пресс-центр' },
    { id: 'news-categories', label: 'Категории' },
    { id: 'news-grid', label: 'Новости и статьи' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <Scrollspy sections={scrollSections} />
      {/* Header Banner */}
      <div id="news-hero" className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
            <FileText className="w-4 h-4" />
            <span>Пресс-центр и события</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Новости инжиниринга и технологические обновления
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Свежие анонсы обновлений TopSolid 7, отчеты с промышленных выставок «Металлообработка», обзоры внедренных проектов и метрологических практик.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
            <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Актуальные статьи и релизы
            </div>
            <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-blue-300" /> Сезон 2026
            </div>
          </div>
        </div>

        {/* Visual Image Card */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 relative z-10">
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
            <img 
              src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80" 
              alt="События, выставки и новости инжиниринга" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Выставки • Релизы • Проекты</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Официальные события «ДС‑Инжиниринг»
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div id="news-categories" className="flex flex-wrap items-center gap-2 pb-2 text-xs sm:text-sm w-full">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-xs'
            }`}
          >
            {cat === 'all' ? 'Все новости' : cat}
          </button>
        ))}
      </div>

      {/* Category Banner for Articles */}
      {selectedCategory === 'Статьи' && (
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 border border-blue-500/30 text-white rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">Технические статьи и инженерные разборы</h3>
              <span className="px-2 py-0.5 text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full font-semibold">
                Интерактивные материалы
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Публикации инженерного центра «ДС‑Инжиниринг»: методологии 3D-сканирования, математика постпроцессирования для 5-осевых станков, расчет допусков по ГОСТ/ISO и скрипты автоматизации КИМ.
            </p>
          </div>
        </div>
      )}

      {/* Full Article Card View */}
      {activeArticle && (
        <div ref={detailRef} className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-600/30 dark:border-blue-500/40 overflow-hidden shadow-sm space-y-6 animate-in fade-in duration-200 relative scroll-mt-24">
          <div className="relative h-64 sm:h-80">
            <img
              src={activeArticle.image}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-6 sm:p-8">
              <div className="pr-12">
                <span className={`px-4 py-1 text-xs font-semibold rounded-md ${
                  activeArticle.category === 'Статьи' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'bg-[#2563EB] text-white'
                }`}>
                  {activeArticle.category}
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-2">
                  {activeArticle.title}
                </h2>
              </div>
            </div>
            <button
              onClick={handleCloseDetail}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xs text-white transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400 pb-3 border-b border-gray-100 dark:border-slate-800">
              {activeArticle.author && (
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{activeArticle.author}</span>
                </span>
              )}
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{activeArticle.date}</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>{activeArticle.readTime}</span>
              </span>
              {activeArticle.category === 'Статьи' && (
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded text-[10px] font-semibold">
                  Инженерная статья
                </span>
              )}
            </div>

            {/* Content Renderer (handles both string paragraphs and rich HTML/CSS/JS with full isolation) */}
            <ArticleContentRenderer 
              content={activeArticle.content} 
              articleTitle={activeArticle.title} 
            />

            {/* Tags */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-1.5">
              {activeArticle.tags?.map((t: string) => (
                <span key={t} className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px]">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 rounded-b-xl border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Ссылка скопирована в буфер обмена');
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Поделиться публикацией</span>
            </button>
            <button
              onClick={() => {
                handleCloseDetail();
                openContactModal({ title: 'Консультация по материалам: ' + activeArticle.title });
              }}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Обсудить с инженером
            </button>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div id="news-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((art) => {
          const isArticle = art.category === 'Статьи';
          return (
            <div
              key={art.id}
              onClick={() => {
                setActiveArticle(art);
                setSelectedArticle(art);
                navigateTo('news', art.id);
              }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-48 object-cover"
                  />
                  {isArticle ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[10px] font-bold uppercase rounded-md shadow-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Статья</span>
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-blue-900 text-[10px] font-bold uppercase rounded-md shadow-xs">
                      {art.category}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {art.preview}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{art.author || 'ДС‑Инжиниринг'}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {isArticle ? 'Изучить статью →' : 'Читать далее →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
