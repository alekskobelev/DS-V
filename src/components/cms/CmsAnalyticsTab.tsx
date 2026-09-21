import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  RefreshCw, 
  Trash2, 
  Search, 
  ExternalLink, 
  Filter, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { usePageVisits } from '../../hooks/usePageVisits';
import { useApp } from '../../context/AppContext';

export const CmsAnalyticsTab: React.FC = () => {
  const { showToast, navigateTo } = useApp();
  const {
    pageVisits,
    totalVisits,
    mostVisitedPage,
    logVisit,
    resetVisits,
    exportVisitsJSON
  } = usePageVisits();

  const [analyticsFilter, setAnalyticsFilter] = useState<'all' | 'catalog' | 'services' | 'info' | 'custom' | 'system'>('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');

  const filteredVisits = pageVisits.filter((v) => {
    const matchesFilter = analyticsFilter === 'all' || v.category === analyticsFilter;
    const matchesSearch =
      !analyticsSearch.trim() ||
      v.title.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
      v.path.toLowerCase().includes(analyticsSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const json = exportVisitsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-visits-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Статистика посещений успешно экспортирована (.json)');
  };

  const handleReset = () => {
    if (confirm('Сбросить накопленную статистику просмотров страниц?')) {
      resetVisits();
      showToast('Счетчики просмотров страниц очищены');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Аналитика и популярность разделов</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Статистика посещаемости страниц сайта
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Автономный счетчик переходов (React Hook <code>usePageVisits</code>). Показывает востребованность разделов каталога, конфигуратора КИМ и посадочных страниц без внешних сторонних трекеров.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт JSON</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Всего просмотров</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {totalVisits.toLocaleString('ru-RU')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Суммарная активность сессий</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Самая популярная</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-900 mt-2 truncate" title={mostVisitedPage?.title}>
            {mostVisitedPage ? mostVisitedPage.title.split('(')[0] : '—'}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span>Просмотров:</span>
            <strong className="text-blue-600">{mostVisitedPage?.visitCount || 0}</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Отслеживаемых страниц</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {pageVisits.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span>Категории: каталог, услуги, инфо</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Фильтр:</span>
            </span>
            <div className="flex items-center gap-1">
              {(['all', 'catalog', 'services', 'info', 'custom', 'system'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAnalyticsFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    analyticsFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                  }`}
                >
                  {cat === 'all' && 'Все'}
                  {cat === 'catalog' && 'Каталог'}
                  {cat === 'services' && 'Услуги'}
                  {cat === 'info' && 'Инфо'}
                  {cat === 'custom' && 'Пользовательские'}
                  {cat === 'system' && 'Системные'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={analyticsSearch}
              onChange={(e) => setAnalyticsSearch(e.target.value)}
              placeholder="Поиск по названию или пути..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Страница</th>
                <th className="py-3 px-4">Путь (Path)</th>
                <th className="py-3 px-4">Категория</th>
                <th className="py-3 px-4 text-center">Просмотров</th>
                <th className="py-3 px-4">Доля в трафике</th>
                <th className="py-3 px-4 text-right">Переход</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisits.map((item) => {
                const percent = totalVisits > 0 ? Math.round((item.visitCount / totalVisits) * 100) : 0;
                return (
                  <tr key={item.path} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.title}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      /{item.path}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-slate-500 uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.visitCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium w-8 text-right">
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigateTo(item.path as any)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>Открыть</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    Записи не найдены. Посетите страницы сайта для накопления статистики.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
