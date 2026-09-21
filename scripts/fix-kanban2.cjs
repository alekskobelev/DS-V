const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

const regexStart = /\{\/\*\s*3\.\s*Kanban Board Horizontal View\s*\*\/\}\s*<div className="bg-slate-50\/80 dark:bg-slate-950\/60 border border-gray-200\/80 dark:border-slate-800 rounded-3xl p-6 min-h-\[560px\] overflow-x-auto">/g;

const newStart = `{/* 3. Kanban Board Horizontal View */}
      <div className="relative group">
        {/* Left Scroll Button */}
        <button 
          onClick={() => scrollBoard('left')}
          disabled={!canScrollLeft}
          title="Прокрутить влево"
          className={\`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl shadow-slate-900/10 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#2563EB] focus:outline-none flex items-center justify-center \${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 text-gray-700'}\`}
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
        </button>

        {/* Right Scroll Button */}
        <button 
          onClick={() => scrollBoard('right')}
          disabled={!canScrollRight}
          title="Прокрутить вправо"
          className={\`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl shadow-slate-900/10 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#2563EB] focus:outline-none flex items-center justify-center \${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 text-gray-700'}\`}
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
        </button>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="bg-slate-50/80 dark:bg-slate-950/60 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-6 min-h-[560px] overflow-x-auto scroll-smooth"
        >`;

if (regexStart.test(content)) {
  content = content.replace(regexStart, newStart);
  console.log("Start replaced");
  
  // Now add the closing div
  const regexEnd = /(            \}\)\}\s*<\/div>\s*\)\}\s*<\/div>)\s*<\/div>\s*\)\}\s*\{\/\* 4\. Full 3-Column Interactive Deal Modal \*\/\}/;
  if (regexEnd.test(content)) {
    content = content.replace(regexEnd, (match, p1) => {
        return p1 + '\n      </div>\n      </div>\n      )}\n\n      {/* 4. Full 3-Column Interactive Deal Modal */}';
    });
    fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
    console.log("End replaced");
  } else {
    console.log("End NOT replaced");
  }
} else {
  console.log("Start NOT replaced");
}
