import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link,
  Type, Palette, ChevronDown,
} from 'lucide-react';

interface FloatingToolbarProps {
  position: { top: number; left: number };
  onClose: () => void;
}

const TEXT_COLORS = [
  { label: 'Default', color: 'inherit', var: '' },
  { label: 'Gray', color: 'hsl(0 0% 55%)', var: 'gray' },
  { label: 'Brown', color: 'hsl(30 60% 50%)', var: 'brown' },
  { label: 'Orange', color: 'hsl(25 95% 53%)', var: 'orange' },
  { label: 'Yellow', color: 'hsl(45 93% 47%)', var: 'yellow' },
  { label: 'Green', color: 'hsl(142 71% 45%)', var: 'green' },
  { label: 'Blue', color: 'hsl(217 91% 60%)', var: 'blue' },
  { label: 'Purple', color: 'hsl(263 70% 50%)', var: 'purple' },
  { label: 'Pink', color: 'hsl(330 81% 60%)', var: 'pink' },
  { label: 'Red', color: 'hsl(0 84% 60%)', var: 'red' },
];

const BG_COLORS = [
  { label: 'Default', color: 'transparent', var: '' },
  { label: 'Gray', color: 'hsl(0 0% 90%)', var: 'gray' },
  { label: 'Brown', color: 'hsl(30 60% 90%)', var: 'brown' },
  { label: 'Orange', color: 'hsl(25 95% 90%)', var: 'orange' },
  { label: 'Yellow', color: 'hsl(45 93% 90%)', var: 'yellow' },
  { label: 'Green', color: 'hsl(142 71% 90%)', var: 'green' },
  { label: 'Blue', color: 'hsl(217 91% 90%)', var: 'blue' },
  { label: 'Purple', color: 'hsl(263 70% 90%)', var: 'purple' },
  { label: 'Pink', color: 'hsl(330 81% 90%)', var: 'pink' },
  { label: 'Red', color: 'hsl(0 84% 90%)', var: 'red' },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ position, onClose }) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Don't close immediately - let selection events finish
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            onClose();
          }
        }, 10);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleFormat = (command: string) => {
    execCommand(command);
  };

  const handleTextColor = (color: string) => {
    execCommand('foreColor', color === 'inherit' ? '' : color);
    setShowColorPicker(false);
  };

  const handleBgColor = (color: string) => {
    execCommand('hiliteColor', color);
    setShowColorPicker(false);
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Calculate position to keep toolbar on screen
  const adjustedLeft = Math.max(8, Math.min(position.left - 140, window.innerWidth - 320));
  const adjustedTop = position.top - 48;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] animate-fade-in"
      style={{ top: adjustedTop, left: adjustedLeft }}
    >
      {/* Main toolbar */}
      <div className="flex items-center bg-popover border border-border rounded-lg shadow-xl px-1 py-0.5 gap-0.5">
        {/* Text style indicator */}
        <button
          onClick={() => {}}
          className="flex items-center gap-0.5 px-2 py-1.5 rounded hover:bg-accent text-sm font-medium text-foreground transition-colors"
        >
          <Type className="h-3.5 w-3.5" />
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => handleFormat('bold')}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Bold (⌘B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleFormat('italic')}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Italic (⌘I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleFormat('underline')}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Underline (⌘U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleFormat('strikeThrough')}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Link"
        >
          <Link className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) {
              const range = sel.getRangeAt(0);
              const code = document.createElement('code');
              code.className = 'bg-accent text-destructive px-1 py-0.5 rounded text-[0.9em] font-mono';
              range.surroundContents(code);
            }
          }}
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors"
          title="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-border" />

        {/* Color picker toggle */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`p-1.5 rounded hover:bg-accent transition-colors ${showColorPicker ? 'bg-accent text-foreground' : 'text-foreground'}`}
          title="Color"
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div className="mt-1 bg-popover border border-border rounded-lg shadow-xl p-2 min-w-[200px] animate-fade-in">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
            Text color
          </div>
          {TEXT_COLORS.map((c) => (
            <button
              key={`text-${c.label}`}
              onClick={() => handleTextColor(c.color)}
              className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-accent text-sm transition-colors"
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                style={{ color: c.color === 'inherit' ? 'hsl(var(--foreground))' : c.color }}
              >
                A
              </span>
              <span className="text-foreground">{c.label} text</span>
            </button>
          ))}

          <div className="my-1 border-t border-border" />

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
            Background color
          </div>
          {BG_COLORS.map((c) => (
            <button
              key={`bg-${c.label}`}
              onClick={() => handleBgColor(c.color)}
              className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-accent text-sm transition-colors"
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: c.color === 'transparent' ? 'hsl(var(--accent))' : c.color }}
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
