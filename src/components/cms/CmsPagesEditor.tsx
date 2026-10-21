import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Save,
  Search,
  Columns,
  HelpCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Home,
  Laptop,
  HardDrive,
  Wrench,
  BookOpen,
  Newspaper,
  Building2,
  Phone,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomPage, CustomPageBlock, SYSTEM_PAGE_IDS } from '../../types';
import { DEFAULT_SYSTEM_PAGES } from '../../data/defaultPages';
import { PageVisualPreview } from './PageVisualPreview';
import { RichTextEditor } from './RichTextEditor';
import { FileUploadField } from '../common/FileUploadField';

// System default pages configuration
export const SYSTEM_SITE_PAGES = [
  { id: 'home', title: 'Главная страница', slug: '', icon: Home, desc: 'Первый экран, направления, преимущества и слайдер' },
  { id: 'software', title: 'Программное обеспечение (Каталог)', slug: 'software', icon: Laptop, desc: 'Каталог программного обеспечения' },
  { id: 'software-topsolid', title: 'ПО: TopSolid 7 CAD/CAM/PDM', slug: 'software/topsolid-7', icon: Laptop, desc: 'Страница комплексного CAD/CAM/PDM пакета TopSolid 7' },
  { id: 'software-polyworks', title: 'ПО: PolyWorks|Inspector™', slug: 'software/polyworks-inspector', icon: Laptop, desc: 'Страница универсальной платформы трехмерного контроля' },
  { id: 'software-geomagic-dx', title: 'ПО: Geomagic Design X', slug: 'software/geomagic-design-x', icon: Laptop, desc: 'Страница ПО для реверс-инжиниринга и параметризации' },
  { id: 'software-geomagic-cx', title: 'ПО: Geomagic Control X', slug: 'software/geomagic-control-x', icon: Laptop, desc: 'Страница автоматизированного контроля геометрии и GD&T' },
  { id: 'hardware', title: 'Измерительное оборудование', slug: 'hardware', icon: HardDrive, desc: 'Каталог оборудования и КИМ' },
  { id: 'services', title: 'Услуги и инжиниринг', slug: 'services', icon: Wrench, desc: 'Описание услуг, цены и калькулятор' },
  { id: 'knowledge', title: 'База знаний и ГОСТы', slug: 'knowledge', icon: BookOpen, desc: 'Статьи, технические руководства и документация' },
  { id: 'news', title: 'Новости', slug: 'news', icon: Newspaper, desc: 'События, выставки и релизы' },
  { id: 'about', title: 'О компании', slug: 'about', icon: Building2, desc: 'История, филиалы, сертификаты' },
  { id: 'contacts', title: 'Контакты', slug: 'contacts', icon: Phone, desc: 'Адреса офисов в Самаре и Тольятти, реквизиты, форма связи' }
];

export const CmsPagesEditor: React.FC = () => {
  const {
    customPages,
    addCustomPage,
    updateCustomPage,
    deleteCustomPage,
    navigateTo,
    showToast,
  } = useApp();

  const initialDefaultPage = DEFAULT_SYSTEM_PAGES[0];
  const [editingPageId, setEditingPageId] = useState<string | null>('home');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [pageTitle, setPageTitle] = useState(initialDefaultPage.title);
  const [pageMenuTitle, setPageMenuTitle] = useState(initialDefaultPage.menuTitle);
  const [pageSlug, setPageSlug] = useState(initialDefaultPage.slug);
  const [pageDesc, setPageDesc] = useState(initialDefaultPage.description);
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);
  const [pageBlocks, setPageBlocks] = useState<CustomPageBlock[]>(initialDefaultPage.blocks);

  // Page View mode & Visual Drag-and-Drop state
  const [pageViewMode, setPageViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [pagePreviewViewport, setPagePreviewViewport] = useState<'desktop' | 'mobile' | 'mobile-landscape'>('desktop');
  const [activePreviewBlockId, setActivePreviewBlockId] = useState<string | null>(null);
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null);

  // Pages filter and search
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [pageFilterType, setPageFilterType] = useState<'all' | 'system' | 'custom'>('all');

  // Start editing existing page
  const handleStartEditPage = (p: CustomPage) => {
    setEditingPageId(p.id);
    setIsCreatingPage(false);
    setPageTitle(p.title);
    setPageMenuTitle(p.menuTitle);
    setPageSlug(p.slug);
    setPageDesc(p.description);
    setShowInHeader(p.showInHeader);
    setShowInFooter(p.showInFooter);
    setPageBlocks(p.blocks);
    showToast(`Редактирование страницы: «${p.title}»`);
  };

  // Start editing a system page (loads authentic production blocks)
  const handleStartEditSystemPage = (sp: { id: string; title: string; slug: string; desc: string }) => {
    const existing = customPages.find((p) => p.id === sp.id || (sp.slug && p.slug === sp.slug));
    if (existing && existing.blocks && existing.blocks.length > 2) {
      handleStartEditPage(existing);
      return;
    }
    const def = DEFAULT_SYSTEM_PAGES.find((p) => p.id === sp.id || (sp.slug && p.slug === sp.slug));
    if (def) {
      handleStartEditPage(def);
      return;
    }
    if (existing) {
      handleStartEditPage(existing);
      return;
    }
    setEditingPageId(sp.id);
    setIsCreatingPage(false);
    setPageTitle(sp.title);
    setPageMenuTitle(sp.title);
    setPageSlug(sp.slug || 'main');
    setPageDesc(sp.desc);
    setShowInHeader(true);
    setShowInFooter(true);
    setPageBlocks(DEFAULT_SYSTEM_PAGES[0].blocks);
    showToast(`Редактирование системной страницы: «${sp.title}»`);
  };

  const handleResetPageForm = () => {
    setEditingPageId(null);
    setIsCreatingPage(true);
    setPageTitle('');
    setPageMenuTitle('');
    setPageSlug('');
    setPageDesc('');
    setShowInHeader(true);
    setShowInFooter(true);
    setPageBlocks([
      {
        id: `block-${Date.now()}`,
        type: 'hero',
        title: 'Заголовок новой страницы',
        subtitle: 'Подробное описание назначения и преимуществ предложения.',
        buttonText: 'Получить консультацию',
        buttonAction: 'contact',
      }
    ]);
  };

  const handleSavePage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim()) {
      showToast('Укажите заголовок и URL slug страницы');
      return;
    }

    const cleanSlug = pageSlug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const pageId = editingPageId || `custom-${cleanSlug}`;
    const existingPage = customPages.find((p) => p.id === pageId);
    const nowIso = new Date().toISOString();

    const pageObj: CustomPage = {
      id: pageId,
      slug: cleanSlug,
      title: pageTitle,
      menuTitle: pageMenuTitle || pageTitle,
      description: pageDesc,
      showInHeader,
      showInFooter,
      createdAt: existingPage?.createdAt || nowIso,
      updatedAt: nowIso,
      blocks: pageBlocks,
    };

    if (editingPageId) {
      updateCustomPage(editingPageId, pageObj);
      showToast(`Страница «${pageTitle}» успешно сохранена`);
    } else {
      addCustomPage(pageObj);
      setEditingPageId(pageId);
      setIsCreatingPage(false);
      showToast(`Страница «${pageTitle}» создана и сохранена в базу данных`);
    }
  };

  const handleAddBlock = (type: CustomPageBlock['type']) => {
    const newId = `block-${Date.now()}`;
    let newBlock: CustomPageBlock;

    switch (type) {
      case 'hero':
        newBlock = {
          id: newId,
          type: 'hero',
          title: 'Новый промо-блок',
          subtitle: 'Описание преимуществ и ключевых особенностей решения.',
          buttonText: 'Связаться со специалистом',
          buttonAction: 'contact',
        };
        break;
      case 'features':
        newBlock = {
          id: newId,
          type: 'features',
          title: 'Ключевые преимущества и компетенции',
          items: [
            'Аттестованная лаборатория: ГОСТ Р ИСО/МЭК 17025, поверенные средства измерений',
            'Высокая скорость решения задач: Выезд инженера в день обращения по Самарской области',
            'Официальный партнер: Авторизованный дистрибьютор и системный интегратор ПО',
          ],
        };
        break;
      case 'text':
        newBlock = {
          id: newId,
          type: 'text',
          title: 'Информационный раздел',
          content: 'Подробный технический текст с описанием регламентов, спецификаций или инструкций.',
        };
        break;
      case 'cta':
        newBlock = {
          id: newId,
          type: 'cta',
          title: 'Нужна помощь в подборе решения?',
          subtitle: 'Наши ведущие метрологи и CAD/CAM-инженеры подготовят коммерческое предложение.',
          buttonText: 'Заказать консультацию',
          buttonAction: 'contact',
        };
        break;
      default:
        newBlock = {
          id: newId,
          type: 'text',
          title: 'Текстовый блок',
          content: 'Содержимое блока...',
        };
    }

    setPageBlocks([...pageBlocks, newBlock]);
    showToast(`Добавлен блок: ${type.toUpperCase()}`);
  };

  const handleRemoveBlock = (blockId: string) => {
    setPageBlocks(pageBlocks.filter((b) => b.id !== blockId));
    showToast('Блок удален');
  };

  const handleUpdateBlock = (blockId: string, updated: Partial<CustomPageBlock>) => {
    setPageBlocks(pageBlocks.map((b) => (b.id === blockId ? { ...b, ...updated } : b)));
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const updated = [...pageBlocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(index - 1, 0, moved);
    setPageBlocks(updated);
  };

  const handleMoveBlockDown = (index: number) => {
    if (index >= pageBlocks.length - 1) return;
    const updated = [...pageBlocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + 1, 0, moved);
    setPageBlocks(updated);
  };

  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverBlockIdx !== index) {
      setDragOverBlockIdx(index);
    }
  };

  const handleBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIdx === null || draggedBlockIdx === targetIndex) {
      setDraggedBlockIdx(null);
      setDragOverBlockIdx(null);
      return;
    }

    const updated = [...pageBlocks];
    const [movedItem] = updated.splice(draggedBlockIdx, 1);
    updated.splice(targetIndex, 0, movedItem);
    setPageBlocks(updated);
    setDraggedBlockIdx(null);
    setDragOverBlockIdx(null);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockIdx(null);
    setDragOverBlockIdx(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left: List of all pages (System + Custom) */}
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Все страницы сайта
              </h3>
              <p className="text-[11px] text-gray-500">
                {SYSTEM_SITE_PAGES.length + customPages.length} страниц доступно для правки
              </p>
            </div>
            <button
              onClick={handleResetPageForm}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать новую</span>
            </button>
          </div>

          {/* Search & Filter pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                placeholder="Поиск по названию страницы..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setPageFilterType('all')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${pageFilterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}
              >
                Все ({SYSTEM_SITE_PAGES.length + customPages.filter((p) => !SYSTEM_PAGE_IDS.has(p.id)).length})
              </button>
              <button
                onClick={() => setPageFilterType('system')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${pageFilterType === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}
              >
                Основные ({SYSTEM_SITE_PAGES.length})
              </button>
              <button
                onClick={() => setPageFilterType('custom')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${pageFilterType === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}
              >
                Пользовательские ({customPages.filter((p) => !SYSTEM_PAGE_IDS.has(p.id)).length})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {/* System standard pages */}
            {(pageFilterType === 'all' || pageFilterType === 'system') && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-1">
                  Основные разделы сайта
                </div>
                {SYSTEM_SITE_PAGES
                  .filter((p) => !pageSearchQuery || p.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) || p.slug.toLowerCase().includes(pageSearchQuery.toLowerCase()))
                  .map((sp) => {
                    const IconComp = sp.icon;
                    const isEditing = editingPageId === sp.id;
                    return (
                      <div
                        key={sp.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isEditing
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 text-xs truncate">
                                {sp.title}
                              </div>
                              <div className="text-[10px] text-blue-600 font-mono truncate">
                                /{sp.slug}
                              </div>
                              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                {sp.desc}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => navigateTo(sp.id as any)}
                              title="Открыть страницу на сайте"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEditSystemPage(sp)}
                              title="Редактировать страницу в CMS"
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Ред.</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Custom created pages */}
            {(pageFilterType === 'all' || pageFilterType === 'custom') && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  Пользовательские страницы ({customPages.filter((p) => !SYSTEM_PAGE_IDS.has(p.id)).length})
                </div>
                {customPages.filter((p) => !SYSTEM_PAGE_IDS.has(p.id)).length === 0 ? (
                  <div className="p-3 text-center text-gray-400 text-xs bg-slate-50 rounded-xl">
                    Нет дополнительных страниц. Нажмите «Создать новую» выше.
                  </div>
                ) : (
                  customPages
                    .filter((p) => !SYSTEM_PAGE_IDS.has(p.id))
                    .filter((p) => !pageSearchQuery || p.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) || p.slug.toLowerCase().includes(pageSearchQuery.toLowerCase()))
                    .map((page) => (
                      <div
                        key={page.id}
                        className={`p-3 rounded-xl border transition-all ${
                          editingPageId === page.id
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs truncate">
                              {page.title}
                            </div>
                            <div className="text-[10px] text-blue-600 font-mono truncate">
                              /{page.slug}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => navigateTo(page.id as any)}
                              title="Открыть страницу на сайте"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEditPage(page)}
                              title="Редактировать страницу"
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Ред.</span>
                            </button>
                            <button
                              onClick={() => deleteCustomPage(page.id)}
                              title="Удалить страницу"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded ${page.showInHeader ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {page.showInHeader ? 'В меню шапки' : 'Скрыто в меню'}
                          </span>
                          <span>•</span>
                          <span>{page.blocks.length} блоков</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Инструкция к конструктору</span>
          </div>
          <p className="leading-relaxed">
            Нажмите кнопку <strong className="text-amber-950 font-bold">«Ред.»</strong> рядом с любой страницей в списке слева. Форма справа заполнится её содержимым, где вы сможете настроить текстовые блоки, списки и кнопки в реальном времени.
          </p>
        </div>
      </div>

      {/* Right: Page Builder Editor Form & Visual Live Preview */}
      <div className="xl:col-span-8 space-y-4">
        {/* Mode Switcher Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1.5">Режим:</span>
            <button
              type="button"
              onClick={() => setPageViewMode('split')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pageViewMode === 'split' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Сплит: Редактор + Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setPageViewMode('editor')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pageViewMode === 'editor' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Только редактор</span>
            </button>
            <button
              type="button"
              onClick={() => setPageViewMode('preview')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pageViewMode === 'preview' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Предпросмотр</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {editingPageId && (
              <button
                type="button"
                onClick={handleResetPageForm}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-gray-100 rounded-lg"
              >
                Отмена
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSavePage()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingPageId ? 'Сохранить изменения' : 'Опубликовать'}</span>
            </button>
          </div>
        </div>

        {/* Layout Content based on View Mode */}
        {!editingPageId && !isCreatingPage ? (
          <div className="w-full bg-white rounded-xl p-12 border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center min-h-[500px]">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Выберите страницу для редактирования</h3>
            <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
              Выберите страницу из списка слева для изменения блоков контента, или нажмите кнопку <strong>«Создать новую»</strong>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Form Editor */}
            {pageViewMode !== 'preview' && (
              <div className="w-full space-y-6">
                <form onSubmit={handleSavePage} className="bg-white rounded-xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {editingPageId ? 'Редактирование параметров страницы' : 'Создание новой страницы сайта'}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Настройте метаданные и порядок блоков контента
                      </p>
                    </div>
                  </div>

                  {/* Main page metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Заголовок страницы (H1) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="Например: Реверс-инжиниринг и контроль геометрии"
                        className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Название в меню сайта <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={pageMenuTitle}
                        onChange={(e) => setPageMenuTitle(e.target.value)}
                        placeholder="Например: Реверс-инжиниринг"
                        className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        URL Slug (адрес ссылки) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-xs text-gray-500 font-mono">
                          /
                        </span>
                        <input
                          type="text"
                          value={pageSlug}
                          onChange={(e) => setPageSlug(e.target.value)}
                          placeholder="reverse-engineering"
                          className="w-full px-4 py-2 text-xs rounded-r-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Краткое описание (SEO Meta Description)
                      </label>
                      <input
                        type="text"
                        value={pageDesc}
                        onChange={(e) => setPageDesc(e.target.value)}
                        placeholder="Услуги высокоточного 3D-сканирования и построения CAD-моделей..."
                        className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showInHeader}
                        onChange={(e) => setShowInHeader(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-slate-500 font-medium">Отображать в верхнем меню (шапке)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showInFooter}
                        onChange={(e) => setShowInFooter(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-slate-500 font-medium">Отображать в подвале сайта (футере)</span>
                    </label>
                  </div>

                  {/* Page Blocks Management */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          Блоки контента страницы ({pageBlocks.length})
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Добавляйте, редактируйте и меняйте порядок блоков
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleAddBlock('hero')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          + Промо (Hero)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('features')}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          + Преимущества
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('text')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          + Текст
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('cta')}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          + Призыв (CTA)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {pageBlocks.map((block, idx) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={(e) => handleBlockDragStart(e, idx)}
                          onDragOver={(e) => handleBlockDragOver(e, idx)}
                          onDrop={(e) => handleBlockDrop(e, idx)}
                          onDragEnd={handleBlockDragEnd}
                          className={`p-4 rounded-xl border bg-slate-50/50 space-y-3 transition-all ${
                            dragOverBlockIdx === idx
                              ? 'border-blue-500 ring-2 ring-blue-400/30'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-slate-500">
                                <GripVertical className="w-4 h-4" />
                              </span>
                              <span className="w-5 h-5 rounded-md bg-white border text-center leading-5 text-[10px] font-bold text-slate-500">
                                {idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                                {block.type}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">
                                {block.title || 'Без названия'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveBlockUp(idx)}
                                disabled={idx === 0}
                                className="p-1 text-gray-400 hover:text-slate-500 disabled:opacity-30 rounded"
                                title="Переместить выше"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveBlockDown(idx)}
                                disabled={idx === pageBlocks.length - 1}
                                className="p-1 text-gray-400 hover:text-slate-500 disabled:opacity-30 rounded"
                                title="Переместить ниже"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveBlock(block.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded ml-1"
                                title="Удалить блок"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block edit fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Заголовок блока
                              </label>
                              <input
                                type="text"
                                value={block.title || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>

                            {(block.type === 'hero' || block.type === 'cta') && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                  Текст на кнопке
                                </label>
                                <input
                                  type="text"
                                  value={block.buttonText || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { buttonText: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
                                />
                              </div>
                            )}

                            {(block.type === 'hero' || block.type === 'cta') && (
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                  Подзаголовок / Описание
                                </label>
                                <input
                                  type="text"
                                  value={block.subtitle || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { subtitle: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
                                />
                              </div>
                            )}

                            {block.type === 'text' && (
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                  Текстовое содержание блока
                                </label>
                                <textarea
                                  rows={4}
                                  value={block.content || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-mono"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Live Preview Panel */}
            {(pageViewMode === 'split' || pageViewMode === 'preview') && (
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Интерактивный Live-предпросмотр
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPagePreviewViewport('desktop')}
                      className={`p-1.5 rounded-lg ${pagePreviewViewport === 'desktop' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-400 hover:text-slate-500'}`}
                      title="Вид для компьютера"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPagePreviewViewport('mobile')}
                      className={`p-1.5 rounded-lg ${pagePreviewViewport === 'mobile' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-400 hover:text-slate-500'}`}
                      title="Мобильный вид"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={`mx-auto transition-all ${pagePreviewViewport === 'mobile' ? 'max-w-sm border-x border-gray-300' : 'w-full'}`}>
                  <PageVisualPreview
                    pageId={editingPageId || 'home'}
                    pageTitle={pageTitle}
                    pageDesc={pageDesc}
                    pageSlug={pageSlug}
                    blocks={pageBlocks}
                    viewportMode={pagePreviewViewport}
                    activeBlockId={activePreviewBlockId}
                    onSelectBlock={setActivePreviewBlockId}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
