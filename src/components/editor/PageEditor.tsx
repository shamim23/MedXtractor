import React, { useRef, useState } from 'react';
import { useWorkspace } from '@/store/useWorkspace';
import { BlockEditor } from './BlockEditor';

const EMOJIS = ['📄', '📝', '📋', '📌', '📎', '📊', '📈', '🎯', '🚀', '💡', '🔥', '⭐', '🏠', '🎨', '📚', '🗂️', '💼', '🛠️', '✨', '🌟'];

export const PageEditor: React.FC = () => {
  const { pages, activePageId, updatePageTitle, updatePageIcon } = useWorkspace();
  const page = pages.find((p) => p.id === activePageId);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No page selected</p>
          <p className="text-sm mt-1">Create a page or select one from the sidebar</p>
        </div>
      </div>
    );
  }

  const handleTitleInput = () => {
    if (titleRef.current) {
      updatePageTitle(page.id, titleRef.current.textContent || 'Untitled');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus first block
      const firstBlock = document.querySelector('[data-block-id]') as HTMLElement;
      firstBlock?.focus();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        {/* Icon + Title */}
        <div className="mb-4">
          <div className="relative inline-block">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-5xl hover:bg-accent rounded-md p-1 transition-colors cursor-pointer"
            >
              {page.icon}
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 animate-fade-in">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      updatePageIcon(page.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="notion-page-title text-4xl outline-none mb-1 min-h-[1.2em]"
          data-placeholder="Untitled"
          onInput={handleTitleInput}
          onKeyDown={handleTitleKeyDown}
          dangerouslySetInnerHTML={{ __html: page.title }}
        />

        <BlockEditor pageId={page.id} blocks={page.blocks} />
      </div>
    </div>
  );
};
