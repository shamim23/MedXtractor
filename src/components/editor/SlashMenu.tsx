import React, { useEffect, useRef, useState } from 'react';
import { BlockType, BLOCK_TYPE_CONFIG } from '@/types/blocks';
import {
  Type, Heading1, Heading2, Heading3, List, ListOrdered,
  CheckSquare, ChevronRight, Quote, Minus, AlertCircle, Code,
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
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

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const blockTypes = Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG[BlockType]][];

export const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % blockTypes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + blockTypes.length) % blockTypes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(blockTypes[activeIndex][0]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [activeIndex, onClose, onSelect]);

  return (
    <div
      ref={menuRef}
      className="slash-menu fixed z-50 animate-fade-in max-h-[300px] overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-1">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Basic blocks
        </div>
        {blockTypes.map(([type, config], index) => (
          <div
            key={type}
            className={`slash-menu-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSelect(type)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center flex-shrink-0">
              {ICONS[config.icon]}
            </div>
            <div>
              <div className="font-medium text-sm">{config.label}</div>
              <div className="text-xs text-muted-foreground">{config.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
