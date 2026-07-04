'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2 } from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[120px] p-3 text-ink font-body',
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[120px] border border-border rounded-sm bg-surface animate-pulse" />;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ 
    isActive, 
    onClick, 
    children, 
    title 
  }: { 
    isActive: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string 
  }) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-sm flex items-center justify-center transition-colors ${
        isActive ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-sm bg-surface flex flex-col overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface p-1">
        <ToolbarButton
          title="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          title="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          title="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarButton
          title="Link"
          isActive={editor.isActive('link')}
          onClick={toggleLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="flex-1 cursor-text" />
      
      {/* Required basic styles for prose to look good if tailwind typography isn't installed */}
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder || 'Start typing...'}';
          float: left;
          color: var(--color-ink-faint);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.2;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror a {
          color: var(--color-primary);
          text-decoration: underline;
          cursor: pointer;
        }
      `}} />
    </div>
  );
}
