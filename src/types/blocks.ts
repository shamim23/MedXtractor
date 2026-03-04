export type BlockType = 
  | 'text' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'bulleted-list' 
  | 'numbered-list' 
  | 'todo' 
  | 'toggle' 
  | 'quote' 
  | 'divider' 
  | 'callout'
  | 'code';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  children?: Block[];
  collapsed?: boolean;
  color?: string;
  bgColor?: string;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  parentId?: string | null;
}

export const BLOCK_TYPE_CONFIG: Record<BlockType, { label: string; icon: string; description: string }> = {
  'text': { label: 'Text', icon: 'Type', description: 'Plain text block' },
  'heading1': { label: 'Heading 1', icon: 'Heading1', description: 'Large section heading' },
  'heading2': { label: 'Heading 2', icon: 'Heading2', description: 'Medium section heading' },
  'heading3': { label: 'Heading 3', icon: 'Heading3', description: 'Small section heading' },
  'bulleted-list': { label: 'Bulleted List', icon: 'List', description: 'Simple bulleted list' },
  'numbered-list': { label: 'Numbered List', icon: 'ListOrdered', description: 'Numbered list' },
  'todo': { label: 'To-do', icon: 'CheckSquare', description: 'Track tasks with a to-do list' },
  'toggle': { label: 'Toggle', icon: 'ChevronRight', description: 'Toggleable content' },
  'quote': { label: 'Quote', icon: 'Quote', description: 'Capture a quote' },
  'divider': { label: 'Divider', icon: 'Minus', description: 'Visually divide blocks' },
  'callout': { label: 'Callout', icon: 'AlertCircle', description: 'Make writing stand out' },
  'code': { label: 'Code', icon: 'Code', description: 'Capture a code snippet' },
};

export function createBlock(type: BlockType = 'text', content = ''): Block {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    checked: type === 'todo' ? false : undefined,
    collapsed: type === 'toggle' ? false : undefined,
  };
}

export function createPage(title = 'Untitled', parentId: string | null = null): Page {
  return {
    id: crypto.randomUUID(),
    title,
    icon: '📄',
    blocks: [createBlock('text', '')],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    parentId,
  };
}
