const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

const originalKanbanStart = `      {/* 3. Kanban Board Horizontal View */}
      <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-6 min-h-[560px] overflow-x-auto">`;

const newKanbanStart = `      {/* 3. Kanban Board Horizontal View */}
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

if (content.includes(originalKanbanStart)) {
  content = content.replace(originalKanbanStart, newKanbanStart);
  // Need to close the new relative div at the end of the block
  // Let's find where the kanban block ends.
  const endMarker = `          </div>
        )}
      </div>`;
  const endReplacement = `          </div>
        )}
        </div>
      </div>`;
  
  // Actually replacing the last closing tag might be tricky if there are multiple.
  // We can just find the end of the conditional rendering.
}
