const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CmsSeoTab.tsx', 'utf8');

const uiCode = `
      {/* МАССОВЫЙ ИМПОРТ/ЭКСПОРТ SEO (JSON) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-500" />
              Массовый экспорт/импорт SEO-данных (JSON)
            </h3>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Инструмент для SEO-специалистов. Позволяет выгрузить метатеги (title, description, keywords) всех разделов сайта (кастомные страницы, товары, услуги, новости, база знаний) в один JSON-файл, отредактировать их локально и загрузить обратно в систему в один клик.
            </p>
          </div>
          <button
            onClick={generateBulkSeoJson}
            className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Экспорт в JSON
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-gray-800 mb-2">Импорт отредактированных метатегов</h4>
            <p className="text-xs text-gray-600 mb-4">Вставьте JSON-массив с обновленными полями \`metaTitle\`, \`metaDescription\` и \`metaKeywords\`.</p>
            <textarea
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder='[ { "entityType": "page", "id": "...", "metaTitle": "Новый Title", ... } ]'
              className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleBulkImport}
                disabled={!bulkImportText.trim()}
                className="px-5 py-2 bg-blue-600 disabled:bg-gray-300 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Применить импорт
              </button>
            </div>
          </div>
        </div>
      </div>
`;

// Insert before the last 3 closing divs
const closingTags = "    </div>\n  );\n};\n";
const lastIndex = code.lastIndexOf(closingTags);
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + uiCode + code.substring(lastIndex);
  fs.writeFileSync('src/components/cms/CmsSeoTab.tsx', code);
  console.log('UI appended');
} else {
  // try fallback
  const fallback = "      </div>\n    </div>\n  );\n};";
  const lastIndex2 = code.lastIndexOf(fallback);
  if (lastIndex2 !== -1) {
    code = code.substring(0, lastIndex2) + uiCode + fallback;
    fs.writeFileSync('src/components/cms/CmsSeoTab.tsx', code);
    console.log('UI appended (fallback)');
  } else {
    console.log("Could not find insertion point.");
  }
}
