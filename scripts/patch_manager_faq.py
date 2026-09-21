import re

with open('src/components/knowledge/ManagerFaqSection.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace starting from `{/* 2. Interactive Search and Category Filters */}` up to `{/* 3. Interactive Accordion FAQ List */}`
start_str = "{/* 2. Interactive Search and Category Filters */}"
end_str = "{/* 3. Interactive Accordion FAQ List */}"

idx1 = content.find(start_str)
idx2 = content.find(end_str)

if idx1 != -1 and idx2 != -1:
    # also we need to extract the search input code from the original string so we can reuse it
    old_block = content[idx1:idx2]
    
    # We will just write out the new code
    new_block = """{/* 2-COLUMN LAYOUT WRAPPER */}
      <div className="flex flex-col lg:flex-row gap-8 items-start mt-4">
        {/* SIDEBAR (Categories) */}
        <div className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 z-10">
          <div className="bg-white lg:bg-transparent lg:border-none lg:p-0 rounded-2xl border border-gray-200 p-4 shadow-sm lg:shadow-none">
            <h3 className="font-bold text-gray-900 mb-4 hidden lg:block text-sm uppercase tracking-wider">Категории инструкций</h3>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-col gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl font-medium transition-all cursor-pointer text-sm border ${
                      isSelected
                        ? "bg-blue-50 text-blue-800 border-blue-200 shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="lg:hidden flex overflow-x-auto gap-2.5 pb-2 no-scrollbar -mx-2 px-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer text-xs border ${
                      isSelected
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-500"}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="w-full lg:w-3/4 space-y-6 min-w-0">
          
          {/* 2. Interactive Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по инструкциям (например: как закрыть договор, SLA по тикетам, отказ, НДС 20%, Dongle ID, аванс)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-xs sm:text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-bold px-2 py-1 bg-gray-100 rounded-lg cursor-pointer"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* 3. Interactive Accordion FAQ List */}
"""
    
    content = content.replace(old_block, new_block)
    
    # Need to add </div></div> at the very end
    content = re.sub(r'(\s*</div>\s*\);\s*};)\s*$', r'\n        </div>\n      </div>\n    </div>\n  );\n};\n', content)

    with open('src/components/knowledge/ManagerFaqSection.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched ManagerFaqSection successfully")
else:
    print("Could not find markers")
