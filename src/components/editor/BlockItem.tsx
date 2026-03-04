import React, { useEffect, useRef } from 'react';
import { Block } from '@/types/blocks';
import { useWorkspace } from '@/store/useWorkspace';
import { GripVertical, ChevronRight, Check, MoreHorizontal } from 'lucide-react';

interface BlockItemProps {
  block: Block;
  pageId: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onContentChange: (content: string) => void;
  onDragStart: () => void;
  focusBlockId: string | null;
  onFocused: () => void;
  index: number;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  pageId,
  onKeyDown,
  onContentChange,
  onDragStart,
  focusBlockId,
  onFocused,
  onContextMenu,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { updateBlock } = useWorkspace();

  // Set initial content on mount only
  useEffect(() => {
    if (ref.current && block.content && !ref.current.textContent) {
      ref.current.innerHTML = block.content;
    }
  }, []);

  useEffect(() => {
    if (focusBlockId === block.id && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      onFocused();
    }
  }, [focusBlockId, block.id, onFocused]);

  const handleInput = () => {
    if (ref.current) {
      onContentChange(ref.current.innerHTML || '');
    }
  };

  if (block.type === 'divider') {
    return (
      <div className="block-wrapper group flex items-center gap-1 py-2 px-1">
        <div className="drag-handle w-6 flex-shrink-0 flex justify-center" draggable onDragStart={onDragStart}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <button
          onClick={onContextMenu}
          className="drag-handle w-5 flex-shrink-0 flex justify-center"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
        <hr className="flex-1 border-border" />
      </div>
    );
  }

  const blockStyles: Record<string, string> = {
    text: 'text-base leading-relaxed',
    heading1: 'text-3xl font-bold notion-page-title mt-6 mb-1',
    heading2: 'text-2xl font-semibold mt-5 mb-1',
    heading3: 'text-xl font-medium mt-4 mb-1',
    'bulleted-list': 'text-base leading-relaxed',
    'numbered-list': 'text-base leading-relaxed',
    todo: 'text-base leading-relaxed',
    toggle: 'text-base leading-relaxed',
    quote: 'text-base leading-relaxed border-l-[3px] border-foreground pl-4 italic',
    callout: 'text-base leading-relaxed bg-accent rounded-md p-3',
    code: 'text-sm font-mono bg-accent rounded-md p-3 whitespace-pre-wrap',
  };

  const placeholder: Record<string, string> = {
    text: "Type '/' for commands...",
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    'bulleted-list': 'List item',
    'numbered-list': 'List item',
    todo: 'To-do',
    toggle: 'Toggle',
    quote: 'Quote',
    callout: 'Callout',
    code: 'Code',
  };

  const colorStyle: React.CSSProperties = {};
  if (block.color) colorStyle.color = block.color;
  if (block.bgColor) colorStyle.backgroundColor = block.bgColor;

  return (
    <div
      className="block-wrapper group flex items-start gap-1 py-[2px] px-1 rounded"
      style={block.bgColor ? { backgroundColor: block.bgColor } : undefined}
    >
      <div className="drag-handle flex-shrink-0 flex items-center gap-0 pt-1">
        <button
          onClick={onContextMenu}
          className="w-5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
        <div
          className="w-5 flex justify-center cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={onDragStart}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {block.type === 'bulleted-list' && (
        <span className="flex-shrink-0 mt-[6px] mr-1 w-[6px] h-[6px] rounded-full bg-foreground" />
      )}

      {block.type === 'numbered-list' && (
        <span className="flex-shrink-0 mt-[2px] mr-1 text-sm text-muted-foreground min-w-[20px]" />
      )}

      {block.type === 'todo' && (
        <button
          onClick={() => updateBlock(pageId, block.id, { checked: !block.checked })}
          className={`flex-shrink-0 mt-[3px] mr-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            block.checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-muted-foreground'
          }`}
        >
          {block.checked && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>
      )}

      {block.type === 'toggle' && (
        <button
          onClick={() => updateBlock(pageId, block.id, { collapsed: !block.collapsed })}
          className="flex-shrink-0 mt-[3px] mr-1"
        >
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              !block.collapsed ? 'rotate-90' : ''
            }`}
          />
        </button>
      )}

      <div
        ref={ref}
        data-block-id={block.id}
        contentEditable
        suppressContentEditableWarning
        className={`block-content flex-1 min-h-[1.5em] outline-none ${blockStyles[block.type] || ''} ${
          block.type === 'todo' && block.checked ? 'line-through text-muted-foreground' : ''
        }`}
        style={block.color ? { color: block.color } : undefined}
        data-placeholder={placeholder[block.type] || "Type '/' for commands..."}
        onInput={handleInput}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
