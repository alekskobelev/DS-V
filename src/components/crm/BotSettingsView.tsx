import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Sparkles, 
  ExternalLink, 
  RotateCcw,
  CheckCircle2,
  Tag,
  BookOpen,
  Info
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { SiteTopic, PageId } from '../../types';
import { DEFAULT_SITE_TOPICS } from '../../utils/engineerKnowledgeBase';

const AVAILABLE_PAGES: { value: PageId; label: string }[] = [
  { value: 'home', label: 'Главная страница' },
  { value: 'hardware', label: 'Оборудование (КИМ, руки, 3D-сканеры, трекеры)' },
  { value: 'software', label: 'Программное обеспечение (TopSolid 7, PolyWorks)' },
  { value: 'services', label: 'Инжиниринговые услуги и калькулятор' },
  { value: 'knowledge', label: 'База знаний (ГОСТы, методики, ВНИИМС)' },
  { value: 'about', label: 'О компании «ДС-Инжиниринг»' },
  { value: 'contacts', label: 'Контакты, телефоны и филиалы' },
  { value: 'news', label: 'Пресс-центр и технические статьи' }
];

export const BotSettingsView: React.FC = () => {
  const [topics, setTopics] = useState<SiteTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getBotTopics();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTopics(res.data);
      } else {
        // If file was empty or new, load defaults
        setTopics(DEFAULT_SITE_TOPICS);
      }
    } catch (e) {
      setError('Ошибка при загрузке тем с сервера. Загружены эталонные темы по умолчанию.');
      setTopics(DEFAULT_SITE_TOPICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await apiService.saveBotTopics(topics);
      if (res.success) {
        setSuccessMessage('База знаний и ответов «Онлайн-Инженера» успешно сохранена и применена в виджете чата!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setError('Не удалось сохранить изменения на сервере.');
      }
    } catch (e) {
      setError('Сетевая ошибка при сохранении тем.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Восстановить эталонную базу ответов «ДС-Инжиниринг» (14 тем)? Текущие несохраненные изменения будут заменены.')) {
      setTopics([...DEFAULT_SITE_TOPICS]);
      setSuccessMessage('Загружена эталонная база ответов. Не забудьте нажать «Сохранить изменения».');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const addTopic = () => {
    const newTopic: SiteTopic = {
      id: `topic-${Date.now()}`,
      title: 'Новая тема консультаций',
      keywords: ['вопрос', 'консультация'],
      page: 'services',
      summary: 'Опишите профессиональный ответ инженера-технолога для посетителя сайта...',
      actionLabel: 'Подробнее на сайте'
    };
    setTopics([newTopic, ...topics]);
    setSearchQuery('');
  };

  const updateTopic = (index: number, field: keyof SiteTopic, value: any) => {
    const newTopics = [...topics];
    newTopics[index] = { ...newTopics[index], [field]: value };
    setTopics(newTopics);
  };

  const removeTopic = (index: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту тему и ответы к ней?')) {
      const newTopics = [...topics];
      newTopics.splice(index, 1);
      setTopics(newTopics);
    }
  };

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return topics.map((t, idx) => ({ topic: t, originalIndex: idx }));

    return topics
      .map((t, idx) => ({ topic: t, originalIndex: idx }))
      .filter(({ topic }) => {
        return (
          topic.title.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q) ||
          topic.keywords.some(k => k.toLowerCase().includes(q)) ||
          topic.page.toLowerCase().includes(q) ||
          (topic.detailId && topic.detailId.toLowerCase().includes(q))
        );
      });
  }, [topics, searchQuery]);

  const totalKeywords = useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.keywords?.length || 0), 0);
  }, [topics]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Загрузка базы ответов чат-бота «Онлайн-инженер»...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                База знаний и сценариев ответов «Онлайн-Инженера»
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              Настройка алгоритма автоматических ответов виджета в правом нижнем углу сайта. 
              Когда посетитель вводит вопрос, система находит наиболее релевантную тему по ключевым словам и мгновенно выводит инженерную консультацию с интерактивной кнопкой действия.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Сбросить темы к заводским промышленным шаблонам «ДС-Инжиниринг»"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Шаблоны по умолчанию</span>
            </button>
            <button
              onClick={addTopic}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить тему</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Сохранение...' : 'Сохранить изменения'}</span>
            </button>
          </div>
        </div>

        {/* Informational guide */}
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Как составлять ключевые слова:</strong> указывайте корни слов в нижнем регистре через запятую (например: <code>ким, координатно, щуп, точность, renishaw</code>). 
            Чем длиннее и точнее совпадение корня слова с запросом клиента, тем выше приоритет выдачи этой темы.
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Counts Filter Bar */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Быстрый поиск по названию, ключевым словам или тексту ответа..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            <span>Всего тем: <strong className="text-gray-900">{topics.length}</strong></span>
            <span>•</span>
            <span>Ключевых слов: <strong className="text-gray-900">{totalKeywords}</strong></span>
            {searchQuery && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-semibold">Найдено: {filteredTopics.length}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map(({ topic, originalIndex }) => (
          <div 
            key={topic.id} 
            className="bg-white border border-gray-200 hover:border-gray-300 rounded-lg p-5 shadow-xs transition-all relative group"
          >
            {/* Header: Title & Controls */}
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">
                  #{originalIndex + 1}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                  {topic.id}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => removeTopic(originalIndex)}
                  className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Удалить тему"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Title */}
              <div className="md:col-span-8">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Название темы (для каталога)
                </label>
                <input
                  type="text"
                  value={topic.title}
                  onChange={e => updateTopic(originalIndex, 'title', e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
                />
              </div>

              {/* Target Page */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Раздел сайта для перехода
                </label>
                <select
                  value={topic.page}
                  onChange={e => updateTopic(originalIndex, 'page', e.target.value as PageId)}
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-gray-800 cursor-pointer"
                >
                  {AVAILABLE_PAGES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Keywords */}
              <div className="md:col-span-12">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Ключевые слова и фразы (через запятую)
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {topic.keywords.length} ключей
                  </span>
                </div>
                <input
                  type="text"
                  value={topic.keywords.join(', ')}
                  onChange={e => updateTopic(originalIndex, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-slate-500"
                  placeholder="ким, портальная, точность, renishaw, поверка..."
                />
                {/* Visual Tags Preview */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {topic.keywords.map((kw, kIdx) => (
                    <span key={kIdx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                      <Tag className="w-2.5 h-2.5 text-gray-400" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary Text (Bot Reply) */}
              <div className="md:col-span-12">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Текст ответа инженера-консультанта
                </label>
                <textarea
                  rows={3}
                  value={topic.summary}
                  onChange={e => updateTopic(originalIndex, 'summary', e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed text-gray-800"
                  placeholder="Подробный ответ с техническими характеристиками, стандартами ГОСТ или условиями поставки..."
                />
              </div>

              {/* Button Action Label */}
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Текст на кнопке действия
                </label>
                <input
                  type="text"
                  value={topic.actionLabel}
                  onChange={e => updateTopic(originalIndex, 'actionLabel', e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
                  placeholder="Открыть каталог КИМ"
                />
              </div>

              {/* Optional Detail ID */}
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  ID карточки товара/услуги (detailId, опционально)
                </label>
                <input
                  type="text"
                  value={topic.detailId || ''}
                  onChange={e => updateTopic(originalIndex, 'detailId', e.target.value || undefined)}
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-slate-500"
                  placeholder="например: soft-topsolid, hw-pmt-arm, srv-inspection"
                />
              </div>
            </div>
          </div>
        ))}

        {filteredTopics.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-xs">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Темы не найдены</p>
            <p className="text-xs text-gray-500 mt-1">
              По запросу «{searchQuery}» совпадений не обнаружено. Попробуйте изменить поисковый запрос или добавить новую тему.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
