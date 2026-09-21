const fs = require('fs');
let code = fs.readFileSync('src/components/cms/PageVisualPreview.tsx', 'utf8');

// Update Props
code = code.replace(
  /viewportMode\?: 'desktop' \| 'tablet' \| 'mobile';/,
  "viewportMode?: 'desktop' | 'mobile' | 'mobile-landscape';\n  isFullScreen?: boolean;\n  onToggleFullScreen?: () => void;"
);

code = code.replace(
  /onViewportChange\?: \(mode: 'desktop' \| 'tablet' \| 'mobile'\) => void;/,
  "onViewportChange?: (mode: 'desktop' | 'mobile' | 'mobile-landscape') => void;"
);

code = code.replace(
  /viewportMode = 'desktop',/,
  "viewportMode = 'desktop',\n  isFullScreen,\n  onToggleFullScreen,"
);

// Remove Tablet, add Landscape, add Fullscreen
const oldViewportControls = `          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => onViewportChange('desktop')}
              className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                viewportMode === 'desktop' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }\`}
              title="Десктоп (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ПК</span>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('tablet')}
              className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                viewportMode === 'tablet' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }\`}
              title="Планшет (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Планшет</span>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('mobile')}
              className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                viewportMode === 'mobile' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }\`}
              title="Смартфон (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Мобильный</span>
            </button>
          </div>`;

const newViewportControls = `          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => onViewportChange?.('desktop')}
              className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                viewportMode === 'desktop' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }\`}
              title="Десктоп (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ПК</span>
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button
              type="button"
              onClick={() => onViewportChange?.(viewportMode === 'mobile' ? 'mobile-landscape' : 'mobile')}
              className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                viewportMode.startsWith('mobile')
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }\`}
              title={viewportMode === 'mobile' ? "Повернуть (Ландшафт)" : "Мобильный (390px)"}
            >
              <Smartphone className={\`w-3.5 h-3.5 transition-transform \${viewportMode === 'mobile-landscape' ? '-rotate-90' : ''}\`} />
              <span className="hidden sm:inline">Мобильный</span>
            </button>
            
            {onToggleFullScreen && (
              <>
                <div className="w-px h-4 bg-slate-600 mx-1"></div>
                <button
                  type="button"
                  onClick={onToggleFullScreen}
                  className={\`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all \${
                    isFullScreen
                      ? 'bg-amber-500 text-slate-900 shadow-xs' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }\`}
                  title={isFullScreen ? "Свернуть" : "На весь экран"}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{isFullScreen ? 'Свернуть' : 'На весь экран'}</span>
                </button>
              </>
            )}
          </div>`;

let newCode = code.replace(oldViewportControls, newViewportControls);

// Update width logic
newCode = newCode.replace(
  /const viewportWidthClass = [\s\S]*?;/,
  `const viewportWidthClass = 
    viewportMode === 'mobile' ? 'max-w-[390px]' :
    viewportMode === 'mobile-landscape' ? 'max-w-[844px]' :
    'w-full';`
);

fs.writeFileSync('src/components/cms/PageVisualPreview.tsx', newCode);
console.log('PageVisualPreview patched');
