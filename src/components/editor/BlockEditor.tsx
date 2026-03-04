import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Block, BlockType } from '@/types/blocks';
import { useWorkspace } from '@/store/useWorkspace';
import { BlockItem } from './BlockItem';
import { SlashMenu } from './SlashMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { BlockContextMenu } from './BlockContextMenu';

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ pageId, blocks }) => {
  const { addBlock, deleteBlock, updateBlock, moveBlock, duplicateBlock } = useWorkspace();
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [floatingToolbar, setFloatingToolbar] = useState<{ top: number; left: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null);
  const dragBlockId = useRef<string | null>(null);

  // Listen for text selection to show floating toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        // Delay hiding to allow toolbar clicks
        setTimeout(() => {
          const sel2 = window.getSelection();
          if (!sel2 || sel2.isCollapsed) {
            setFloatingToolbar(null);
          }
        }, 150);
        return;
      }

      // Check if selection is within our editor
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer as HTMLElement;
      const blockEl = container.closest?.('[data-block-id]') || (container.parentElement?.closest?.('[data-block-id]'));
      if (!blockEl) return;

      const rect = range.getBoundingClientRect();
      setFloatingToolbar({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleKeyDown = useCallback(
    (blockId: string, e: React.KeyboardEvent) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (slashMenu) return;
        const newId = addBlock(pageId, blockId);
        setFocusBlockId(newId);
      }

      if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
        e.preventDefault();
        const idx = blocks.findIndex((b) => b.id === blockId);
        const prevBlock = blocks[idx - 1];
        if (prevBlock) {
          setFocusBlockId(prevBlock.id);
        }
        deleteBlock(pageId, blockId);
      }

      if (e.key === 'ArrowUp' && !slashMenu) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        if (idx > 0) {
          setFocusBlockId(blocks[idx - 1].id);
        }
      }

      if (e.key === 'ArrowDown' && !slashMenu) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        if (idx < blocks.length - 1) {
          setFocusBlockId(blocks[idx + 1].id);
        }
      }
    },
    [blocks, pageId, addBlock, deleteBlock, slashMenu]
  );

  const handleContentChange = useCallback(
    (blockId: string, content: string) => {
      updateBlock(pageId, blockId, { content });

      // Handle slash command
      const textContent = content.replace(/<[^>]*>/g, '');
      if (textContent === '/') {
        const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          setSlashMenu({ blockId, position: { top: rect.bottom + 4, left: rect.left } });
        }
      } else if (slashMenu?.blockId === blockId && !textContent.startsWith('/')) {
        setSlashMenu(null);
      }
    },
    [pageId, updateBlock, slashMenu]
  );

  const handleSlashSelect = useCallback(
    (type: BlockType) => {
      if (!slashMenu) return;
      updateBlock(pageId, slashMenu.blockId, { type, content: '' });
      setSlashMenu(null);
      setFocusBlockId(slashMenu.blockId);
    },
    [slashMenu, pageId, updateBlock]
  );

  const handleDragStart = (blockId: string) => {
    dragBlockId.current = blockId;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragBlockId.current) {
      moveBlock(pageId, dragBlockId.current, targetIndex);
      dragBlockId.current = null;
    }
    setDragOverIndex(null);
  };

  const handleContextMenu = (blockId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      blockId,
      position: { top: e.clientY, left: e.clientX },
    });
  };

  return (
    <div className="py-2">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          className={dragOverIndex === index ? 'border-t-2 border-primary/30' : ''}
        >
          <BlockItem
            block={block}
            pageId={pageId}
            onKeyDown={(e) => handleKeyDown(block.id, e)}
            onContentChange={(content) => handleContentChange(block.id, content)}
            onDragStart={() => handleDragStart(block.id)}
            focusBlockId={focusBlockId}
            onFocused={() => setFocusBlockId(null)}
            index={index}
            onContextMenu={(e) => handleContextMenu(block.id, e)}
          />
        </div>
      ))}

      {slashMenu && (
        <SlashMenu
          position={slashMenu.position}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu(null)}
        />
      )}

      {floatingToolbar && (
        <FloatingToolbar
          position={floatingToolbar}
          onClose={() => setFloatingToolbar(null)}
        />
      )}

      {contextMenu && (
        <BlockContextMenu
          position={contextMenu.position}
          blockId={contextMenu.blockId}
          pageId={pageId}
          onClose={() => setContextMenu(null)}
          onTurnInto={(type) => updateBlock(pageId, contextMenu.blockId, { type })}
          onDuplicate={() => duplicateBlock(pageId, contextMenu.blockId)}
          onDelete={() => deleteBlock(pageId, contextMenu.blockId)}
          onColorChange={(color, bgColor) => {
            const updates: Partial<Block> = {};
            if (color !== undefined) updates.color = color || undefined;
            if (bgColor !== undefined) updates.bgColor = bgColor || undefined;
            updateBlock(pageId, contextMenu.blockId, updates);
          }}
        />
      )}
    </div>
  );
};
