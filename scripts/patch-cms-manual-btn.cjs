const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const backupButtonRegex = /<button\s*onClick=\{\(\) => setActiveTab\('backup'\)\}\s*className=\{`px-3\.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 \$\{[\s\S]*?activeTab === 'backup'[\s\S]*?\}`\}\s*>\s*<Code className="w-4 h-4" \/>\s*<span>Экспорт \/ Запуск на ПК<\/span>\s*<\/button>/g;

const manualBtn = `
            <button
              onClick={() => setActiveTab('manual')}
              className={\`px-3.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 \${
                activeTab === 'manual'
                  ? 'bg-white text-[#1E3A8A] font-bold shadow-md shadow-blue-950/20 ring-1 ring-white/60'
                  : 'text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
              }\`}
            >
              <BookOpen className="w-4 h-4 text-orange-300" />
              <span>Инструкция</span>
            </button>
`;

code = code.replace(backupButtonRegex, match => manualBtn + match);
fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Added Manual Tab button');
