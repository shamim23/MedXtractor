import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Page, Block, createPage, createBlock, BlockType } from '@/types/blocks';

interface WorkspaceState {
  pages: Page[];
  activePageId: string | null;
  sidebarOpen: boolean;

  // Actions
  setActivePageId: (id: string) => void;
  toggleSidebar: () => void;
  addPage: (parentId?: string | null) => string;
  deletePage: (id: string) => void;
  updatePageTitle: (id: string, title: string) => void;
  updatePageIcon: (id: string, icon: string) => void;
  updateBlocks: (pageId: string, blocks: Block[]) => void;
  addBlock: (pageId: string, afterBlockId: string, type?: BlockType) => string;
  deleteBlock: (pageId: string, blockId: string) => void;
  updateBlock: (pageId: string, blockId: string, updates: Partial<Block>) => void;
  moveBlock: (pageId: string, blockId: string, targetIndex: number) => void;
  getActivePage: () => Page | undefined;
}

const DEFAULT_PAGES: Page[] = [
  {
    ...createPage('Getting Started'),
    icon: '🚀',
    blocks: [
      createBlock('heading1', 'Welcome to your workspace'),
      createBlock('text', 'This is your personal workspace. Start writing, planning, and organizing your thoughts.'),
      createBlock('heading2', 'Quick tips'),
      createBlock('bulleted-list', 'Type / to see available block types'),
      createBlock('bulleted-list', 'Press Enter to create a new block'),
      createBlock('bulleted-list', 'Use the sidebar to navigate between pages'),
      createBlock('todo', 'Try creating a new page'),
      createBlock('todo', 'Experiment with different block types'),
      createBlock('divider', ''),
      createBlock('callout', '💡 Tip: You can drag blocks to reorder them!'),
    ],
  },
];

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      pages: DEFAULT_PAGES,
      activePageId: DEFAULT_PAGES[0].id,
      sidebarOpen: true,

      setActivePageId: (id) => set({ activePageId: id }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      addPage: (parentId = null) => {
        const page = createPage('Untitled', parentId);
        set((s) => ({ pages: [...s.pages, page], activePageId: page.id }));
        return page.id;
      },

      deletePage: (id) => {
        set((s) => {
          const remaining = s.pages.filter((p) => p.id !== id && p.parentId !== id);
          const newActive = remaining.length > 0 
            ? (s.activePageId === id ? remaining[0].id : s.activePageId) 
            : null;
          return { pages: remaining, activePageId: newActive };
        });
      },

      updatePageTitle: (id, title) => {
        set((s) => ({
          pages: s.pages.map((p) => p.id === id ? { ...p, title, updatedAt: Date.now() } : p),
        }));
      },

      updatePageIcon: (id, icon) => {
        set((s) => ({
          pages: s.pages.map((p) => p.id === id ? { ...p, icon, updatedAt: Date.now() } : p),
        }));
      },

      updateBlocks: (pageId, blocks) => {
        set((s) => ({
          pages: s.pages.map((p) => p.id === pageId ? { ...p, blocks, updatedAt: Date.now() } : p),
        }));
      },

      addBlock: (pageId, afterBlockId, type: BlockType = 'text') => {
        const newBlock = createBlock(type);
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            const idx = p.blocks.findIndex((b) => b.id === afterBlockId);
            const newBlocks = [...p.blocks];
            newBlocks.splice(idx + 1, 0, newBlock);
            return { ...p, blocks: newBlocks, updatedAt: Date.now() };
          }),
        }));
        return newBlock.id;
      },

      deleteBlock: (pageId, blockId) => {
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            if (p.blocks.length <= 1) return p;
            return { ...p, blocks: p.blocks.filter((b) => b.id !== blockId), updatedAt: Date.now() };
          }),
        }));
      },

      updateBlock: (pageId, blockId, updates) => {
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              blocks: p.blocks.map((b) => b.id === blockId ? { ...b, ...updates } : b),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      moveBlock: (pageId, blockId, targetIndex) => {
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.id !== pageId) return p;
            const blocks = [...p.blocks];
            const fromIndex = blocks.findIndex((b) => b.id === blockId);
            if (fromIndex === -1) return p;
            const [moved] = blocks.splice(fromIndex, 1);
            blocks.splice(targetIndex, 0, moved);
            return { ...p, blocks, updatedAt: Date.now() };
          }),
        }));
      },

      getActivePage: () => {
        const { pages, activePageId } = get();
        return pages.find((p) => p.id === activePageId);
      },
    }),
    { name: 'notion-workspace' }
  )
);
