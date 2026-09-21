import React, { useState, useRef } from 'react';
import { 
  Code, 
  Eye, 
  Columns, 
  Sparkles, 
  Save, 
  X, 
  FileText, 
  Calculator, 
  BarChart2, 
  Table, 
  Layers, 
  HelpCircle, 
  Copy, 
  Check, 
  Maximize2,
  Calendar,
  User,
  Clock,
  Image as ImageIcon,
  Tag,
  FolderPlus
} from 'lucide-react';
import { Article } from '../../types';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';
import { RichTextEditor } from './RichTextEditor';

interface ArticleCodeEditorProps {
  initialArticle?: Article | null;
  onSave: (article: Article) => void;
  onCancel: () => void;
}

// Preset industry images for fast pick
const COVER_PRESETS = [
  { label: '3D-сканирование', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80' },
  { label: 'КИМ и метрология', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80' },
  { label: 'ЧПУ и станки', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Инжиниринг / CAD', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Лаборатория', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80' }
];

// Rich technical code snippets
const SNIPPETS = {
  articleTemplate: `<style>
  .tech-article {
    font-family: inherit;
    color: #1f2937;
  }
  .tech-header-card {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: #ffffff;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }
  .tech-header-card h2 {
    color: #ffffff !important;
    margin-top: 0;
    border-bottom: none !important;
  }
  .tech-badge {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #fef08a;
  }
  .tech-callout {
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 16px 20px;
    border-radius: 0 10px 10px 0;
    margin: 20px 0;
    font-size: 14px;
  }
</style>

<div class="tech-article">
  <div class="tech-header-card">
    <span class="tech-badge">Инженерный регламент ДС‑Инжиниринг</span>
    <h2>Методика и стандарты контроля качества</h2>
    <p style="margin-bottom: 0; opacity: 0.95; font-size: 14px;">Руководство по проведению измерений с соблюдением требований ГОСТ и ISO.</p>
  </div>

  <h2>1. Введение и область применения</h2>
  <p>Данная методология регламентирует последовательность выполнения технологических операций при контроле геометрии сложных узлов.</p>

  <div class="tech-callout">
    <strong>Важное требование:</strong> Температурный режим в измерительной лаборатории должен поддерживаться в пределах 20 ± 1 °C согласно ГОСТ 8.050-73.
  </div>

  <h2>2. Технические характеристики</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <thead>
      <tr style="background: #f1f5f9;">
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Параметр</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Значение</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Норматив</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Погрешность MPEe</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">1.8 + L/350 мкм</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">ISO 10360-2</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Шаг дискретизации сетки</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">0.05 мм</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Внутренний стандарт</td>
      </tr>
    </tbody>
  </table>
</div>`,

  calculator: `<style>
  .calc-widget {
    background: #f8fafc;
    border: 2px solid #3b82f6;
    border-radius: 16px;
    padding: 24px;
    margin: 24px 0;
    font-family: inherit;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .calc-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 8px;
  }
  .calc-desc {
    font-size: 13px;
    color: #4b5563;
    margin-bottom: 16px;
  }
  .calc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  .calc-field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  .calc-field input, .calc-field select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
  }
  .calc-btn {
    background: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .calc-btn:hover {
    background: #1d4ed8;
  }
  .calc-result {
    margin-top: 16px;
    padding: 16px;
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    display: none;
  }
  .calc-result.active {
    display: block;
  }
</style>

<div class="calc-widget">
  <div class="calc-title">🧮 Интерактивный калькулятор допуска по ГОСТ ISO 13920</div>
  <div class="calc-desc">Расчет предельных линейных отклонений сварных узлов в зависимости от длины и класса точности.</div>

  <div class="calc-grid">
    <div class="calc-field">
      <label for="w-length">Длина базового элемента L (мм):</label>
      <input type="number" id="w-length" value="1200" min="10" max="15000" step="10">
    </div>
    <div class="calc-field">
      <label for="w-class">Класс точности по ГОСТ:</label>
      <select id="w-class">
        <option value="A">Класс A (Высокая точность)</option>
        <option value="B" selected>Класс B (Средняя точность)</option>
        <option value="C">Класс C (Пониженная точность)</option>
        <option value="D">Класс D (Грубая точность)</option>
      </select>
    </div>
  </div>

  <button type="button" class="calc-btn" id="btn-calc">Рассчитать допуск</button>

  <div class="calc-result" id="res-box">
    <div style="font-size: 13px; color: #64748b;">Результат метрологического расчета:</div>
    <div style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 4px 0;" id="res-val">± 2.0 мм</div>
    <div style="font-size: 12px; color: #059669;" id="res-note">Узел пригоден для автоматической 3D-инспекции на оптическом трекере.</div>
  </div>
</div>

<script>
  (function() {
    var btn = document.getElementById('btn-calc');
    var lenInput = document.getElementById('w-length');
    var clsSelect = document.getElementById('w-class');
    var resBox = document.getElementById('res-box');
    var resVal = document.getElementById('res-val');
    var resNote = document.getElementById('res-note');

    function calculate() {
      var L = parseFloat(lenInput.value) || 1000;
      var cls = clsSelect.value;
      var tol = 1.0;

      if (cls === 'A') {
        if (L <= 315) tol = 0.5;
        else if (L <= 1000) tol = 1.0;
        else if (L <= 2000) tol = 1.5;
        else tol = 2.0;
      } else if (cls === 'B') {
        if (L <= 315) tol = 1.0;
        else if (L <= 1000) tol = 2.0;
        else if (L <= 2000) tol = 3.0;
        else tol = 4.0;
      } else if (cls === 'C') {
        if (L <= 315) tol = 2.0;
        else if (L <= 1000) tol = 3.0;
        else if (L <= 2000) tol = 4.5;
        else tol = 6.0;
      } else {
        tol = 6.0;
      }

      resVal.textContent = '± ' + tol.toFixed(1) + ' мм (диапазон ' + (tol*2).toFixed(1) + ' мм)';
      resNote.textContent = 'Для длины ' + L + ' мм по классу ' + cls + ' максимальное отклонение составляет ' + tol.toFixed(1) + ' мм.';
      resBox.className = 'calc-result active';
    }

    if (btn) {
      btn.addEventListener('click', calculate);
    }
  })();
</script>`,

  canvasDiagram: `<style>
  .canvas-box {
    background: #0f172a;
    border-radius: 16px;
    padding: 20px;
    margin: 24px 0;
    color: #ffffff;
    font-family: inherit;
  }
  .canvas-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .canvas-title {
    font-weight: 700;
    font-size: 15px;
    color: #38bdf8;
  }
  #chartCanvas {
    background: #1e293b;
    border-radius: 10px;
    width: 100%;
    max-width: 100%;
    display: block;
  }
  .canvas-controls {
    margin-top: 12px;
    display: flex;
    gap: 10px;
  }
  .canvas-btn {
    background: #38bdf8;
    color: #0f172a;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
</style>

<div class="canvas-box">
  <div class="canvas-header">
    <span class="canvas-title">📊 Интерактивная эпюра погрешности (Canvas)</span>
    <span style="font-size: 12px; color: #94a3b8;">Погрешность MPEe = f(L)</span>
  </div>
  <canvas id="chartCanvas" width="650" height="220"></canvas>
  <div class="canvas-controls">
    <button type="button" class="canvas-btn" id="btn-anim">Перестроить эпюру</button>
  </div>
</div>

<script>
  (function() {
    var canvas = document.getElementById('chartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var btn = document.getElementById('btn-anim');

    function drawChart() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw grid
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (var x = 50; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, h - 30);
        ctx.stroke();
      }
      for (var y = 20; y < h - 30; y += 40) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(w - 20, y);
        ctx.stroke();
      }

      // Draw Curve 1 (ISO 10360-2: 1.8 + L/350)
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      for (var px = 50; px < w - 20; px += 5) {
        var L = (px - 50) * 3;
        var mpe = 1.8 + L / 350;
        var py = (h - 35) - mpe * 18;
        if (px === 50) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Legend
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MPEe = 1.8 + L/350 мкм (КИМ Эксперт)', 60, 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Длина измерения L (мм) ->', w - 160, h - 10);
    }

    drawChart();
    if (btn) {
      btn.addEventListener('click', function() {
        drawChart();
      });
    }
  })();
</script>`,

  interactiveTabs: `<style>
  .tabs-widget {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    margin: 24px 0;
    font-family: inherit;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .tabs-nav {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .tab-btn {
    padding: 12px 18px;
    background: transparent;
    border: none;
    font-weight: 600;
    font-size: 13px;
    color: #64748b;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .tab-btn.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
    background: #ffffff;
  }
  .tab-pane {
    padding: 20px;
    display: none;
    font-size: 14px;
    line-height: 1.6;
  }
  .tab-pane.active {
    display: block;
  }
</style>

<div class="tabs-widget">
  <div class="tabs-nav">
    <button type="button" class="tab-btn active" data-tab="tab-1">Стол-Голова (BC)</button>
    <button type="button" class="tab-btn" data-tab="tab-2">Двухосевой стол (AC)</button>
    <button type="button" class="tab-btn" data-tab="tab-3">Двухосевая голова (AB)</button>
  </div>
  <div class="tab-pane active" id="tab-1">
    <h4 style="margin-top: 0; color: #1e3a8a;">Кинематическая схема «Стол-Голова»</h4>
    <p>Ось B наклоняется шпинделем, ось C вращается столом. Преимущество — высокая жесткость при обработке тяжелых крупногабаритных деталей (штампы, пресс-формы).</p>
    <code>G43.4 H01 Q01 (Активация режима RTCP с контролем центра вершины инструмента)</code>
  </div>
  <div class="tab-pane" id="tab-2">
    <h4 style="margin-top: 0; color: #1e3a8a;">Кинематическая схема «Стол-Стол»</h4>
    <p>Классическая схема с наклонно-поворотным столом типа «люлька» (Trunnion table). Оптимально для деталей сложной геометрии диаметром до 600 мм (крыльчатки, моноколеса).</p>
  </div>
  <div class="tab-pane" id="tab-3">
    <h4 style="margin-top: 0; color: #1e3a8a;">Кинематическая схема «Голова-Голова»</h4>
    <p>Портальные 5-осевые станки с вилочной фрезерной головкой. Идеально для длинномерных балок, лонжеронов и крупногабаритной оснастки из композитов и алюминия.</p>
  </div>
</div>

<script>
  (function() {
    var btns = document.querySelectorAll('.tab-btn');
    btns.forEach(function(b) {
      b.addEventListener('click', function() {
        btns.forEach(function(item) { item.classList.remove('active'); });
        document.querySelectorAll('.tab-pane').forEach(function(pane) { pane.classList.remove('active'); });
        b.classList.add('active');
        var target = document.getElementById(b.getAttribute('data-tab'));
        if (target) target.classList.add('active');
      });
    });
  })();
</script>`
};

export const ArticleCodeEditor: React.FC<ArticleCodeEditorProps> = ({
  initialArticle,
  onSave,
  onCancel
}) => {
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'preview' | 'split'>('visual');
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [category, setCategory] = useState(initialArticle?.category || 'Статьи');
  const [author, setAuthor] = useState(initialArticle?.author || 'Инженерный отдел ДС‑Инжиниринг');
  const [readTime, setReadTime] = useState(initialArticle?.readTime || '6 мин');
  const [date, setDate] = useState(initialArticle?.date || '03 сентября 2026');
  const [preview, setPreview] = useState(initialArticle?.preview || '');
  const [tags, setTags] = useState(initialArticle?.tags?.join(', ') || '3D-сканирование, Метрология, Статьи');
  const [image, setImage] = useState(
    initialArticle?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  );

  // Content state: can be raw HTML/CSS/JS
  const [content, setContent] = useState<string>(() => {
    if (!initialArticle) return SNIPPETS.articleTemplate;
    if (Array.isArray(initialArticle.content)) {
      return initialArticle.content.map(p => `<p>${p}</p>`).join('\n\n');
    }
    return initialArticle.content || SNIPPETS.articleTemplate;
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inspect tags
  const hasScript = content.toLowerCase().includes('<script');
  const hasStyle = content.toLowerCase().includes('<style');
  const hasHtml = content.includes('<div') || content.includes('<table') || content.includes('<p') || content.includes('<h');

  // Insert snippet or tag at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + '\n' + textToInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = content;
    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Support Tab key indentation in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertTextAtCursor('  ');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Пожалуйста, укажите заголовок статьи');
      return;
    }

    const cleanId = title
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/gi, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);

    const articleToSave: Article = {
      id: initialArticle?.id || `art-${cleanId}-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Статьи',
      author: author.trim() || 'ДС‑Инжиниринг',
      date: date.trim() || '03 сентября 2026',
      readTime: readTime.trim() || '5 мин',
      preview: preview.trim() || 'Подробный технический материал от инженерного центра «ДС‑Инжиниринг».',
      content: content, // Direct unaltered HTML/CSS/JS without any tag stripping!
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      image: image.trim(),
      isHtml: true
    };

    onSave(articleToSave);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col space-y-4">
      {/* Top Header */}
      <div className="px-6 py-4 bg-white text-gray-900 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <span>{initialArticle ? 'Редактор статьи (HTML / CSS / JS)' : 'Создание технической статьи (HTML / CSS / JS)'}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                Полный доступ к коду
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Поддержка прямой вставки чистой HTML-разметки, встроенных стилей &lt;style&gt; и исполняемых скриптов &lt;script&gt;.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">

          <button
            type="button"
            onClick={() => setEditorMode('visual')}
            className={`px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              editorMode === 'visual' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Визуальный редактор</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('code')}
            className={`px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              editorMode === 'code' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Редактор кода</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('split')}
            className={`px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              editorMode === 'split' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Сплит (Код + Превью)</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('preview')}
            className={`px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              editorMode === 'preview' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Живой предпросмотр</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Technical Tags Detector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Инспектор разметки:</span>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
              hasScript ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-500'
            }`}>
              &lt;script&gt; {hasScript ? '✓ JS активен' : '—'}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
              hasStyle ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-500'
            }`}>
              &lt;style&gt; {hasStyle ? '✓ CSS активен' : '—'}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
              hasHtml ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-500'
            }`}>
              &lt;div&gt; {hasHtml ? '✓ HTML разметка' : '—'}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 italic">
            🛡️ Изолированный рендеринг: стили и скрипты статьи не нарушают верстку шапки и навигации портала.
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Заголовок статьи <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Методика лазерного 3D-сканирования крупногабаритных сварных узлов"
              className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Категория публикации
            </label>
            <div className="flex gap-1.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-blue-900 bg-blue-50/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Статьи">Статьи (Технический разбор)</option>
                <option value="Релизы ПО">Релизы ПО</option>
                <option value="Выставки">Выставки</option>
                <option value="Проекты">Проекты</option>
                <option value="События">События</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-500 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Автор</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Инженерный отдел"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Дата публикации</span>
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="03 сентября 2026"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Время чтения</span>
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="7 мин"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span>Теги (через запятую)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="3D-сканирование, Метрология, ГОСТ"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
            />
          </div>
        </div>

        {/* Preview Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">
            Краткий анонс статьи (отображается в карточке в списке новостей)
          </label>
          <textarea
            rows={2}
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            placeholder="Инженерный регламент контроля геометрии и остаточных сварочных деформаций крупногабаритных рам с применением лазерных 3D-сканеров..."
            className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Cover Image & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>Ссылка на изображение обложки</span>
            </label>
            <span className="text-[11px] text-gray-500">Быстрый выбор промышленных фото:</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4.5 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COVER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImage(preset.url)}
                className="px-2.5 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-md transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippets Toolbar */}
        <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Быстрая вставка интерактивных инженерных сниппетов:</span>
            </span>
            <span className="text-[11px] text-slate-400">Нажмите для вставки в позицию курсора</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => insertTextAtCursor(SNIPPETS.articleTemplate)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
              title="Вставить каркас статьи со стилями"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Шаблон статьи</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor(SNIPPETS.calculator)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
              title="Вставить интерактивный калькулятор на JS"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Калькулятор (HTML+JS)</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor(SNIPPETS.canvasDiagram)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
              title="Вставить эпюру на Canvas с анимацией"
            >
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Canvas диаграмма</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor(SNIPPETS.interactiveTabs)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
              title="Вставить переключаемые вкладки"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Вкладки / Табы</span>
            </button>

            <span className="w-px h-5 bg-slate-700 self-center my-0.5 mx-1" />

            {/* Quick HTML tag buttons */}
            <button
              type="button"
              onClick={() => insertTextAtCursor('<style>\n  /* Пользовательские стили статьи */\n</style>\n')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded font-mono text-[11px]"
            >
              +&lt;style&gt;
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('<script>\n  (function() {\n    // Пользовательский JavaScript статьи\n  })();\n</script>\n')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-mono text-[11px]"
            >
              +&lt;script&gt;
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('<div class="my-custom-box">\n  <h3>Подзаголовок</h3>\n  <p>Текст...</p>\n</div>\n')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
            >
              +&lt;div&gt;
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('<pre><code class="language-gcode">\nG00 X0 Y0 Z50\nG43.4 H01 Q01\nG01 Z0 F1200\n</code></pre>\n')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono text-[11px]"
            >
              +&lt;pre&gt;&lt;code&gt;
            </button>
          </div>
        </div>

        {/* Editor Area (Code / Split / Preview) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-blue-600" />
              <span>Тело статьи (HTML + CSS + JS)</span>
            </span>
            <span>Символов: {content.length} | Строк: {content.split('\n').length}</span>
          </div>


          {/* VISUAL MODE */}
          {editorMode === 'visual' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Визуальный редактор (WYSIWYG)</span>
                </span>
              </div>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          )}

          {/* CODE ONLY MODE */}
          {editorMode === 'code' && (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
              <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>article_source.html</span>
                <span className="text-[10px] text-slate-500">Клавиша Tab вставляет 2 пробела</span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={18}
                className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 focus:outline-none leading-relaxed resize-y selection:bg-blue-600 selection:text-white"
                placeholder="Вставьте чистый HTML-код, пользовательские стили <style> и логику <script>..."
                spellCheck={false}
              />
            </div>
          )}

          {/* SPLIT MODE */}
          {editorMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
                <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800">
                  Исходный код (HTML/CSS/JS)
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={20}
                  className="w-full flex-1 p-4 font-mono text-xs bg-slate-950 text-emerald-400 focus:outline-none leading-relaxed resize-none"
                  spellCheck={false}
                />
              </div>

              <div className="rounded-xl border border-gray-300 bg-white p-4 overflow-y-auto max-h-[600px] shadow-sm">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
                  <span>Живой предпросмотр статьи</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    ● Изолированный рендеринг
                  </span>
                </div>
                <ArticleContentRenderer content={content} articleTitle={title || 'Предпросмотр'} />
              </div>
            </div>
          )}

          {/* PREVIEW ONLY MODE */}
          {editorMode === 'preview' && (
            <div className="rounded-xl border-2 border-blue-200 bg-white p-6 shadow-md min-h-[400px]">
              <div className="pb-4 mb-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <span className="px-4 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold">
                    {category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2">
                    {title || 'Заголовок статьи (предпросмотр)'}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{author}</span>
                    <span>•</span>
                    <span>{date}</span>
                    <span>•</span>
                    <span>{readTime}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorMode('code')}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-lg text-xs font-medium"
                >
                  Вернуться в код
                </button>
              </div>

              <ArticleContentRenderer content={content} articleTitle={title || 'Предпросмотр'} />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-slate-500 hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
            Отмена
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorMode(editorMode === 'preview' ? 'code' : 'preview')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>{editorMode === 'preview' ? 'К коду' : 'Быстрый предпросмотр'}</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialArticle ? 'Сохранить изменения' : 'Опубликовать материал'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
