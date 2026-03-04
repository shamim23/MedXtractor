import React, { useState } from 'react';
import { useWorkspace } from '@/store/useWorkspace';
import { Plus, Search, ChevronRight, Trash2, MoreHorizontal, ChevronsLeft } from 'lucide-react';

export const WorkspaceSidebar: React.FC = () => {
  const { pages, activePageId, setActivePageId, addPage, deletePage, sidebarOpen, toggleSidebar } = useWorkspace();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  const rootPages = pages.filter((p) => !p.parentId);
  const childPages = (parentId: string) => pages.filter((p) => p.parentId === parentId);

  const filtered = search
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : rootPages;

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-40 p-1.5 rounded-md hover:bg-accent transition-colors"
        title="Open sidebar"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar-bg h-screen flex flex-col border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-semibold text-foreground tracking-tight">Workspace</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-sidebar-hover transition-colors"
            title="Close sidebar"
          >
            <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-accent text-sm rounded-md pl-7 pr-2 py-1.5 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
          <button
            onClick={() => addPage()}
            className="p-0.5 rounded hover:bg-sidebar-hover transition-colors"
            title="New page"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {filtered.map((page) => (
          <PageItem
            key={page.id}
            page={page}
            isActive={page.id === activePageId}
            onSelect={() => setActivePageId(page.id)}
            onDelete={() => deletePage(page.id)}
            onAddChild={() => addPage(page.id)}
            hovered={hoveredId === page.id}
            onHover={(h) => setHoveredId(h ? page.id : null)}
            contextMenu={contextMenu === page.id}
            onContextMenu={() => setContextMenu(contextMenu === page.id ? null : page.id)}
            children={childPages(page.id).map((child) => (
              <PageItem
                key={child.id}
                page={child}
                isActive={child.id === activePageId}
                onSelect={() => setActivePageId(child.id)}
                onDelete={() => deletePage(child.id)}
                hovered={hoveredId === child.id}
                onHover={(h) => setHoveredId(h ? child.id : null)}
                contextMenu={contextMenu === child.id}
                onContextMenu={() => setContextMenu(contextMenu === child.id ? null : child.id)}
                indent
              />
            ))}
          />
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 py-2 border-t border-border">
        <button
          onClick={() => addPage()}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-hover rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          New page
        </button>
      </div>
    </aside>
  );
};

interface PageItemProps {
  page: { id: string; title: string; icon: string };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
  hovered: boolean;
  onHover: (h: boolean) => void;
  contextMenu: boolean;
  onContextMenu: () => void;
  indent?: boolean;
  children?: React.ReactNode;
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  isActive,
  onSelect,
  onDelete,
  onAddChild,
  hovered,
  onHover,
  contextMenu,
  onContextMenu,
  indent,
  children,
}) => {
  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-[5px] rounded-md cursor-pointer text-sm transition-colors ${
          indent ? 'ml-4' : ''
        } ${isActive ? 'bg-sidebar-active text-foreground' : 'text-sidebar-fg hover:bg-sidebar-hover'}`}
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <span className="text-base flex-shrink-0">{page.icon}</span>
        <span className="flex-1 truncate">{page.title || 'Untitled'}</span>
        {(hovered || contextMenu) && (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onContextMenu}
              className="p-0.5 rounded hover:bg-accent transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {contextMenu && (
        <div className="ml-6 mb-1 py-1 bg-popover border border-border rounded-md shadow-md animate-fade-in">
          {onAddChild && (
            <button
              onClick={() => { onAddChild(); onContextMenu(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add sub-page
            </button>
          )}
          <button
            onClick={() => { onDelete(); onContextMenu(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-accent transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}

      {children}
    </div>
  );
};
