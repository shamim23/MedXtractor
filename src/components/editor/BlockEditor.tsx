import React, { useCallback, useRef, useState } from 'react';
import { Block, BlockType } from '@/types/blocks';
import { useWorkspace } from '@/store/useWorkspace';
import { BlockItem } from './BlockItem';
import { SlashMenu } from './SlashMenu';

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ pageId, blocks }) => {
  const { addBlock, deleteBlock, updateBlock, moveBlock } = useWorkspace();
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { top: number; left: number } } | null>(null);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragBlockId = useRef<string | null>(null);

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
      if (content === '/') {
        const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          setSlashMenu({ blockId, position: { top: rect.bottom + 4, left: rect.left } });
        }
      } else if (slashMenu?.blockId === blockId && !content.startsWith('/')) {
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
    </div>
  );
};
