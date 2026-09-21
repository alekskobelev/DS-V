const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

// 1. Update lucide-react imports
code = code.replace(
  /} from 'lucide-react';/,
  ", Indent, Outdent, FileCode2 } from 'lucide-react';"
);

// 2. Add Extension import and definition
const customExtensionCode = `
import { Extension } from '@tiptap/core';
const IndentExtension = Extension.create({
  name: 'indent',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const padding = element.style.paddingLeft;
              return padding ? parseInt(padding, 10) : 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent) return {};
              return { style: \`padding-left: \${attributes.indent}px\` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let transactionChanged = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.min(currentIndent + 20, 200);
            if (currentIndent !== newIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
              transactionChanged = true;
            }
          }
        });
        if (transactionChanged && dispatch) {
          dispatch(tr);
          return true;
        }
        return transactionChanged;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let transactionChanged = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.max(currentIndent - 20, 0);
            if (currentIndent !== newIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
              transactionChanged = true;
            }
          }
        });
        if (transactionChanged && dispatch) {
          dispatch(tr);
          return true;
        }
        return transactionChanged;
      }
    };
  }
});
`;

code = code.replace("interface RichTextEditorProps", customExtensionCode + "\ninterface RichTextEditorProps");

// 3. Add to extensions array in useEditor
code = code.replace(
  "Youtube.configure({",
  "IndentExtension,\n      Youtube.configure({"
);


// 4. Add new buttons to MenuBar

const indentButtons = `
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().indent().run()}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Увеличить отступ"
      >
        <Indent className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().outdent().run()}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Уменьшить отступ"
      >
        <Outdent className="w-4 h-4" />
      </button>
`;

const htmlButton = `
      <button
        type="button"
        onClick={() => {
          const html = window.prompt('Вставьте HTML код (например, <iframe>...</iframe> или <div>...</div>):');
          if (html) {
            editor.chain().focus().insertContent(html).run();
          }
        }}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Вставить HTML"
      >
        <FileCode2 className="w-4 h-4" />
      </button>
`;

// Insert indent buttons before alignment buttons
code = code.replace(
  `<button\n        type="button"\n        onClick={() => editor.chain().focus().setTextAlign('left')`,
  indentButtons.trim() + "\n      " + `<button\n        type="button"\n        onClick={() => editor.chain().focus().setTextAlign('left')`
);

// Insert html button before Video button
code = code.replace(
  /<button\n        type="button"\n        onClick=\{\(\) => \{\n          const url = window.prompt\('Ссылка на YouTube \(URL\)'\);\n          if \(url\) \{\n            editor.chain\(\).focus\(\).setYoutubeVideo\(\{ src: url \}\).run\(\);\n          \}\n        \}\}\n        className="p-1\.5 hover:bg-gray-200 rounded transition-colors"\n        title="Вставить видео YouTube"\n      >\n        <Video className="w-4 h-4" \/>\n      <\/button>/,
  "$&" + "\n" + htmlButton
);

// 5. Add Table sub-menu to the MenuBar return statement
const tableSubMenu = `
      {editor.isActive('table') && (
        <div className="w-full flex flex-wrap items-center gap-1.5 p-1.5 mt-1 bg-indigo-50/50 border border-indigo-100 rounded text-indigo-900 text-[11px] font-medium">
          <span className="font-bold text-indigo-600 px-1">Таблица:</span>
          
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            + Стб слева
          </button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            + Стб справа
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded">
            - Стб
          </button>
          
          <div className="w-px h-3 bg-indigo-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            + Стр выше
          </button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            + Стр ниже
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded">
            - Стр
          </button>
          
          <div className="w-px h-3 bg-indigo-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            Объединить
          </button>
          <button type="button" onClick={() => editor.chain().focus().splitCell().run()} className="px-2 py-1 hover:bg-indigo-100 rounded">
            Разделить
          </button>
          
          <div className="w-px h-3 bg-indigo-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded font-bold">
            Удалить таблицу
          </button>
        </div>
      )}
`;

code = code.replace(
  /<\/div>\n  \);\n\};\n\nexport const RichTextEditor/,
  tableSubMenu + "\n    </div>\n  );\n};\n\nexport const RichTextEditor"
);

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('RichTextEditor updated');
