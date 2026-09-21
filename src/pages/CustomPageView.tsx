import React, { useState, useMemo } from 'react';
import { Scrollspy } from '../components/common/Scrollspy';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Phone, 
  MessageSquare,
  Edit3,
  Calendar,
  Play,
  Image as ImageIcon,
  Star,
  Quote,
  Maximize2,
  X,
  Send,
  UserCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { CustomPage, CustomPageBlock, PageCommentItem } from '../types';
import { useApp } from '../context/AppContext';
import { usePageVisits } from '../hooks/usePageVisits';
import { useSEO } from '../hooks/useSEO';

interface CustomPageViewProps {
  page: CustomPage;
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

export const CustomPageView: React.FC<CustomPageViewProps> = ({ page }) => {
  const { openContactModal, navigateTo, updateCustomPage, showToast } = useApp();

  useSEO({
    title: page.metaTitle || page.title,
    description: page.metaDescription || `Страница ${page.title} - ДС-Инжиниринг`,
    keywords: page.metaKeywords?.join(', '),
  });

  // Track visits to custom pages in localStorage
  usePageVisits(page.id, page.title);

  // Lightbox Modal state
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string } | null>(null);

  // New Comment Form states per block
  const [commentForms, setCommentForms] = useState<{
    [blockId: string]: { author: string; company: string; role: string; content: string; rating: number };
  }>({});

  const handleAction = (action?: string) => {
    if (action === 'contact') {
      openContactModal({ title: `Заявка со страницы: ${page.title}` });
    } else if (action === 'software') {
      navigateTo('software');
    } else if (action === 'hardware') {
      navigateTo('hardware');
    } else if (action === 'services') {
      navigateTo('services');
    } else {
      openContactModal({ title: `Консультация: ${page.title}` });
    }
  };

  const handleCommentFormChange = (blockId: string, field: string, value: any) => {
    setCommentForms((prev) => ({
      ...prev,
      [blockId]: {
        ...(prev[blockId] || { author: '', company: '', role: '', content: '', rating: 5 }),
        [field]: value,
      },
    }));
  };

  const handleSubmitComment = (blockId: string) => {
    const formData = commentForms[blockId];
    if (!formData || !formData.author.trim() || !formData.content.trim()) {
      showToast('Пожалуйста, заполните ваше имя и текст комментария/отзыва');
      return;
    }

    const newComment: PageCommentItem = {
      id: `comm-${Date.now()}`,
      author: formData.author.trim(),
      company: formData.company.trim() || undefined,
      role: formData.role.trim() || undefined,
      content: formData.content.trim(),
      rating: formData.rating || 5,
      date: new Date().toLocaleDateString('ru-RU'),
      verified: true,
    };

    const updatedBlocks = page.blocks.map((b) => {
      if (b.id === blockId) {
        return {
          ...b,
          comments: [...(b.comments || []), newComment],
        };
      }
      return b;
    });

    updateCustomPage(page.id, {
      blocks: updatedBlocks,
      updatedAt: new Date().toLocaleDateString('ru-RU'),
    });

    // Reset form
    setCommentForms((prev) => ({
      ...prev,
      [blockId]: { author: '', company: '', role: '', content: '', rating: 5 },
    }));

    showToast('Ваш комментарий/отзыв успешно опубликован!');
  };

  const scrollSections = useMemo(() => {
    if (!page.blocks || page.blocks.length <= 1) return [];
    return page.blocks.map((block, idx) => {
      let label = block.title || (
        block.type === 'hero' ? 'Главный баннер' :
        block.type === 'features' ? 'Преимущества' :
        block.type === 'text' ? 'Описание' :
        block.type === 'gallery' ? 'Фотогалерея' :
        block.type === 'video' ? 'Видео' :
        block.type === 'cta' ? 'Форма связи' :
        block.type === 'comments' ? 'Отзывы' : `Раздел ${idx + 1}`
      );
      if (label.length > 25) label = label.slice(0, 22) + '...';
      return { id: `custom-block-${block.id}`, label };
    });
  }, [page.blocks]);

  return (
    <div className="flex-1 w-full bg-slate-50 pb-20">
      {scrollSections.length > 1 && <Scrollspy sections={scrollSections} />}
      {/* Top Admin quick edit */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto flex items-center justify-end text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="w-3 h-3" />
              Обновлено: {page.updatedAt || page.createdAt}
            </span>
            <button
              onClick={() => navigateTo('cms')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded font-medium text-[11px] transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Редактировать страницу в CMS
            </button>
          </div>
        </div>
      </div>

      {/* Render Blocks */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {page.blocks.map((block) => {
          // 1. HERO BLOCK
          if (block.type === 'hero') {
            return (
              <div 
                key={block.id}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] text-white p-5 sm:p-6 shadow-sm"
              >
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold text-blue-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>ДС‑Инжиниринг • Официальный портал</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                    {block.title || page.title}
                  </h1>
                  {block.subtitle && (
                    <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                      {block.subtitle}
                    </p>
                  )}
                  {block.buttonText && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleAction(block.buttonAction)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#F59E0B] hover:bg-amber-500 text-gray-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{block.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {block.image && (
                  <div className="hidden md:block absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden opacity-30 mix-blend-luminosity">
                    <img 
                      src={block.image} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            );
          }

          // 2. FEATURES BLOCK
          if (block.type === 'features') {
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
                {block.title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {block.title}
                  </h2>
                )}
                {block.items && block.items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {block.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/70">
                        <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-800 font-medium leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // 3. TEXT BLOCK
          if (block.type === 'text') {
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
                {block.title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {block.title}
                  </h2>
                )}
                <div className="text-sm text-slate-500 leading-relaxed whitespace-pre-line space-y-2">
                  {block.content}
                </div>
              </div>
            );
          }

          // 4. CTA BLOCK
          if (block.type === 'cta') {
            return (
              <div 
                key={block.id} 
                className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg border border-blue-800"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {block.title || 'Нужна дополнительная информация?'}
                  </h3>
                  {block.subtitle && (
                    <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
                      {block.subtitle}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => handleAction(block.buttonAction)}
                    className="px-6 py-3 bg-[#F59E0B] hover:bg-amber-500 text-gray-950 font-bold rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    {block.buttonText || 'Оставить заявку'}
                  </button>
                </div>
              </div>
            );
          }

          // 5. QUOTE BLOCK
          if (block.type === 'quote') {
            return (
              <div key={block.id} className="bg-amber-50/70 border-l-4 border-amber-500 rounded-r-2xl p-6 space-y-2">
                {block.title && <h4 className="font-bold text-gray-900 text-base">{block.title}</h4>}
                <p className="text-sm text-slate-500 italic leading-relaxed">
                  «{block.content}»
                </p>
                {block.subtitle && (
                  <div className="text-xs font-semibold text-slate-500 text-right">
                    — {block.subtitle}
                  </div>
                )}
              </div>
            );
          }

          // 6. VIDEO BLOCK (YouTube, RuTube, VK, Vimeo, Direct MP4)
          if (block.type === 'video') {
            const videoData = getVideoEmbed(block.videoUrl || '');
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
                {block.title && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                      {block.title}
                    </h2>
                    {block.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{block.subtitle}</p>
                    )}
                  </div>
                )}

                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner border border-gray-200">
                  {videoData.type === 'iframe' && videoData.src ? (
                    <iframe
                      src={videoData.src}
                      title={block.title || 'Видео'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : videoData.type === 'video' && videoData.src ? (
                    <video
                      src={videoData.src}
                      poster={block.videoPoster}
                      controls
                      className="w-full h-full object-cover"
                    >
                      Ваш браузер не поддерживает встроенное видео.
                    </video>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-2">
                      <Play className="w-12 h-12 text-gray-500 opacity-60" />
                      <div className="text-xs">Ссылка на видео не указана или не настроена в CMS</div>
                    </div>
                  )}
                </div>

                {(block.videoCaption || block.content) && (
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                    {block.videoCaption || block.content}
                  </p>
                )}
              </div>
            );
          }

          // 7. SINGLE IMAGE BLOCK
          if (block.type === 'image') {
            const align = block.imageAlign || 'center';
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
                {block.title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {block.title}
                  </h2>
                )}

                <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'w-full'}`}>
                  {block.image ? (
                    <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md max-w-full" onClick={() => setSelectedImage({ url: block.image!, caption: block.caption || block.title })}>
                      <img
                        src={block.image}
                        alt={block.title || 'Изображение'}
                        className="max-h-[500px] w-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Увеличить</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                      <ImageIcon className="w-8 h-8 mr-2 opacity-50" />
                      <span>Изображение не загружено</span>
                    </div>
                  )}

                  {block.caption && (
                    <p className="text-xs text-gray-500 italic mt-2.5 max-w-2xl">
                      {block.caption}
                    </p>
                  )}

                  {block.content && (
                    <div className="text-sm text-slate-500 leading-relaxed mt-3 w-full text-left whitespace-pre-line">
                      {block.content}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 8. IMAGE GALLERY BLOCK
          if (block.type === 'gallery') {
            const images = block.galleryImages || (block.items ? block.items.map(url => ({ url, caption: '' })) : []);
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
                <div>
                  {block.title && (
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                      {block.title}
                    </h2>
                  )}
                  {block.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{block.subtitle}</p>
                  )}
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((imgObj, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage({ url: imgObj.url, caption: imgObj.caption || `Фото ${idx + 1}` })}
                        className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer aspect-4/3 shadow-xs hover:shadow-md transition-all"
                      >
                        <img
                          src={imgObj.url}
                          alt={imgObj.caption || `Изображение ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                          {imgObj.caption && (
                            <p className="text-xs font-medium leading-tight line-clamp-2">{imgObj.caption}</p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-blue-200 mt-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>Нажмите для увеличения</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-slate-50 rounded-xl text-xs">
                    В галерее пока нет добавленных фотографий.
                  </div>
                )}

                {block.content && (
                  <p className="text-sm text-slate-500 leading-relaxed pt-2">
                    {block.content}
                  </p>
                )}
              </div>
            );
          }

          // 9. COMMENTS & REVIEWS BLOCK
          if (block.type === 'comments') {
            const commentsList = block.comments || [];
            const form = commentForms[block.id] || { author: '', company: '', role: '', content: '', rating: 5 };

            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      <span>{block.title || 'Отзывы и комментарии клиентов'}</span>
                    </h2>
                    {block.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{block.subtitle}</p>
                    )}
                  </div>
                  <div className="text-xs font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100">
                    Всего отзывов: {commentsList.length}
                  </div>
                </div>

                {/* List of comments */}
                <div className="space-y-4">
                  {commentsList.length > 0 ? (
                    commentsList.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-5 rounded-xl bg-slate-50 border border-gray-200 space-y-3 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {comm.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{comm.author}</span>
                                {comm.verified && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    <UserCheck className="w-3 h-3" />
                                    <span>Проверен</span>
                                  </span>
                                )}
                              </div>
                              {(comm.company || comm.role) && (
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                  {comm.company && <span className="font-medium text-slate-500">{comm.company}</span>}
                                  {comm.company && comm.role && <span>•</span>}
                                  {comm.role && <span>{comm.role}</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {comm.rating && (
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {Array.from({ length: 5 }).map((_, rIdx) => (
                                  <Star
                                    key={rIdx}
                                    className={`w-3.5 h-3.5 ${
                                      rIdx < comm.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-[10px] text-gray-400">{comm.date}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                          {comm.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 bg-slate-50 rounded-xl text-xs">
                      Пока нет комментариев или отзывов. Вы можете стать первым!
                    </div>
                  )}
                </div>

                {/* Form to add a new comment */}
                {block.allowNewComments !== false && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-blue-50/50 rounded-xl p-5 sm:p-6 border border-blue-100 space-y-4">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-600" />
                        <span>Оставить свой отзыв или комментарий</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Ваше имя / ФИО <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.author}
                            onChange={(e) => handleCommentFormChange(block.id, 'author', e.target.value)}
                            placeholder="Иван Петров"
                            className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Предприятие / Организация
                          </label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => handleCommentFormChange(block.id, 'company', e.target.value)}
                            placeholder="ПАО «Кузнецов»"
                            className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Должность
                          </label>
                          <input
                            type="text"
                            value={form.role}
                            onChange={(e) => handleCommentFormChange(block.id, 'role', e.target.value)}
                            placeholder="Главный технолог"
                            className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-[11px] font-semibold text-slate-500">Оценка проекта/решения:</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => handleCommentFormChange(block.id, 'rating', starVal)}
                              className="p-1 text-amber-400 hover:scale-125 transition-transform"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  starVal <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-slate-500 ml-1">{form.rating} из 5</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Текст отзыва или вопроса <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={form.content}
                          onChange={(e) => handleCommentFormChange(block.id, 'content', e.target.value)}
                          placeholder="Поделитесь опытом внедрения, результатами измерений или задайте вопрос..."
                          className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSubmitComment(block.id)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Опубликовать отзыв</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // 10. HTML EMBED BLOCK
          if (block.type === 'html') {
            return (
              <div key={block.id} className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
                {block.title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {block.title}
                  </h2>
                )}
                {block.htmlContent ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: block.htmlContent }}
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-gray-400 text-center">
                    HTML код пуст. Введите HTML/embed код в CMS.
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Lightbox Modal for viewing image in high-res */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-[1440px] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-1 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || ''}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-sm"
              referrerPolicy="no-referrer"
            />
            {selectedImage.caption && (
              <div className="mt-3 text-white text-xs sm:text-sm font-medium text-center bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
