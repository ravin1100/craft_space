import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $createListNode } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { $createQuoteNode } from '@lexical/rich-text';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BLOCK_TYPES } from './EditorConfig';

const BlockTypeDropdown = ({ editor, onClose }) => {
  const [filter, setFilter] = useState('');
  const inputRef = useRef(null);

  const filteredBlocks = BLOCK_TYPES.filter(block => 
    block.label.toLowerCase().includes(filter.toLowerCase())
  );

  const handleBlockSelect = useCallback((blockType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        switch (blockType) {
          case 'h1':
          case 'h2':
          case 'h3':
            $setBlocksType(selection, () => $createHeadingNode(blockType));
            break;
          case 'bullet':
          case 'number':
          case 'check':
            $setBlocksType(selection, () => $createListNode(blockType));
            break;
          case 'quote':
            $setBlocksType(selection, () => $createQuoteNode());
            break;
          case 'code':
            $setBlocksType(selection, () => $createCodeNode());
            break;
          case 'divider':
            const hrNode = $createHorizontalRuleNode();
            selection.insertNodes([hrNode, $createParagraphNode()]);
            break;
          case 'paragraph':
          default:
            $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
    onClose();
  }, [editor, onClose]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="absolute z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search for a block..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filteredBlocks.map((block) => (
          <button
            key={block.type}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleBlockSelect(block.type)}
          >
            <span className="text-gray-500 w-5 flex items-center justify-center">
              {block.icon === 'h1' && 'H1'}
              {block.icon === 'h2' && 'H2'}
              {block.icon === 'h3' && 'H3'}
              {block.icon === 'ul' && '•'}
              {block.icon === 'ol' && '1.'}
              {block.icon === 'checkbox' && '☑'}
              {block.icon === 'toggle' && '▸'}
              {block.icon === 'quote' && '❝'}
              {block.icon === 'code' && '</>'}
              {block.icon === 'divider' && '—'}
              {block.icon === 'image' && '🖼️'}
              {block.icon === 'table' && '⊞'}
              {block.icon === 'text' && 'T'}
            </span>
            <span>{block.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const BlockToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [showToolbar, setShowToolbar] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    // Only show toolbar when '/' is pressed at the start of a new line
    if (event.key === '/' && !showToolbar) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show if at start of a block
        if (range.startOffset === 0 && range.toString().trim() === '') {
          setPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
          });
          setShowToolbar(true);
          event.preventDefault();
        }
      }
    } else if (event.key === 'Escape' && showToolbar) {
      setShowToolbar(false);
    }
  }, [showToolbar]);

  const handleClickOutside = useCallback((event) => {
    if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
      setShowToolbar(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  if (!showToolbar) return null;

  return (
    <div 
      ref={toolbarRef}
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <BlockTypeDropdown 
        editor={editor} 
        onClose={() => setShowToolbar(false)} 
      />
    </div>
  );
};

export default BlockToolbarPlugin;
