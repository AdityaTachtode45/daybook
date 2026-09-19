import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { useWritingMode } from '../../theme/WritingModeContext';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  List,
  Quote,
} from 'lucide-react';

interface EditorialEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const placeholderPrompts = [
  'What made you smile today?',
  'How did your day feel?',
  'What is on your mind right now?',
  'Describe a moment worth remembering...',
  'What did you learn or accomplish today?',
];

export const EditorialEditor: React.FC<EditorialEditorProps> = ({ content, onChange, readOnly }) => {
  const { notifyWriting } = useWritingMode();
  const randomPlaceholder = React.useMemo(
    () => placeholderPrompts[Math.floor(Math.random() * placeholderPrompts.length)],
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      PlaceholderExtension.configure({
        placeholder: randomPlaceholder,
      }),
    ],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      notifyWriting();
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
    <div className="w-full relative">
      {/* Floating TipTap Bubble Menu */}
      {!readOnly && editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="flex items-center gap-1 p-1.5 rounded-btn bg-surface border border-border shadow-xl text-xs z-30"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('bold') ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('italic') ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('strike') ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Heading"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('bulletList') ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-surface-2 transition-colors ${
              editor.isActive('blockquote') ? 'text-accent font-bold' : 'text-muted'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Editor Surface */}
      <div className="prose max-w-none text-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
