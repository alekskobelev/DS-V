import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
import TurndownService from 'turndown';
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';
import { Settings, FileText, Code2, TextSelect } from 'lucide-react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon,
  Image as ImageIcon, Quote, SquareTerminal, Sparkles,
  Undo, Redo, Superscript as SupIcon, Subscript as SubIcon,
  Highlighter, Palette, Table as TableIcon, Video
, Indent, Outdent, FileCode2 } from 'lucide-react';


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
              return { style: `padding-left: ${attributes.indent}px` };
            }
          }
        }
      }
    ];
  },
  addCommands(): any {
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

interface RichTextEditorProps {
  placeholder?: string;
  content: string;
  onChange: (html: string) => void;
  minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#f8f9fa] border-b border-[#e5e7eb] text-slate-500">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
        title="Отменить"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
        title="Повторить"
      >
        <Redo className="w-4 h-4" />
      </button>
      
      <div className="w-px h-5 bg-gray-300 mx-1" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Жирный"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Курсив"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Подчеркнутый"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Зачеркнутый"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('superscript') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Надстрочный"
      >
        <SupIcon className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('subscript') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Подстрочный"
      >
        <SubIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center font-bold text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Заголовок 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center font-bold text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Заголовок 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center font-bold text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Заголовок 3"
      >
        H3
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Маркированный список"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Нумерованный список"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

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
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="По левому краю"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="По центру"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="По правому краю"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : ''}`}
        title="По ширине"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL прямого файла для скачивания (PDF, DOCX, ZIP и т.д.)');
          if (url) {
            const fileName = window.prompt('Текст ссылки (Название файла)', 'Скачать документ');
            if (fileName) {
              editor.chain().focus().insertContent(`<a href="${url}" target="_blank" download class="text-blue-600 underline font-semibold">${fileName}</a>`).run();
            }
          }
        }}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors text-emerald-700"
        title="Прикрепить файл (Прямая ссылка)"
      >
        <FileCode2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('Ссылка (URL)', previousUrl);
          if (url === null) {
            return;
          }
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Вставить ссылку"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Ссылка на картинку (URL)');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Вставить картинку"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Ссылка на YouTube (URL)');
          if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }
        }}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Вставить видео YouTube"
      >
        <Video className="w-4 h-4" />
      </button>

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

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Цитата"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Блок кода"
      >
        <SquareTerminal className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Вставить таблицу"
      >
        <TableIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="Горизонтальная линия"
      >
        —
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />
      
      <input
        type="color"
        onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-6 h-6 border-0 p-0 rounded overflow-hidden cursor-pointer"
        title="Цвет текста"
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-700' : ''}`}
        title="Выделить фон"
      >
        <Highlighter className="w-4 h-4" />
      </button>
    
      {editor.isActive('table') && (
        <div className="w-full flex flex-wrap items-center gap-1.5 p-1.5 mt-1 bg-blue-50/50 border border-blue-100 rounded text-blue-900 text-[11px] font-medium">
          <span className="font-bold text-blue-600 px-1">Таблица:</span>
          
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            + Стб слева
          </button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            + Стб справа
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded">
            - Стб
          </button>
          
          <div className="w-px h-3 bg-blue-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            + Стр выше
          </button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            + Стр ниже
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded">
            - Стр
          </button>
          
          <div className="w-px h-3 bg-blue-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            Объединить
          </button>
          <button type="button" onClick={() => editor.chain().focus().splitCell().run()} className="px-2 py-1 hover:bg-blue-100 rounded">
            Разделить
          </button>
          
          <div className="w-px h-3 bg-blue-200 mx-1" />
          
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 hover:bg-red-100 text-red-600 rounded font-bold">
            Удалить таблицу
          </button>
        </div>
      )}

    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, minHeight = 'min-h-[120px]' }) => {
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
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 ${minHeight} text-gray-800 bg-white rounded-b-xl transition-all`,
      },
    },
  });

  // Sync editor content if updated from outside (e.g., when mode changes updated it)
  useEffect(() => {
    if (editor && mode === 'wysiwyg') {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml && content !== '<p></p>') {
        // avoid cursor jump issues if we can, but since mode switch usually blurs, it's fine
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor, mode]);

  const switchMode = (newMode: 'wysiwyg' | 'markdown' | 'html') => {
    if (newMode === mode) return;
    
    if (newMode === 'markdown') {
      const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      td.use(gfm);
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
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white flex flex-col shadow-2xs relative z-10 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      
      {/* Mode Switcher Header - Visible Tabs */}
      <div className="bg-slate-50 border-b border-gray-200 flex items-center px-2 py-1.5 rounded-t-xl gap-1">
        <button 
          type="button"
          onClick={() => switchMode('wysiwyg')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${mode === 'wysiwyg' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <TextSelect className="w-3.5 h-3.5" /> 
          <span className="hidden sm:inline">Визуальный</span>
          <span className="sm:hidden">WYSIWYG</span>
        </button>
        <button 
          type="button"
          onClick={() => switchMode('markdown')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${mode === 'markdown' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <FileText className="w-3.5 h-3.5" /> 
          Markdown
        </button>
        <button 
          type="button"
          onClick={() => switchMode('html')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${mode === 'html' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <Code2 className="w-3.5 h-3.5" /> 
          HTML
        </button>
      </div>

      {mode === 'wysiwyg' && <MenuBar editor={editor} />}
      
      <div className="flex-1 rounded-b-xl overflow-hidden bg-white">
        {mode === 'wysiwyg' && <EditorContent editor={editor} className="rounded-b-xl overflow-hidden" />}
        
        {mode === 'markdown' && (
          <textarea
            value={localMarkdown}
            onChange={handleMarkdownChange}
            className={`w-full ${minHeight} p-4 text-sm font-mono text-gray-800 bg-slate-50 rounded-b-xl resize-y focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500`}
            placeholder="Пишите в формате Markdown..."
          />
        )}

        {mode === 'html' && (
          <textarea
            value={localHtml}
            onChange={handleHtmlChange}
            className={`w-full ${minHeight} p-4 text-sm font-mono text-blue-900 bg-blue-50/50 rounded-b-xl resize-y focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500`}
            placeholder="Вставьте или отредактируйте HTML код..."
          />
        )}
      </div>
    </div>
  );
};