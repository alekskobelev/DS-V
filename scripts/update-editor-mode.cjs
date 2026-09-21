const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

// Add imports
code = code.replace(
  /import \{ useEditor, EditorContent \} from '@tiptap\/react';/,
  `import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { Settings, FileText, Code2, TextSelect } from 'lucide-react';`
);

// Update RichTextEditor component
const replacement = `export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const [mode, setMode] = useState<'wysiwyg' | 'markdown' | 'html'>('wysiwyg');
  const [localMarkdown, setLocalMarkdown] = useState('');
  const [localHtml, setLocalHtml] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Underline, Superscript, Subscript, TextStyle, Color,
      Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-200 rounded px-1' } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'min-w-full border-collapse border border-gray-300 my-4' } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-left' } }),
      TableCell.configure({ HTMLAttributes: { class: 'border border-gray-300 px-4 py-2' } }),
      IndentExtension,
      Youtube.configure({ inline: false, HTMLAttributes: { class: 'w-full aspect-video rounded-lg my-4' } })
    ],
    content,
    onUpdate: ({ editor }) => {
      if (mode === 'wysiwyg') {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 min-h-[300px] text-gray-800 bg-white',
      },
    },
  });

  // Sync editor content if updated from outside (e.g., when mode changes updated it)
  useEffect(() => {
    if (editor && mode === 'wysiwyg') {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml && content !== '<p></p>') {
        // avoid cursor jump issues if we can, but since mode switch usually blurs, it's fine
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor, mode]);

  const switchMode = (newMode: 'wysiwyg' | 'markdown' | 'html') => {
    if (newMode === mode) return;
    
    if (newMode === 'markdown') {
      const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      setLocalMarkdown(td.turndown(content || ''));
    } else if (newMode === 'html') {
      setLocalHtml(content || '');
    }
    setMode(newMode);
    setShowSettings(false);
  };

  const handleMarkdownChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalMarkdown(val);
    const html = await marked.parse(val);
    onChange(html);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalHtml(val);
    onChange(val);
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-visible bg-white flex flex-col shadow-sm relative z-10">
      
      {/* Mode Switcher Header */}
      <div className="bg-gray-800 text-white flex items-center justify-between px-3 py-2 rounded-t-xl">
        <div className="text-xs font-semibold flex items-center gap-2">
          {mode === 'wysiwyg' && <><TextSelect className="w-3.5 h-3.5"/> Визуальный редактор (WYSIWYG)</>}
          {mode === 'markdown' && <><FileText className="w-3.5 h-3.5"/> Разметка Markdown</>}
          {mode === 'html' && <><Code2 className="w-3.5 h-3.5"/> Исходный HTML</>}
        </div>
        
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
              <button 
                type="button"
                onClick={() => switchMode('wysiwyg')}
                className={\`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-700 \${mode === 'wysiwyg' ? 'bg-gray-700 text-blue-400 font-bold' : 'text-gray-200'}\`}
              >
                <TextSelect className="w-4 h-4"/> Визуальный редактор
              </button>
              <button 
                type="button"
                onClick={() => switchMode('markdown')}
                className={\`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-700 border-t border-gray-700 \${mode === 'markdown' ? 'bg-gray-700 text-blue-400 font-bold' : 'text-gray-200'}\`}
              >
                <FileText className="w-4 h-4"/> Разметка Markdown
              </button>
              <button 
                type="button"
                onClick={() => switchMode('html')}
                className={\`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-700 border-t border-gray-700 \${mode === 'html' ? 'bg-gray-700 text-blue-400 font-bold' : 'text-gray-200'}\`}
              >
                <Code2 className="w-4 h-4"/> Исходный HTML
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === 'wysiwyg' && <MenuBar editor={editor} />}
      
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {mode === 'wysiwyg' && <EditorContent editor={editor} />}
        
        {mode === 'markdown' && (
          <textarea
            value={localMarkdown}
            onChange={handleMarkdownChange}
            className="w-full h-full min-h-[300px] p-4 text-sm font-mono text-gray-800 bg-gray-50 resize-y focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500"
            placeholder="Пишите в формате Markdown..."
          />
        )}

        {mode === 'html' && (
          <textarea
            value={localHtml}
            onChange={handleHtmlChange}
            className="w-full h-full min-h-[300px] p-4 text-sm font-mono text-blue-900 bg-blue-50/50 resize-y focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500"
            placeholder="Вставьте или отредактируйте HTML код..."
          />
        )}
      </div>
    </div>
  );
};`;

code = code.replace(/export const RichTextEditor: React\.FC<RichTextEditorProps> = \(\{ content, onChange \}\) => \{[\s\S]*$/, replacement);

// Also remove border-t-xl from MenuBar since we now have a header above it
code = code.replace(/rounded-t-xl text-gray-700/, 'text-gray-700');

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('RichTextEditor mode switcher implemented');
