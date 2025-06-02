import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND,
  $createTextNode,
  $isRootOrShadowRoot
} from 'lexical';
import { $findMatchingParent } from '@lexical/utils';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INLINE_FORMATS } from './EditorConfig';

const FormatButton = ({ active, onClick, children, title }) => (
  <button
    className={`p-1.5 rounded hover:bg-gray-100 ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
    onClick={onClick}
    title={title}
    type="button"
  >
    {children}
  </button>
);

export const FormatToolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef(null);

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Update text format
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));
        setIsCode(selection.hasFormat('code'));
        
        // Update link
        const node = getSelectedNode(selection);
        const parent = node.getParent();
        setIsLink($isLinkNode(parent) || $isLinkNode(node));
      }
    });
  }, [editor]);

  const getSelectedNode = (selection) => {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
      return anchorNode;
    }
    const isBackward = selection.isBackward();
    return isBackward ? anchorNode : focusNode;
  };

  const insertLink = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  }, [editor, isLink, linkUrl]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const handleClickOutside = useCallback((event) => {
    if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
      setShowLinkInput(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!editor) return null;

  return (
    <div 
      ref={toolbarRef}
      className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-lg absolute z-50 -top-12 left-0"
    >
      <FormatButton
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        title="Bold (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </FormatButton>
      
      <FormatButton
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </FormatButton>
      
      <FormatButton
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </FormatButton>
      
      <FormatButton
        active={isStrikethrough}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        title="Strikethrough"
      >
        <s>S</s>
      </FormatButton>
      
      <FormatButton
        active={isCode}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        title="Code (Ctrl+E)"
      >
        <code>{'</>'}</code>
      </FormatButton>
      
      <div className="h-6 w-px bg-gray-200 mx-1"></div>
      
      <FormatButton
        active={isLink}
        onClick={insertLink}
        title="Insert Link (Ctrl+K)"
      >
        <span className="text-sm">🔗</span>
      </FormatButton>
      
      {showLinkInput && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <input
            type="text"
            className="text-sm border border-gray-300 rounded px-2 py-1 w-64"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste or type a link..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                insertLink();
              } else if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default FormatToolbar;
