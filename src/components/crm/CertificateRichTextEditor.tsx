import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify, 
  RotateCcw, 
  RotateCw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PRESET_COURSE_TOPICS } from '../../data/defaultCertificates';

interface CertificateRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onApplyPreset?: (topic: string, text: string, hours: number) => void;
}

export const CertificateRichTextEditor: React.FC<CertificateRichTextEditorProps> = ({
  value,
  onChange,
  onApplyPreset
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph']
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[140px] px-4.5 py-2.5 text-xs text-slate-800 leading-relaxed'
      }
    }
  });

  // Keep editor content in sync if value changed externally (e.g. from template click)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-xs">
      {/* Editor Formatting Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-1.5 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('bold') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="Жирный (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('italic') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="Курсив (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('underline') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="Подчеркнутый (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="Маркированный список"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="Нумерованный список"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="По левому краю"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="По центру"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
          }`}
          title="По ширине"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40"
          title="Отменить (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40"
          title="Повторить (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};
