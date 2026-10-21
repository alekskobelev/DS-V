import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  MessageSquare,
  Play,
  Image as ImageIcon,
  Star,
  Quote,
  Maximize2,
  X,
  Send,
  UserCheck,
  Building2,
  ExternalLink,
  GripVertical,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Edit3,
  Layers,
  Globe,
  Compass,
  Laptop,
  HardDrive,
  Wrench,
  BookOpen,
  Newspaper
} from 'lucide-react';
import { CustomPageBlock, PageCommentItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { HomePage } from '../../pages/HomePage';
import { SoftwarePage } from '../../pages/SoftwarePage';
import { HardwarePage } from '../../pages/HardwarePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { KnowledgeBasePage } from '../../pages/KnowledgeBasePage';
import { NewsPage } from '../../pages/NewsPage';
import { AboutPage } from '../../pages/AboutPage';
import { ContactsPage } from '../../pages/ContactsPage';
import { CustomPageView } from '../../pages/CustomPageView';

interface PageVisualPreviewProps {
  pageId?: string;
  pageTitle: string;
  pageDesc?: string;
  pageSlug?: string;
  blocks: CustomPageBlock[];
  activeBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onReorderBlocks?: (newBlocks: CustomPageBlock[]) => void;
  onActionClick?: (action?: string) => void;
  viewportMode?: 'desktop' | 'mobile' | 'mobile-landscape';
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onViewportChange?: (mode: 'desktop' | 'mobile' | 'mobile-landscape') => void;
  interactive?: boolean;
}

function getVideoEmbed(url: string): { type: 'iframe' | 'video' | 'empty'; src: string } {
  if (!url || !url.trim()) return { type: 'empty', src: '' };
  const trimmed = url.trim();

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  }

  // RuTube
  const rutubeMatch = trimmed.match(/rutube\.ru\/(?:video|play\/embed)\/([a-zA-Z0-9]+)/i);
  if (rutubeMatch && rutubeMatch[1]) {
    return { type: 'iframe', src: `https://rutube.ru/play/embed/${rutubeMatch[1]}/` };
  }

  // VK Video
  if (trimmed.includes('vk.com/video_ext.php') || trimmed.includes('vkvideo.ru/video_ext.php')) {
    return { type: 'iframe', src: trimmed };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[3]}` };
  }

  // Direct video file (MP4, WebM, OGG)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { type: 'video', src: trimmed };
  }

  return { type: 'iframe', src: trimmed };
}

export const PageVisualPreview: React.FC<PageVisualPreviewProps> = ({
  pageId,
  pageTitle,
  pageDesc,
  pageSlug,
  blocks,
  activeBlockId,
  onSelectBlock,
  onReorderBlocks,
  onActionClick,
  viewportMode = 'desktop',
  isFullScreen,
  onToggleFullScreen,
  onViewportChange,
  interactive = true,
}) => {
  const { navigateTo } = useApp();
  const [previewMode, setPreviewMode] = useState<'live' | 'blocks'>('live');
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const renderLiveContent = () => {
    const normId = (pageId || '').toLowerCase();
    const normSlug = (pageSlug || '').toLowerCase();

    if (normId === 'home' || normSlug === '' || normSlug === 'main' || normSlug === 'home') {
      return <HomePage />;
    }
    if (normId.startsWith('software') || normSlug.startsWith('software')) {
      return <SoftwarePage />;
    }
    if (normId.startsWith('hardware') || normSlug.startsWith('hardware')) {
      return <HardwarePage />;
    }
    if (normId.startsWith('services') || normSlug.startsWith('services')) {
      return <ServicesPage />;
    }
    if (normId.startsWith('knowledge') || normSlug.startsWith('knowledge')) {
      return <KnowledgeBasePage />;
    }
    if (normId.startsWith('news') || normSlug.startsWith('news')) {
      return <NewsPage />;
    }
    if (normId.startsWith('about') || normSlug.startsWith('about')) {
      return <AboutPage />;
    }
    if (normId.startsWith('contacts') || normSlug.startsWith('contacts')) {
      return <ContactsPage />;
    }

    return (
      <CustomPageView
        page={{
          id: pageId || 'custom-page',
          slug: pageSlug || '',
          title: pageTitle || 'Страница',
          menuTitle: pageTitle || 'Страница',
          description: pageDesc || '',
          showInHeader: true,
          showInFooter: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks: blocks || [],
        }}
      />
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !onReorderBlocks) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...blocks];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onReorderBlocks(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const viewportWidthClass = 
    viewportMode === 'mobile' ? 'max-w-[390px]' :
    viewportMode === 'mobile-landscape' ? 'max-w-[844px]' :
    'w-full';

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-700/80 overflow-hidden shadow-sm">
      {/* Top Preview Bar with Viewport Controls & Mode Switcher */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* Mode switcher pills */}
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setPreviewMode('live')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Живой сайт (Текущее состояние)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('blocks')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'blocks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Кастомные блоки ({blocks.length})</span>
            </button>
          </div>

          {pageSlug && (
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              /{pageSlug}
            </span>
          )}
        </div>

        {/* Viewport device switcher */}
        {onViewportChange && (
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => onViewportChange?.('desktop')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewportMode === 'desktop' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Десктоп (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ПК</span>
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button
              type="button"
              onClick={() => onViewportChange?.(viewportMode === 'mobile' ? 'mobile-landscape' : 'mobile')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewportMode.startsWith('mobile')
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title={viewportMode === 'mobile' ? "Повернуть (Ландшафт)" : "Мобильный (390px)"}
            >
              <Smartphone className={`w-3.5 h-3.5 transition-transform ${viewportMode === 'mobile-landscape' ? '-rotate-90' : ''}`} />
              <span className="hidden sm:inline">Мобильный</span>
            </button>
            
            {onToggleFullScreen && (
              <>
                <div className="w-px h-4 bg-slate-600 mx-1"></div>
                <button
                  type="button"
                  onClick={onToggleFullScreen}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    isFullScreen
                      ? 'bg-amber-500 text-slate-900 shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title={isFullScreen ? "Свернуть" : "На весь экран"}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{isFullScreen ? 'Свернуть' : 'На весь экран'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-950/40">
        <div className={`transition-all duration-300 w-full ${viewportWidthClass} bg-slate-50 rounded-xl shadow-sm border border-gray-300 overflow-hidden flex flex-col`}>
          {/* Simulated Browser Bar */}
          <div className="bg-slate-200 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-2.5 py-1 text-[11px] text-slate-500 font-mono flex items-center justify-between border border-gray-300 shadow-inner truncate">
              <span className="truncate">https://ds-engineering.ru/{pageSlug || 'custom-page'}</span>
              <span className="text-[10px] text-gray-400 shrink-0 ml-2">Предпросмотр</span>
            </div>
          </div>

          {/* Breadcrumb / Page Title */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="hover:text-blue-600 cursor-pointer">Главная</span>
              <span>/</span>
              <span className="font-semibold text-gray-900 truncate">{pageTitle || 'Без названия'}</span>
            </div>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-100">
              «ДС‑Инжиниринг»
            </span>
          </div>

          {/* Rendered Body Container */}
          {previewMode === 'live' ? (
            <div className="bg-white min-h-[500px] flex-1 overflow-y-auto">
              {renderLiveContent()}
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
              {blocks.length === 0 ? (
              <div className="py-10 text-center text-gray-400 space-y-3">
                <Layers className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-500">На странице пока нет блоков</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Добавьте баннер, видео, галерею или текстовый блок в редакторе слева.
                </p>
              </div>
            ) : (
              blocks.map((block, index) => {
                const isActive = activeBlockId === block.id;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={block.id}
                    draggable={interactive}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectBlock?.(block.id)}
                    className={`relative group rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'ring-2 ring-blue-500 shadow-md' 
                        : 'hover:ring-2 hover:ring-blue-300'
                    } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${
                      isDragOver ? 'border-t-4 border-t-blue-500 pt-2' : ''
                    }`}
                  >
                    {/* Block Toolbar / Drag handle indicator */}
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-lg pointer-events-auto">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab active:cursor-grabbing" />
                      <span className="uppercase text-[10px] text-amber-300">{block.type}</span>
                      <span className="text-slate-400">#{index + 1}</span>
                      {onSelectBlock && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(block.id);
                          }}
                          className="hover:text-blue-300 ml-1 p-0.5"
                          title="Редактировать этот блок"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* 1. HERO BLOCK */}
                    {block.type === 'hero' && (
                      <div 
                        className="relative rounded-xl overflow-hidden p-6 sm:p-8 text-white min-h-[260px] flex flex-col justify-center bg-cover bg-center shadow-sm"
                        style={{
                          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.88)), url('${block.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'}')`
                        }}
                      >
                        <div className="relative z-10 max-w-xl space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 rounded-full text-[11px] font-semibold text-blue-200">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>ДС‑Инжиниринг • Официальный портал</span>
                          </div>
                          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                            {block.title || pageTitle}
                          </h2>
                          {block.subtitle && (
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              {block.subtitle}
                            </p>
                          )}
                          {block.buttonText && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => onActionClick?.(block.buttonAction)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-amber-500 text-gray-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                              >
                                <span>{block.buttonText}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. FEATURES BLOCK */}
                    {block.type === 'features' && (
                      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
                        {block.title && (
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            {block.title}
                          </h3>
                        )}
                        {block.items && block.items.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {block.items.filter(Boolean).map((item, iIdx) => (
                              <div key={iIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-gray-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-500 font-medium leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. TEXT BLOCK */}
                    {block.type === 'text' && (
                      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3">
                        {block.title && (
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            {block.title}
                          </h3>
                        )}
                        <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                          {block.content || 'Текст раздела...'}
                        </div>
                      </div>
                    )}

                    {/* 4. VIDEO BLOCK */}
                    {block.type === 'video' && (() => {
                      const videoData = getVideoEmbed(block.videoUrl || '');
                      return (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3">
                          {block.title && (
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                {block.title}
                              </h3>
                              {block.subtitle && (
                                <p className="text-[11px] text-gray-500 mt-0.5">{block.subtitle}</p>
                              )}
                            </div>
                          )}
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner border border-gray-200">
                            {videoData.type === 'iframe' && videoData.src ? (
                              <iframe
                                src={videoData.src}
                                title={block.title || 'Видео'}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : videoData.type === 'video' && videoData.src ? (
                              <video
                                src={videoData.src}
                                poster={block.videoPoster}
                                controls
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center space-y-2">
                                <Play className="w-10 h-10 text-gray-500 opacity-60" />
                                <div className="text-[11px]">Видео: {block.videoUrl || 'Укажите URL в редакторе'}</div>
                              </div>
                            )}
                          </div>
                          {(block.videoCaption || block.content) && (
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {block.videoCaption || block.content}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* 5. IMAGE BLOCK */}
                    {block.type === 'image' && (
                      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3">
                        {block.title && (
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            {block.title}
                          </h3>
                        )}
                        <div className={`flex flex-col ${block.imageAlign === 'center' ? 'items-center text-center' : block.imageAlign === 'left' ? 'items-start text-left' : block.imageAlign === 'right' ? 'items-end text-right' : 'w-full'}`}>
                          {block.image ? (
                            <div 
                              className="relative group/img cursor-pointer rounded-xl overflow-hidden shadow-sm max-w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage({ url: block.image!, caption: block.caption || block.title });
                              }}
                            >
                              <img
                                src={block.image}
                                alt={block.title || 'Изображение'}
                                className="max-h-[360px] w-auto object-cover rounded-xl"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-semibold">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Увеличить</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-36 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                              <ImageIcon className="w-6 h-6 mr-1.5 opacity-50" />
                              <span>Изображение не загружено</span>
                            </div>
                          )}
                          {block.caption && (
                            <p className="text-[11px] text-gray-500 italic mt-2 max-w-lg">
                              {block.caption}
                            </p>
                          )}
                          {block.content && (
                            <div className="text-xs text-slate-500 leading-relaxed mt-2 text-left whitespace-pre-line">
                              {block.content}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 6. GALLERY BLOCK */}
                    {block.type === 'gallery' && (() => {
                      const images = block.galleryImages || (block.items ? block.items.map(url => ({ url, caption: '' })) : []);
                      return (
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
                          <div>
                            {block.title && (
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                {block.title}
                              </h3>
                            )}
                            {block.subtitle && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{block.subtitle}</p>
                            )}
                          </div>
                          {images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {images.map((imgObj, gIdx) => (
                                <div
                                  key={gIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage({ url: imgObj.url, caption: imgObj.caption || `Фото ${gIdx + 1}` });
                                  }}
                                  className="group/gal relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer aspect-4/3 shadow-xs hover:shadow-md transition-all"
                                >
                                  <img
                                    src={imgObj.url}
                                    alt={imgObj.caption || `Фото ${gIdx + 1}`}
                                    className="w-full h-full object-cover group-hover/gal:scale-105 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/gal:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-[10px]">
                                    {imgObj.caption && <span className="line-clamp-1 font-medium">{imgObj.caption}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-400 bg-slate-50 rounded-xl text-xs">
                              В галерее пока нет фото. Укажите ссылки в редакторе.
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 7. COMMENTS BLOCK */}
                    {block.type === 'comments' && (
                      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <span>{block.title || 'Отзывы и мнения специалистов'}</span>
                            </h3>
                            {block.subtitle && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{block.subtitle}</p>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                            Отзывов: {block.comments?.length || 0}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {(block.comments || []).map((comm) => (
                            <div key={comm.id} className="p-3.5 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {comm.author.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gray-900 text-xs">{comm.author}</span>
                                      {comm.verified && (
                                        <span className="px-1 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-semibold rounded border border-emerald-200">
                                          Проверен
                                        </span>
                                      )}
                                    </div>
                                    {(comm.company || comm.role) && (
                                      <div className="text-[10px] text-gray-500">
                                        {comm.company} {comm.role ? `• ${comm.role}` : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center text-amber-400">
                                  {Array.from({ length: 5 }).map((_, rIdx) => (
                                    <Star
                                      key={rIdx}
                                      className={`w-3 h-3 ${rIdx < (comm.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {comm.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 8. QUOTE BLOCK */}
                    {block.type === 'quote' && (
                      <div className="bg-amber-50/70 border-l-4 border-amber-500 rounded-r-2xl p-4 sm:p-5 space-y-2">
                        <Quote className="w-5 h-5 text-amber-500 opacity-60" />
                        <p className="text-xs sm:text-sm text-gray-800 italic leading-relaxed">
                          «{block.content || 'Цитата...'}»
                        </p>
                        {block.subtitle && (
                          <div className="text-[11px] font-bold text-amber-900 pt-1">
                            — {block.subtitle}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 9. CTA BLOCK */}
                    {block.type === 'cta' && (
                      <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                        <div className="space-y-1 text-center sm:text-left">
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            {block.title || 'Готовы обсудить проект?'}
                          </h3>
                          <p className="text-xs text-blue-200">
                            {block.subtitle || 'Свяжитесь с нашими инженерами для расчета стоимости и сроков'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onActionClick?.(block.buttonAction)}
                          className="px-5 py-2.5 bg-[#F59E0B] hover:bg-amber-500 text-gray-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
                        >
                          {block.buttonText || 'Оставить заявку'}
                        </button>
                      </div>
                    )}

                    {/* 10. HTML BLOCK */}
                    {block.type === 'html' && (
                      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-2">
                        {block.title && (
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            {block.title}
                          </h3>
                        )}
                        {block.htmlContent ? (
                          <div
                            className="prose prose-xs max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: block.htmlContent }}
                          />
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg text-xs text-gray-400 text-center">
                            HTML код пуст.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal in Preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-1 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || ''}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-sm"
              referrerPolicy="no-referrer"
            />
            {selectedImage.caption && (
              <div className="mt-2 text-white text-xs font-medium text-center bg-black/60 px-4 py-1.5 rounded-lg">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
