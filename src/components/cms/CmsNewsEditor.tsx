import React, { useState } from 'react';
import {
  Newspaper,
  BookOpen,
  Code2,
  Plus,
  Search,
  Code,
  Copy,
  Trash2,
  Columns,
  Edit3,
  Eye,
  X,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Article, KnowledgeItem } from '../../types';
import { ArticleCodeEditor } from './ArticleCodeEditor';
import { ArticleVisualPreview } from './ArticleVisualPreview';
import { RichTextEditor } from './RichTextEditor';
import { FileUploadField } from '../common/FileUploadField';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';

export const CmsNewsEditor: React.FC = () => {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    knowledgeBase,
    addKnowledgeItem,
    deleteKnowledgeItem,
    currentUser,
    showToast,
  } = useApp();

  // Sub-section & View Mode states
  const [newsSubSection, setNewsSubSection] = useState<'articles' | 'knowledge'>('articles');
  const [articlesViewMode, setArticlesViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  // Article Edit State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artDate, setArtDate] = useState('22.08.2026');
  const [artCategory, setArtCategory] = useState('Релизы');
  const [artAuthor, setArtAuthor] = useState('Пресс-служба');
  const [artPreview, setArtPreview] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImage, setArtImage] = useState('');
  const [artBrochureUrl, setArtBrochureUrl] = useState('');

  // Search & Filter
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  // Code Editor state
  const [isArticleCodeEditorOpen, setIsArticleCodeEditorOpen] = useState(false);
  const [articleForCodeEditor, setArticleForCodeEditor] = useState<Article | null>(null);

  // Knowledge base state
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [knowTitle, setKnowTitle] = useState('');
  const [knowCategory, setKnowCategory] = useState<'ПО' | 'Оборудование' | 'Услуги' | 'Разработка постпроцессоров' | 'Общие вопросы'>('ПО');
  const [knowSummary, setKnowSummary] = useState('');
  const [knowContent, setKnowContent] = useState('');
  const [knowTags, setKnowTags] = useState('TopSolid, Метрология, ГОСТ');
  const [knowSearchQuery, setKnowSearchQuery] = useState('');
  const [knowCategoryFilter, setKnowCategoryFilter] = useState<string>('all');

  // Handlers for Articles
  const handleStartEditArticle = (art: Article) => {
    setNewsSubSection('articles');
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtDate(art.date);
    setArtCategory(art.category);
    setArtAuthor(art.author || 'Инженерный отдел ДС-Инжиниринг');
    setArtPreview(art.preview);
    setArtContent(Array.isArray(art.content) ? art.content.join('\n\n') : (art.content || ''));
    setArtImage(art.image || '');
    const rawBrochure = (art as any).brochureUrl || (art as any).fileUrl || '';
    setArtBrochureUrl(Array.isArray(rawBrochure) ? rawBrochure[0] || '' : String(rawBrochure));
    showToast(`Редактирование публикации: «${art.title}»`);
  };

  const handleStartEditArticleInCodeEditor = (art: Article) => {
    setArticleForCodeEditor(art);
    setIsArticleCodeEditorOpen(true);
    showToast(`Открыт редактор: «${art.title}»`);
  };

  const handleCreateNewArticleInCodeEditor = (category: string = 'Статьи') => {
    const defaultAuthor = currentUser?.fullName || 'Инжиниринговая компания «ДС‑Инжиниринг»';
    setArticleForCodeEditor({
      id: `art-${Date.now()}`,
      title: '',
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }),
      category,
      author: defaultAuthor,
      readTime: '5 мин',
      preview: '',
      content: '',
      tags: category === 'Статьи' ? ['3D-сканирование', 'Метрология', 'Инженерия', 'ГОСТ'] : ['Новости', 'Релизы'],
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      isHtml: true,
    });
    setIsArticleCodeEditorOpen(true);
  };

  const handleDuplicateArticle = (art: Article) => {
    const cloned: Article = {
      ...art,
      id: `art-${Date.now()}`,
      title: `${art.title} (Копия)`,
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }),
    };
    addArticle(cloned);
    showToast(`Создана копия публикации: «${cloned.title}»`);
  };

  const handleSaveCodeArticle = (savedArt: Article) => {
    if (savedArt.id.startsWith('kb-') || savedArt.category === 'База знаний' || editingKnowledgeId) {
      const knowObj: KnowledgeItem = {
        id: savedArt.id.startsWith('kb-') ? savedArt.id : `kb-${savedArt.id}`,
        title: savedArt.title,
        category: (savedArt.category === 'База знаний' ? knowCategory : savedArt.category) as any,
        summary: savedArt.preview || 'Справочный материал',
        content: Array.isArray(savedArt.content) ? savedArt.content.join('\n\n') : (savedArt.content || ''),
        tags: savedArt.tags || ['База знаний'],
        updatedAt: new Date().toLocaleDateString('ru-RU'),
      };
      if (editingKnowledgeId) {
        deleteKnowledgeItem(editingKnowledgeId);
      }
      addKnowledgeItem(knowObj);
      showToast(`Регламент «${savedArt.title}» успешно сохранен в Базу знаний!`);
    } else {
      const existingIndex = articles.findIndex((a) => a.id === savedArt.id);
      if (existingIndex >= 0) {
        updateArticle(savedArt.id, savedArt);
        showToast(`Материал «${savedArt.title}» успешно обновлен!`);
      } else {
        addArticle(savedArt);
        showToast(`Материал «${savedArt.title}» успешно опубликован!`);
      }
    }
    setIsArticleCodeEditorOpen(false);
    setArticleForCodeEditor(null);
  };

  const handleOpenKnowledgeInCodeEditor = () => {
    const tempArt: Article = {
      id: editingKnowledgeId || `kb-custom-${Date.now()}`,
      title: knowTitle || 'Регламент / Техническая инструкция',
      category: 'База знаний',
      date: new Date().toLocaleDateString('ru-RU'),
      author: currentUser?.fullName || 'Инженерный отдел ДС‑Инжиниринг',
      readTime: '5 мин',
      views: 100,
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      preview: knowSummary || 'Справочный материал и инженерные рекомендации.',
      content: knowContent || '<p>Подробный текст регламента...</p>',
      tags: knowTags ? knowTags.split(',').map((t) => t.trim()).filter(Boolean) : ['База знаний', 'ГОСТ', 'Регламент'],
      isHtml: true,
    };
    setArticleForCodeEditor(tempArt);
    setIsArticleCodeEditorOpen(true);
  };

  const handleResetArticleForm = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtPreview('');
    setArtContent('');
    setArtImage('');
    setArtBrochureUrl('');
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) {
      showToast('Укажите заголовок статьи');
      return;
    }
    const cleanId = artTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const artObj: Article = {
      id: editingArticleId || `art-${cleanId}-${Date.now()}`,
      title: artTitle,
      date: artDate,
      category: artCategory,
      author: artAuthor,
      preview: artPreview || 'Новая публикация в пресс-центре «ДС‑Инжиниринг».',
      content: artContent || artPreview || 'Подробный текст публикации...',
      tags: ['TopSolid', 'ЧПУ', 'Новости'],
      image: artImage.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      readTime: '4 мин',
      brochureUrl: artBrochureUrl.trim() || undefined,
      fileUrl: artBrochureUrl.trim() || undefined,
    } as any;
    if (editingArticleId) {
      deleteArticle(editingArticleId);
    }
    addArticle(artObj);
    showToast(`Статья «${artTitle}» сохранена!`);
    handleResetArticleForm();
  };

  // Handlers for Knowledge Base
  const handleStartEditKnowledge = (k: KnowledgeItem) => {
    setEditingKnowledgeId(k.id);
    setKnowTitle(k.title);
    setKnowCategory(k.category as any);
    setKnowSummary(k.summary);
    setKnowContent(k.content);
    setKnowTags(k.tags?.join(', ') || 'TopSolid, Метрология, ГОСТ');
    showToast(`Редактирование материала: «${k.title}»`);
  };

  const handleResetKnowledgeForm = () => {
    setEditingKnowledgeId(null);
    setKnowTitle('');
    setKnowCategory('ПО');
    setKnowSummary('');
    setKnowContent('');
    setKnowTags('TopSolid, Метрология, ГОСТ');
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowTitle.trim()) {
      showToast('Укажите название материала');
      return;
    }
    const cleanId = knowTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tagsArray = knowTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const knowObj: KnowledgeItem = {
      id: editingKnowledgeId || `kb-custom-${cleanId}-${Date.now()}`,
      title: knowTitle.trim(),
      category: knowCategory,
      summary: knowSummary.trim() || 'Справочный материал и инженерные рекомендации.',
      content: knowContent.trim() || knowSummary.trim() || 'Полный текст руководства...',
      tags: tagsArray.length > 0 ? tagsArray : ['ГОСТ', 'Метрология', 'Инжиниринг'],
      updatedAt: new Date().toLocaleDateString('ru-RU'),
    };
    if (editingKnowledgeId) {
      deleteKnowledgeItem(editingKnowledgeId);
    }
    addKnowledgeItem(knowObj);
    showToast(`Материал «${knowTitle}» успешно сохранен в Базу знаний!`);
    handleResetKnowledgeForm();
  };

  // Preview Article computation
  const activeArticle = articles.find((a) => a.id === editingArticleId) || articles[0];
  const currentArticlePreview: Partial<Article> = {
    id: editingArticleId || activeArticle?.id || 'sample-art',
    title: artTitle || activeArticle?.title || 'Применение портативных КИМ типа «рука» в машиностроении',
    category: artCategory || activeArticle?.category || 'Статьи',
    date: artDate || activeArticle?.date || '22.08.2026',
    author: artAuthor || activeArticle?.author || 'Инженерный отдел ДС-Инжиниринг',
    readTime: activeArticle?.readTime || '7 мин',
    views: activeArticle?.views || 342,
    image: artImage || activeArticle?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    preview: artPreview || activeArticle?.preview || 'Обзор современных методов контроля геометрии и метрологических поверок на предприятиях РФ.',
    content: artContent || activeArticle?.content || '<p>Подробный инженерный анализ современных технологий координатно-измерительных машин типа «рука»...</p>',
    tags: activeArticle?.tags || ['КИМ', 'Метрология', 'Контроль качества'],
    brochureUrl: artBrochureUrl || (activeArticle as any)?.brochureUrl,
    fileUrl: artBrochureUrl || (activeArticle as any)?.fileUrl,
  };

  return (
    <div className="space-y-8">
      {/* If Code Editor is active, show it full-width */}
      {isArticleCodeEditorOpen ? (
        <ArticleCodeEditor
          initialArticle={articleForCodeEditor}
          onSave={handleSaveCodeArticle}
          onCancel={() => {
            setIsArticleCodeEditorOpen(false);
            setArticleForCodeEditor(null);
          }}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  CMS • ПРЕСС-ЦЕНТР И БАЗА ЗНАНИЙ
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Публикаций: {articles.length} | Регламентов: {knowledgeBase.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <span>Пресс-центр, Технические статьи и База знаний</span>
              </h3>
              <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                Управляйте публикациями, новостями компании и регламентами. Доступен предпросмотр в реальном времени, загрузка методических файлов и кодовый редактор HTML/JS.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCreateNewArticleInCodeEditor('Статьи')}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Code2 className="w-4 h-4" />
                <span>Написать в коде (HTML/JS)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetArticleForm();
                  setNewsSubSection('articles');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Новая статья</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetKnowledgeForm();
                  setNewsSubSection('knowledge');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Новый регламент</span>
              </button>
            </div>
          </div>

          {/* Unified 2-column layout: Left (4 cols) List, Right (8 cols) Editor + Live Preview */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column (4 cols): Navigation & Items List */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
                {/* Section Switcher pills */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewsSubSection('articles')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      newsSubSection === 'articles'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-500 hover:text-gray-900'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>Статьи и новости ({articles.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewsSubSection('knowledge')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      newsSubSection === 'knowledge'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-500 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>База знаний ({knowledgeBase.length})</span>
                  </button>
                </div>

                {newsSubSection === 'articles' ? (
                  <>
                    {/* Search & Category Filter */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={articleSearchQuery}
                          onChange={(e) => setArticleSearchQuery(e.target.value)}
                          placeholder="Поиск по статьям и авторам..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pb-1 text-[11px] no-scrollbar">
                        <button
                          type="button"
                          onClick={() => setArticleCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            articleCategoryFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                          }`}
                        >
                          Все ({articles.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleCategoryFilter('Статьи')}
                          className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                            articleCategoryFilter === 'Статьи'
                              ? 'bg-purple-700 text-white'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                          }`}
                        >
                          Статьи ({articles.filter((a) => a.category === 'Статьи').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleCategoryFilter('news')}
                          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            articleCategoryFilter === 'news'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                          }`}
                        >
                          Новости ({articles.filter((a) => a.category !== 'Статьи').length})
                        </button>
                      </div>
                    </div>

                    {/* Articles List */}
                    <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                      {articles
                        .filter((art) => {
                          const matchesCategory =
                            articleCategoryFilter === 'all'
                              ? true
                              : articleCategoryFilter === 'Статьи'
                                ? art.category === 'Статьи'
                                : art.category !== 'Статьи';
                          const matchesQuery =
                            !articleSearchQuery.trim() ||
                            art.title.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                            art.preview.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                            art.author?.toLowerCase().includes(articleSearchQuery.toLowerCase());
                          return matchesCategory && matchesQuery;
                        })
                        .map((art) => {
                          const isSelected = editingArticleId === art.id;
                          const isTechArticle = art.category === 'Статьи';
                          const hasHtml =
                            art.isHtml ||
                            (typeof art.content === 'string' &&
                              (art.content.includes('<script') || art.content.includes('<style') || art.content.includes('<div')));
                          return (
                            <div
                              key={art.id}
                              onClick={() => handleStartEditArticle(art)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  {art.image && (
                                    <img
                                      src={art.image}
                                      alt={art.title}
                                      className="w-14 h-11 rounded-lg object-cover shrink-0 border border-gray-200"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <span
                                        className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                                          isTechArticle
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-50 text-blue-700'
                                        }`}
                                      >
                                        {art.category}
                                      </span>
                                      {hasHtml && (
                                        <span className="px-1 py-0.5 text-[9px] font-mono font-bold bg-amber-50 text-amber-700 rounded flex items-center gap-0.5">
                                          <Code className="w-2.5 h-2.5" />
                                          <span>HTML</span>
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {art.date}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-xs line-clamp-1 leading-snug">
                                      {art.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      {art.preview}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditArticle(art)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Редактировать в визуальной форме"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditArticleInCodeEditor(art)}
                                    className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                    title="Редактировать в HTML-редакторе"
                                  >
                                    <Code2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateArticle(art)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Создать копию"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Удалить публикацию «${art.title}»?`)) {
                                        deleteArticle(art.id);
                                      }
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Удалить"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Search & Knowledge filters */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={knowSearchQuery}
                          onChange={(e) => setKnowSearchQuery(e.target.value)}
                          placeholder="Поиск по регламентам и ГОСТ..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pb-1 text-[11px] no-scrollbar">
                        {['all', 'ПО', 'Оборудование', 'Услуги', 'Разработка постпроцессоров'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setKnowCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                              knowCategoryFilter === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                            }`}
                          >
                            {cat === 'all' ? `Все (${knowledgeBase.length})` : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Knowledge List */}
                    <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                      {knowledgeBase
                        .filter((item) => {
                          const matchesCat = knowCategoryFilter === 'all' || item.category === knowCategoryFilter;
                          const matchesQuery =
                            !knowSearchQuery.trim() ||
                            item.title.toLowerCase().includes(knowSearchQuery.toLowerCase()) ||
                            item.summary.toLowerCase().includes(knowSearchQuery.toLowerCase());
                          return matchesCat && matchesQuery;
                        })
                        .map((item) => {
                          const isSelected = editingKnowledgeId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleStartEditKnowledge(item)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-slate-500 rounded">
                                    {item.category}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{item.title}</h4>
                                <p className="text-[11px] text-gray-500 line-clamp-1">{item.summary}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditKnowledge(item)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Редактировать"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Удалить регламент «${item.title}»?`)) {
                                      deleteKnowledgeItem(item.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column (8 cols): Toolbar + Editor + Live Preview */}
            <div className="xl:col-span-8 space-y-6">
              {/* Unified Mode Switcher Toolbar */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                {/* Left: View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setArticlesViewMode('split')}
                    className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      articlesViewMode === 'split'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-500 hover:text-gray-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Сплит-режим</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlesViewMode('editor')}
                    className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      articlesViewMode === 'editor'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-500 hover:text-gray-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Только редактор</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlesViewMode('preview')}
                    className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      articlesViewMode === 'preview'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-500 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Только предпросмотр</span>
                  </button>
                </div>

                {/* Right: Quick actions */}
                <div className="flex items-center gap-2">
                  {newsSubSection === 'articles' ? (
                    <>
                      {editingArticleId && (
                        <button
                          type="button"
                          onClick={() => {
                            const art = articles.find((a) => a.id === editingArticleId);
                            if (art) handleStartEditArticleInCodeEditor(art);
                          }}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 flex items-center gap-1 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Открыть в HTML-коде</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetArticleForm}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-500 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Сбросить</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetKnowledgeForm}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-500 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Сбросить</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Form */}
              {(articlesViewMode === 'split' || articlesViewMode === 'editor') && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
                  {newsSubSection === 'articles' ? (
                    /* ARTICLE FORM */
                    <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span>{editingArticleId ? 'Редактировать публикацию' : 'Создать новую публикацию'}</span>
                        </span>
                        {editingArticleId && (
                          <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono font-medium">
                            ID: {editingArticleId}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-500 mb-1">
                          Заголовок статьи / новости <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={artTitle}
                          onChange={(e) => setArtTitle(e.target.value)}
                          placeholder="Например: Внедрение оптического сканирования деталей сложной геометрии"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-500 mb-1">Раздел / Категория</label>
                          <select
                            value={artCategory}
                            onChange={(e) => setArtCategory(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Статьи">Технические статьи</option>
                            <option value="Новости">Новости компании</option>
                            <option value="Релизы ПО">Релизы ПО</option>
                            <option value="Кейсы">Кейсы внедрения</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-500 mb-1">Автор / Подразделение</label>
                          <input
                            type="text"
                            value={artAuthor}
                            onChange={(e) => setArtAuthor(e.target.value)}
                            placeholder="Инженерный отдел ДС‑Инжиниринг"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-500 mb-1">Дата публикации</label>
                          <input
                            type="text"
                            value={artDate}
                            onChange={(e) => setArtDate(e.target.value)}
                            placeholder="22.08.2026"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUploadField
                          label="Обложка публикации"
                          value={artImage}
                          onChange={setArtImage}
                          type="image"
                          placeholder="https://... или выберите файл"
                        />
                        <FileUploadField
                          label="Методические материалы / PDF / Брошюра"
                          value={artBrochureUrl}
                          onChange={setArtBrochureUrl}
                          type="document"
                          placeholder="URL или выберите файл (PDF, DOCX, ZIP)"
                          accept=".pdf,.doc,.docx,.zip,.rar,.step,.stp,.dwg"
                        />
                      </div>

                      <div>
                        <AutoResizeTextarea
                          label="Краткий анонс для каталога (preview)"
                          value={artPreview}
                          onChange={setArtPreview}
                          minRows={2}
                          placeholder="Краткое описание публикации для карточки в общем списке..."
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-slate-500">
                            Полное содержание публикации
                          </label>
                          <span className="text-[10px] text-gray-400">
                            Поддерживается Markdown и чистый HTML
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          value={artContent}
                          onChange={(e) => setArtContent(e.target.value)}
                          placeholder="Полный текст публикации, технические выкладки, описание опыта..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingArticleId ? 'Сохранить изменения' : 'Опубликовать материал'}</span>
                        </button>
                        {editingArticleId && (
                          <button
                            type="button"
                            onClick={handleResetArticleForm}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-500 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    /* KNOWLEDGE BASE FORM */
                    <form onSubmit={handleSaveKnowledge} className="space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <span className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{editingKnowledgeId ? 'Редактировать регламент' : 'Добавить регламент в базу знаний'}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleOpenKnowledgeInCodeEditor}
                            className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Открыть в HTML-коде</span>
                          </button>
                          {editingKnowledgeId && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono font-medium">
                              ID: {editingKnowledgeId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-500 mb-1">
                          Заголовок регламента / инструкции <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={knowTitle}
                          onChange={(e) => setKnowTitle(e.target.value)}
                          placeholder="Например: TopSolid'Mold 7: Проектирование литьевых форм"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-500 mb-1">
                            Раздел / Категория <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={knowCategory}
                            onChange={(e) => setKnowCategory(e.target.value as any)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                          >
                            <option value="ПО">Программное обеспечение (ПО)</option>
                            <option value="Оборудование">Метрологическое оборудование</option>
                            <option value="Услуги">Услуги и методики</option>
                            <option value="Разработка постпроцессоров">Разработка постпроцессоров</option>
                            <option value="Общие вопросы">Частые вопросы (FAQ)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-500 mb-1">Теги (через запятую)</label>
                          <input
                            type="text"
                            value={knowTags}
                            onChange={(e) => setKnowTags(e.target.value)}
                            placeholder="TopSolid, Метрология, ГОСТ"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-500 mb-1">
                          Краткое описание (summary) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={knowSummary}
                          onChange={(e) => setKnowSummary(e.target.value)}
                          placeholder="Краткая суть регламента для карточки в каталоге..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-500 mb-1">
                          Полное содержание регламента <span className="text-red-500">*</span> (Визуальный / Markdown / HTML редактор)
                        </label>
                        <RichTextEditor
                          content={knowContent}
                          onChange={setKnowContent}
                          minHeight="min-h-[220px]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingKnowledgeId ? 'Сохранить изменения' : 'Добавить в базу знаний'}</span>
                        </button>
                        {editingKnowledgeId && (
                          <button
                            type="button"
                            onClick={handleResetKnowledgeForm}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-500 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Live Visual Preview */}
              {(articlesViewMode === 'split' || articlesViewMode === 'preview') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Интерактивный Live-предпросмотр</span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Отображение в реальном времени
                    </span>
                  </div>

                  {newsSubSection === 'articles' ? (
                    <ArticleVisualPreview article={currentArticlePreview} viewMode={articlesViewMode} />
                  ) : (
                    /* KNOWLEDGE ITEM PREVIEW */
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800">
                            {knowCategory || 'ПО'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {editingKnowledgeId || 'kb-preview'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Регламент базы знаний
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-2">
                          {knowTitle || 'Заголовок регламента базы знаний'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                          {knowSummary || 'Краткое описание сути регламента и области его применения...'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Содержание регламента:
                        </div>
                        <div className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed font-mono">
                          {knowContent || 'Текст полного регламента, формулы, требования ГОСТ...'}
                        </div>
                      </div>

                      {knowTags && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {knowTags.split(',').map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
