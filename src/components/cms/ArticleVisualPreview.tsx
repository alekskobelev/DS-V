import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  ChevronRight, 
  BookOpen, 
  Share2, 
  Sparkles,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import { Article } from '../../types';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';

interface ArticleVisualPreviewProps {
  article: Partial<Article>;
  viewMode?: 'split' | 'editor' | 'preview';
}

export const ArticleVisualPreview: React.FC<ArticleVisualPreviewProps> = ({
  article,
  viewMode = 'split'
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewType, setViewType] = useState<'card' | 'article'>('card');

  const title = article.title || 'Заголовок технической статьи или новости';
  const category = article.category || 'Технологии и метрология';
  const author = article.author || 'Инженерный центр «ДС-Инжиниринг»';
  const date = article.date || new Date().toISOString().split('T')[0];
  const readTime = article.readTime || '5 мин';
  const previewText = article.preview || 'Краткий анонс статьи с описанием ключевых технологических аспектов и выводов...';
  const image = article.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80';
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const content = article.content || previewText;
  const fileUrl = (article as any).brochureUrl || (article as any).fileUrl;

  return (
    <div className="w-full bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      {/* Top Preview Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live-предпросмотр статьи
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
            {category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Article Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewType('card')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Вид анонса (в списке)
            </button>
            <button
              type="button"
              onClick={() => setViewType('article')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'article'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Полная публикация
            </button>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="ПК вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Мобильный вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="p-4 sm:p-6 bg-slate-100 flex justify-center items-start min-h-[420px] overflow-auto">
        <div
          className={`transition-all duration-300 w-full ${
            viewport === 'mobile'
              ? 'max-w-[390px] bg-white rounded-[32px] p-4 shadow-sm border-4 border-slate-800 min-h-[640px]'
              : 'max-w-4xl bg-white rounded-xl p-6 sm:p-8 shadow-md border border-slate-200'
          }`}
        >
          {viewType === 'card' ? (
            /* ARTICLE CARD VIEW */
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:shadow-lg transition-all flex flex-col max-w-sm mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3.5">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm">
                  {category}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                {previewText}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Читать далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            /* FULL ARTICLE VIEW */
            <article className="space-y-6 text-slate-800">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>База знаний</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{category}</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mb-3">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {readTime}
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              {image && (
                <div className="rounded-xl overflow-hidden shadow-md max-h-[360px] bg-slate-100">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content Body */}
              <div className="article-body">
                <ArticleContentRenderer content={content} />
              </div>

              {/* Attached file / whitepaper download */}
              {fileUrl && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900">
                        Прикрепленный файл методики / Документация
                      </div>
                      <div className="text-[11px] text-blue-600 truncate max-w-md font-mono">
                        {fileUrl}
                      </div>
                    </div>
                  </div>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать</span>
                  </a>
                </div>
              )}

              {/* Tags and Share */}
              {tags.length > 0 && (
                <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </div>
  );
};
