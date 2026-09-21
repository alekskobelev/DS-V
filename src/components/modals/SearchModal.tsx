import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Layers, Box, Wrench, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA, SERVICES_DATA, NEWS_ARTICLES, KNOWLEDGE_BASE_ITEMS } from '../../data/mockData';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { RecentSearchesDropdown } from '../common/RecentSearchesDropdown';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigateTo } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'software' | 'hardware' | 'service' | 'article'>('all');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  useEffect(() => {
    if (isSearchOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search in products
  const matchingProducts = PRODUCTS_DATA.filter(
    (p) =>
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)) &&
      (filterType === 'all' || filterType === p.type)
  );

  // Search in services
  const matchingServices = SERVICES_DATA.filter(
    (s) =>
      (!q ||
        s.title.toLowerCase().includes(q) ||
        s.shortDesc.toLowerCase().includes(q) ||
        s.fullDesc.toLowerCase().includes(q)) &&
      (filterType === 'all' || filterType === 'service')
  );

  // Search in news/articles
  const matchingArticles = NEWS_ARTICLES.filter(
    (a) =>
      (!q ||
        a.title.toLowerCase().includes(q) ||
        a.preview.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))) &&
      (filterType === 'all' || filterType === 'article')
  );

  // Search in knowledge base
  const matchingKnowledge = KNOWLEDGE_BASE_ITEMS.filter(
    (k) =>
      (!q ||
        k.title.toLowerCase().includes(q) ||
        k.summary.toLowerCase().includes(q) ||
        k.content.toLowerCase().includes(q)) &&
      (filterType === 'all' || filterType === 'article')
  );

  const totalResults =
    matchingProducts.length +
    matchingServices.length +
    matchingArticles.length +
    matchingKnowledge.length;

  const handleSelectResult = (action: () => void) => {
    if (query.trim()) {
      addRecentSearch(query);
    }
    setIsSearchOpen(false);
    action();
  };

  return (
    <div 
      onClick={() => setIsSearchOpen(false)}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-slate-50/70 relative">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                addRecentSearch(query);
              }
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по каталогу ПО, оборудованию, услугам и статьям..."
            className="flex-1 bg-transparent border-none text-sm text-gray-900 focus:outline-none placeholder-gray-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')} 
              className="p-1 text-gray-400 hover:text-slate-500 rounded-md hover:bg-gray-200/50 transition-colors"
              title="Очистить поле поиска"
              aria-label="Очистить"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Закрыть поиск (ESC)"
            aria-label="Закрыть поиск"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Recent Searches Dropdown Menu */}
          {isInputFocused && recentSearches.length > 0 && (
            <RecentSearchesDropdown
              searches={recentSearches}
              onSelect={(selected) => {
                setQuery(selected);
                addRecentSearch(selected);
                inputRef.current?.focus();
              }}
              onRemove={removeRecentSearch}
              onClear={clearRecentSearches}
              className="left-4 right-4"
            />
          )}
        </div>

        {/* Filter Badges */}
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1 rounded-full font-medium transition-colors ${
              filterType === 'all' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            Всё ({totalResults})
          </button>
          <button
            onClick={() => setFilterType('software')}
            className={`px-4 py-1 rounded-full font-medium transition-colors ${
              filterType === 'software' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            Программное обеспечение
          </button>
          <button
            onClick={() => setFilterType('hardware')}
            className={`px-4 py-1 rounded-full font-medium transition-colors ${
              filterType === 'hardware' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            Оборудование
          </button>
          <button
            onClick={() => setFilterType('service')}
            className={`px-4 py-1 rounded-full font-medium transition-colors ${
              filterType === 'service' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            Услуги
          </button>
          <button
            onClick={() => setFilterType('article')}
            className={`px-4 py-1 rounded-full font-medium transition-colors ${
              filterType === 'article' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            База знаний и новости
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {totalResults === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Ничего не найдено по запросу «{query}»</p>
              <p className="text-xs mt-1">Попробуйте поискать: TopSolid, 3D-сканирование, Leica, КИМ, постпроцессор</p>
            </div>
          ) : (
            <>
              {/* Products Section */}
              {matchingProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Каталог продукции ({matchingProducts.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          handleSelectResult(() => navigateTo(p.type === 'software' ? 'software' : 'hardware', p.id));
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50/70 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            {p.type === 'software' ? <Layers className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{p.shortDescription}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {matchingServices.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Инжиниринговые услуги ({matchingServices.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingServices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          handleSelectResult(() => navigateTo('services', s.id));
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50/70 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {s.title}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{s.shortDesc}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge Base & News */}
              {(matchingKnowledge.length > 0 || matchingArticles.length > 0) && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Статьи и база знаний ({matchingKnowledge.length + matchingArticles.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingKnowledge.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => {
                          handleSelectResult(() => navigateTo('knowledge'));
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50/70 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-slate-500 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {k.title}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{k.summary}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                      </button>
                    ))}

                    {matchingArticles.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          handleSelectResult(() => navigateTo('news'));
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50/70 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-slate-500 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {a.title}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{a.preview}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Нажмите <strong>ESC</strong> или кликните вне окна для закрытия</span>
          <span>Быстрый вызов: <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-slate-500">Ctrl + K</kbd></span>
        </div>
      </div>
    </div>
  );
};
