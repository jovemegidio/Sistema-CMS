import { useState, useCallback } from 'react';
import { marked } from 'marked';
import { Bold, Italic, Heading1, Heading2, List, Link, Code, Eye, Edit3 } from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = '') => {
      const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);

      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    },
    [value, onChange]
  );

  const getHtml = () => {
    try {
      return { __html: marked(value || '', { breaks: true }) as string };
    } catch {
      return { __html: value };
    }
  };

  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('**', '**')} title="Bold">
            <Bold size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('*', '*')} title="Italic">
            <Italic size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('## ')} title="Heading 2">
            <Heading1 size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('### ')} title="Heading 3">
            <Heading2 size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('- ')} title="List">
            <List size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('[', '](url)')} title="Link">
            <Link size={16} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('`', '`')} title="Code">
            <Code size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => setMode('edit')}
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${mode === 'preview' ? 'active' : ''}`}
            onClick={() => setMode('preview')}
            title="Preview"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          id="markdown-editor"
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write your content using Markdown...'}
          rows={20}
        />
      ) : (
        <div className="editor-preview markdown-body" dangerouslySetInnerHTML={getHtml()} />
      )}
    </div>
  );
}
