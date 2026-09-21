with open('/tmp/kb.txt', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# find the block of pills
old_start = '{/* Main Section Switcher / Category Pills with counters & icons */}'
old_end_str = '{/* Article Detail Reader Card */}'

idx1 = content.find(old_start)
idx2 = content.find(old_end_str)

if idx1 != -1 and idx2 != -1:
    old_block = content[idx1:idx2]
    
    new_block = """{/* 2-COLUMN LAYOUT WRAPPER */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SIDEBAR (Categories) */}
        <div className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 z-10">
          <div className="bg-white lg:bg-transparent lg:border-none lg:p-0 rounded-2xl border border-gray-200 p-4 shadow-sm lg:shadow-none">
            <h3 className="font-bold text-gray-900 mb-4 hidden lg:block text-sm uppercase tracking-wider">Разделы базы знаний</h3>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-col gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCat(cat.id);
                      setActiveArticle(null);
                    }}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="lg:hidden flex overflow-x-auto gap-2.5 pb-2 no-scrollbar -mx-2 px-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCat(cat.id);
                      setActiveArticle(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer text-xs border ${
                      isSelected
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-500"}`} />
                    <span>{cat.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="w-full lg:w-3/4 space-y-8 min-w-0">
          """
    
    content = content.replace(old_block, new_block)
    
    # We added <div class flex flex-col> and <div class w-full lg:w-3/4>
    # That means we need 2 more </div> tags at the very end of the file.
    
    idx3 = content.rfind("    </div>\n  );\n};")
    if idx3 != -1:
        # replace the last "    </div>\n  );\n};" with "        </div>\n      </div>\n    </div>\n  );\n};"
        # Wait, the original had:
        #       </div>
        #     </div>
        #   );
        # };
        content = content[:idx3] + "        </div>\n      </div>\n    </div>\n  );\n};\n"

    with open('src/pages/KnowledgeBasePage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find markers")
