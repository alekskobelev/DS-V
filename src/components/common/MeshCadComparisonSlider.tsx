import React, { useState, useRef, useCallback } from 'react';
import { Layers, Scan, CheckCircle2, Sliders, ArrowLeftRight, Eye } from 'lucide-react';

interface MeshCadComparisonSliderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const MeshCadComparisonSlider: React.FC<MeshCadComparisonSliderProps> = ({
  title = 'Сравнение: Исходный 3D-скан (STL) и Твердотельная CAD-модель (STEP)',
  subtitle = 'Интерактивное сопоставление полигональной сетки оцифровки и точной твердотельной B-Rep модели для станков с ЧПУ',
  className = ''
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Реверс-инжиниринг полного цикла</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Точность до 0.015 мм</span>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            {subtitle}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <ArrowLeftRight className="w-4 h-4 text-blue-500" />
          <span>Тяните ползунок для сравнения</span>
        </div>
      </div>

      {/* Interactive Visual Comparison Stage */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[480px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 select-none cursor-ew-resize border border-slate-200 dark:border-slate-700 shadow-inner group"
      >
        {/* RIGHT LAYER: Solid Parametric CAD Model (STEP AP242 / Parasolid) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-[#0F172A] to-[#1E293B] flex items-center justify-center p-4">
          {/* Detailed CAD Wireframe & Shaded Solid SVG Representation */}
          <svg className="w-full h-full max-h-[380px] drop-shadow-2xl" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cadMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#2563EB" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="cadHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Technical CAD Grid Background */}
            <g opacity="0.15" stroke="#38BDF8" strokeWidth="0.5">
              <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
              <path d="M50,0 V500 M100,0 V500 M150,0 V500 M200,0 V500 M250,0 V500 M300,0 V500 M350,0 V500 M400,0 V500 M450,0 V500 M500,0 V500 M550,0 V500 M600,0 V500 M650,0 V500 M700,0 V500 M750,0 V500" />
            </g>

            {/* Impeller Hub & Blades in Smooth CAD Surface Style */}
            {/* Center Boss */}
            <circle cx="400" cy="250" r="70" fill="url(#cadMetalGrad)" stroke="#60A5FA" strokeWidth="2.5" />
            <circle cx="400" cy="250" r="40" fill="#0F172A" stroke="#93C5FD" strokeWidth="2" />
            <circle cx="400" cy="250" r="20" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />

            {/* Parametric CAD Blades with Smooth Splines */}
            <path d="M400,180 C440,110 510,90 560,110 C530,150 465,195 440,210 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />
            <path d="M450,220 C520,200 580,240 600,290 C550,300 480,270 450,250 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />
            <path d="M440,280 C470,340 450,410 400,440 C390,390 410,320 420,290 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />
            <path d="M380,310 C320,360 250,360 210,320 C240,280 310,280 350,280 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />
            <path d="M350,230 C290,210 240,160 230,110 C280,120 330,170 360,200 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />
            <path d="M380,185 C360,120 390,60 440,40 C445,90 415,150 400,185 Z" fill="url(#cadHighlight)" stroke="#60A5FA" strokeWidth="2" />

            {/* CAD Dimension Annotations (PMI / GD&T Style) */}
            <g stroke="#38BDF8" strokeWidth="1" opacity="0.85">
              <line x1="280" y1="70" x2="520" y2="70" />
              <line x1="280" y1="65" x2="280" y2="75" />
              <line x1="520" y1="65" x2="520" y2="75" />
              <text x="400" y="62" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Ø 240.00 ±0.02</text>

              <line x1="630" y1="180" x2="630" y2="320" />
              <line x1="625" y1="180" x2="635" y2="180" />
              <line x1="625" y1="320" x2="635" y2="320" />
              <text x="645" y="255" fill="#38BDF8" fontSize="12" fontWeight="bold" fontFamily="monospace">R 85.50</text>
            </g>

            {/* Coordinate Triad on Part Center */}
            <g transform="translate(400, 250)" strokeWidth="2.5">
              <line x1="0" y1="0" x2="60" y2="0" stroke="#EF4444" />
              <text x="68" y="4" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">X</text>
              <line x1="0" y1="0" x2="0" y2="-60" stroke="#10B981" />
              <text x="-4" y="-68" fill="#10B981" fontSize="11" fontWeight="bold" fontFamily="monospace">Y</text>
              <line x1="0" y1="0" x2="-40" y2="40" stroke="#3B82F6" />
              <text x="-52" y="52" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">Z</text>
            </g>
          </svg>

          {/* Badge: Solid CAD */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-blue-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-400/40 text-xs font-black shadow-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Твердотельный CAD (STEP/ЕСКД)</span>
          </div>
        </div>

        {/* LEFT LAYER: Raw Triangulated Polygon 3D Scan Mesh (STL/OBJ) (Clipped by slider position) */}
        <div 
          className="absolute inset-0 w-full h-full bg-[#030712] overflow-hidden flex items-center justify-center p-4 border-r border-amber-400/80"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* Triangulated Raw Scan Mesh SVG */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center min-w-[320px]">
            <svg className="w-full h-full max-h-[380px] drop-shadow-2xl" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="meshTriangles" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M0,0 L30,0 L15,30 Z M30,0 L30,30 L15,30 Z" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeOpacity="0.6" />
                </pattern>
                <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#D97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#78350F" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Optical Blue Laser Grid Projection Scan Lines */}
              <g stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="3 3">
                <line x1="50" y1="120" x2="750" y2="120" />
                <line x1="50" y1="180" x2="750" y2="180" />
                <line x1="50" y1="240" x2="750" y2="240" />
                <line x1="50" y1="300" x2="750" y2="300" />
                <line x1="50" y1="360" x2="750" y2="360" />
              </g>

              {/* Polygon Mesh Body */}
              <circle cx="400" cy="250" r="70" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="400" cy="250" r="70" fill="url(#meshTriangles)" />
              <circle cx="400" cy="250" r="40" fill="#111827" stroke="#FBBF24" strokeWidth="1.5" />
              <circle cx="400" cy="250" r="20" fill="#030712" stroke="#F59E0B" strokeWidth="1" />

              {/* Triangular Facets on Blades (Simulating high-density point cloud / mesh) */}
              <path d="M400,180 L430,140 L470,110 L520,100 L560,110 L545,130 L520,160 L480,180 L440,210 Z" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.2" />
              <path d="M400,180 L470,110 M430,140 L520,160 M520,100 L545,130 M480,180 L560,110" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />

              <path d="M450,220 L490,210 L540,215 L580,240 L600,290 L570,300 L520,290 L480,270 L450,250 Z" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.2" />
              <path d="M450,220 L580,240 M490,210 L570,300 M540,215 L520,290" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />

              <path d="M440,280 L460,310 L470,360 L450,410 L400,440 L395,410 L405,360 L415,315 L420,290 Z" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.2" />
              <path d="M440,280 L450,410 M460,310 L405,360 M470,360 L395,410" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />

              <path d="M380,310 L350,330 L300,355 L250,360 L210,320 L225,295 L260,285 L310,280 L350,280 Z" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.2" />
              <path d="M380,310 L250,360 M350,330 L225,295 M300,355 L260,285" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />

              <path d="M350,230 L320,220 L270,190 L240,160 L230,110 L255,115 L290,140 L330,170 L360,200 Z" fill="url(#meshGrad)" stroke="#F59E0B" strokeWidth="1.2" />
              <path d="M350,230 L240,160 M320,220 L255,115 M270,190 L290,140" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />

              {/* Point Cloud Density Cloud Particles */}
              <g fill="#60A5FA" opacity="0.8">
                <circle cx="430" cy="120" r="1.5" />
                <circle cx="480" cy="115" r="1.5" />
                <circle cx="530" cy="135" r="1.5" />
                <circle cx="560" cy="230" r="1.5" />
                <circle cx="575" cy="270" r="1.5" />
                <circle cx="460" cy="340" r="1.5" />
                <circle cx="435" cy="390" r="1.5" />
                <circle cx="280" cy="320" r="1.5" />
                <circle cx="240" cy="180" r="1.5" />
                <circle cx="310" cy="160" r="1.5" />
              </g>

              {/* Laser Line Scanning Indicator */}
              <line x1="200" y1="250" x2="600" y2="250" stroke="#38BDF8" strokeWidth="2" strokeOpacity="0.9" />
              <text x="400" y="240" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FREE-SCAN LASER LINE · 1 200 000 тчк/с</text>
            </svg>
          </div>

          {/* Badge: 3D Scan Mesh */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-amber-500/90 text-slate-950 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <Scan className="w-3.5 h-3.5" />
            <span>Скан-сетка STL (1.2 млн полигонов)</span>
          </div>
        </div>

        {/* DIVIDER HANDLE LINE */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-white to-blue-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900 border-2 border-white text-white shadow-2xl flex items-center justify-center cursor-ew-resize">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Footer Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 sm:mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
            01
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Лазерная и контактная оцифровка</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Мобильные КИМ Hexagon и сканеры Shining 3D / ScanLine с шагом сетки от 0.02 мм.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
            02
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Твердотельное B-Rep моделирование</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Построение точных поверхностей и тел в Geomagic Design X / TopSolid 7 с устранением износа.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
            03
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Выпуск КД по ЕСКД</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Готовые чертежи с допусками, твердотельные сборки STEP/Parasolid и программы для ЧПУ станков.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
