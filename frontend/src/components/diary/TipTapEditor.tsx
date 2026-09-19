import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange, readOnly }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full rounded-2xl glass-card border border-white/10 overflow-hidden">
      {/* Editor Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 bg-surface-muted/80 border-b border-white/5 flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('bold') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('italic') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('strike') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('bulletList') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('orderedList') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg text-xs transition-colors ${
              editor.isActive('blockquote') ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="p-4 sm:p-6 text-gray-200">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
