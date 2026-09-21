const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

const oldHeaderStart = `{/* Mode Switcher Header */}
      <div className="bg-gray-800 text-white flex items-center justify-between px-3 py-2 rounded-t-xl">`;

const oldHeaderEnd = `            </div>
          )}
        </div>
      </div>`;

const newHeader = `{/* Mode Switcher Header - Visible Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 flex items-center px-2 py-1.5 rounded-t-xl gap-1">
        <button 
          type="button"
          onClick={() => switchMode('wysiwyg')}
          className={\`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all \${mode === 'wysiwyg' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}\`}
        >
          <TextSelect className="w-3.5 h-3.5" /> 
          <span className="hidden sm:inline">Визуальный</span>
          <span className="sm:hidden">WYSIWYG</span>
        </button>
        <button 
          type="button"
          onClick={() => switchMode('markdown')}
          className={\`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all \${mode === 'markdown' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}\`}
        >
          <FileText className="w-3.5 h-3.5" /> 
          Markdown
        </button>
        <button 
          type="button"
          onClick={() => switchMode('html')}
          className={\`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all \${mode === 'html' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}\`}
        >
          <Code2 className="w-3.5 h-3.5" /> 
          HTML
        </button>
      </div>`;

const startIdx = code.indexOf(oldHeaderStart);
if (startIdx !== -1) {
  const endIdx = code.indexOf(oldHeaderEnd, startIdx) + oldHeaderEnd.length;
  code = code.substring(0, startIdx) + newHeader + code.substring(endIdx);
  fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
  console.log('Tabs updated');
} else {
  console.log('Error finding old header block');
}
