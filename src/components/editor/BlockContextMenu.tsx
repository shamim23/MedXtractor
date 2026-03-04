import React, { useEffect, useRef, useState } from 'react';
import { BlockType, BLOCK_TYPE_CONFIG } from '@/types/blocks';
import {
  Copy, Trash2, ArrowRightLeft, Palette, Link2, CopyPlus,
  Type, Heading1, Heading2, Heading3, List, ListOrdered,
  CheckSquare, ChevronRight, Quote, Minus, AlertCircle, Code,
} from 'lucide-react';

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="h-4 w-4" />,
  Heading1: <Heading1 className="h-4 w-4" />,
  Heading2: <Heading2 className="h-4 w-4" />,
  Heading3: <Heading3 className="h-4 w-4" />,
  List: <List className="h-4 w-4" />,
  ListOrdered: <ListOrdered className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  ChevronRight: <ChevronRight className="h-4 w-4" />,
  Quote: <Quote className="h-4 w-4" />,
  Minus: <Minus className="h-4 w-4" />,
  AlertCircle: <AlertCircle className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
};

const TEXT_COLORS = [
  { label: 'Default', color: '', css: '' },
  { label: 'Gray', color: 'hsl(0 0% 55%)', css: 'gray' },
  { label: 'Brown', color: 'hsl(30 60% 50%)', css: 'brown' },
  { label: 'Orange', color: 'hsl(25 95% 53%)', css: 'orange' },
  { label: 'Yellow', color: 'hsl(45 93% 47%)', css: 'yellow' },
  { label: 'Green', color: 'hsl(142 71% 45%)', css: 'green' },
  { label: 'Blue', color: 'hsl(217 91% 60%)', css: 'blue' },
  { label: 'Purple', color: 'hsl(263 70% 50%)', css: 'purple' },
  { label: 'Pink', color: 'hsl(330 81% 60%)', css: 'pink' },
  { label: 'Red', color: 'hsl(0 84% 60%)', css: 'red' },
];

const BG_COLORS = [
  { label: 'Default', color: '', css: '' },
  { label: 'Gray', color: 'hsl(0 0% 90%)', css: 'gray' },
  { label: 'Brown', color: 'hsl(30 60% 90%)', css: 'brown' },
  { label: 'Orange', color: 'hsl(25 95% 90%)', css: 'orange' },
  { label: 'Yellow', color: 'hsl(45 93% 90%)', css: 'yellow' },
  { label: 'Green', color: 'hsl(142 71% 90%)', css: 'green' },
  { label: 'Blue', color: 'hsl(217 91% 90%)', css: 'blue' },
  { label: 'Purple', color: 'hsl(263 70% 90%)', css: 'purple' },
  { label: 'Pink', color: 'hsl(330 81% 90%)', css: 'pink' },
  { label: 'Red', color: 'hsl(0 84% 90%)', css: 'red' },
];

interface BlockContextMenuProps {
  position: { top: number; left: number };
  blockId: string;
  pageId: string;
  onClose: () => void;
  onTurnInto: (type: BlockType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onColorChange: (color: string, bgColor: string) => void;
}

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({
  position,
  blockId,
  pageId,
  onClose,
  onTurnInto,
  onDuplicate,
  onDelete,
  onColorChange,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [subMenu, setSubMenu] = useState<'turn-into' | 'color' | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const blockTypes = Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG[BlockType]][];

  // Position adjustments
  const adjustedTop = Math.min(position.top, window.innerHeight - 400);
  const adjustedLeft = Math.min(position.left, window.innerWidth - 260);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] animate-fade-in flex gap-0.5"
      style={{ top: adjustedTop, left: adjustedLeft }}
    >
      {/* Main menu */}
      <div className="bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[220px] max-h-[400px] overflow-y-auto">
        {/* Turn into */}
        <button
          className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-accent text-foreground transition-colors"
          onMouseEnter={() => setSubMenu('turn-into')}
        >
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            Turn into
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Color */}
        <button
          className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-accent text-foreground transition-colors"
          onMouseEnter={() => setSubMenu('color')}
        >
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            Color
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        <div className="my-1 border-t border-border" />

        {/* Copy link */}
        <button
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent text-foreground transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(`#${blockId}`);
            onClose();
          }}
          onMouseEnter={() => setSubMenu(null)}
        >
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Copy link to block
          <span className="ml-auto text-xs text-muted-foreground">⌘⌥L</span>
        </button>

        {/* Duplicate */}
        <button
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent text-foreground transition-colors"
          onClick={() => { onDuplicate(); onClose(); }}
          onMouseEnter={() => setSubMenu(null)}
        >
          <CopyPlus className="h-4 w-4 text-muted-foreground" />
          Duplicate
          <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
        </button>

        <div className="my-1 border-t border-border" />

        {/* Delete */}
        <button
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent text-destructive transition-colors"
          onClick={() => { onDelete(); onClose(); }}
          onMouseEnter={() => setSubMenu(null)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
          <span className="ml-auto text-xs text-muted-foreground">Del</span>
        </button>
      </div>

      {/* Sub menus */}
      {subMenu === 'turn-into' && (
        <div className="bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[200px] max-h-[350px] overflow-y-auto animate-fade-in">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Turn into
          </div>
          {blockTypes.map(([type, config]) => (
            <button
              key={type}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent text-foreground transition-colors"
              onClick={() => { onTurnInto(type); onClose(); }}
            >
              <span className="w-6 h-6 rounded bg-accent flex items-center justify-center flex-shrink-0">
                {BLOCK_ICONS[config.icon]}
              </span>
              {config.label}
            </button>
          ))}
        </div>
      )}

      {subMenu === 'color' && (
        <div className="bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[200px] max-h-[400px] overflow-y-auto animate-fade-in">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Text color
          </div>
          {TEXT_COLORS.map((c) => (
            <button
              key={`text-${c.label}`}
              className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-accent text-sm transition-colors"
              onClick={() => { onColorChange(c.color, ''); onClose(); }}
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                style={{ color: c.color || 'hsl(var(--foreground))' }}
              >
                A
              </span>
              <span className="text-foreground">{c.label} text</span>
            </button>
          ))}

          <div className="my-1 border-t border-border" />

          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Background color
          </div>
          {BG_COLORS.map((c) => (
            <button
              key={`bg-${c.label}`}
              className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-accent text-sm transition-colors"
              onClick={() => { onColorChange('', c.color); onClose(); }}
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: c.color || 'hsl(var(--accent))' }}
              >
                A
              </span>
              <span className="text-foreground">{c.label} background</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
