import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { editorConfig } from './EditorConfig';
import BlockToolbarPlugin from './BlockToolbar';
import FormatToolbar from './FormatToolbar';

// Custom plugin to handle keyboard shortcuts
function KeyboardShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      'keydown',
      (event) => {
        // Handle keyboard shortcuts here
        const { key, ctrlKey, metaKey, shiftKey } = event;
        const isMod = ctrlKey || metaKey;

        // Bold: Cmd/Ctrl + B
        if (isMod && key === 'b') {
          event.preventDefault();
          editor.dispatchCommand('format_text', 'bold');
          return true;
        }

        // Italic: Cmd/Ctrl + I
        if (isMod && key === 'i') {
          event.preventDefault();
          editor.dispatchCommand('format_text', 'italic');
          return true;
        }

        // Underline: Cmd/Ctrl + U
        if (isMod && key === 'u') {
          event.preventDefault();
          editor.dispatchCommand('format_text', 'underline');
          return true;
        }

        // Code: Cmd/Ctrl + E
        if (isMod && key === 'e') {
          event.preventDefault();
          editor.dispatchCommand('format_text', 'code');
          return true;
        }

        // Insert link: Cmd/Ctrl + K
        if (isMod && key === 'k') {
          event.preventDefault();
          // This would be handled by the FormatToolbar
          return true;
        }

        return false;
      },
      1
    );
  }, [editor]);

  return null;
}

// Custom plugin to show format toolbar on selection
function FloatingFormatToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showToolbar, setShowToolbar] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);
  const isComposing = useRef(false);

  const updateToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || isComposing.current) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Don't show toolbar if no text is selected or selection is collapsed
    if (selection.isCollapsed || selection.toString().trim() === '') {
      setShowToolbar(false);
      return;
    }

    setPosition({
      top: rect.top + window.scrollY - 50,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setShowToolbar(true);
  }, []);

  useEffect(() => {
    const handleCompositionStart = () => {
      isComposing.current = true;
      setShowToolbar(false);
    };

    const handleCompositionEnd = () => {
      isComposing.current = false;
      updateToolbar();
    };

    document.addEventListener('selectionchange', updateToolbar);
    document.addEventListener('compositionstart', handleCompositionStart);
    document.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      document.removeEventListener('selectionchange', updateToolbar);
      document.removeEventListener('compositionstart', handleCompositionStart);
      document.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [updateToolbar]);

  if (!showToolbar) return null;

  return (
    <div 
      ref={toolbarRef}
      className="fixed z-50 transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="animate-fade-in">
        <FormatToolbar />
      </div>
    </div>
  );
}

// Function to create a valid empty editor state
const createEmptyEditorState = () => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

// Main Editor Component
const NotionEditor = ({ initialValue, onChange }) => {
  // Create a default empty state
  const defaultState = useMemo(() => JSON.stringify(createEmptyEditorState()), []);

  // Ensure we have a valid editor state
  const getSafeInitialState = useCallback(() => {
    try {
      // If no initialValue, return default state
      if (!initialValue) return defaultState;
      
      // If it's already a string, validate it's valid JSON
      if (typeof initialValue === 'string') {
        try {
          const parsed = JSON.parse(initialValue);
          if (parsed && typeof parsed === 'object') {
            return initialValue;
          }
        } catch (e) {
          console.warn('Invalid JSON string, using default state');
        }
        return defaultState;
      }
      
      // If it's an object, validate structure
      if (initialValue && typeof initialValue === 'object') {
        if (initialValue.root && initialValue.root.children) {
          return JSON.stringify(initialValue);
        }
      }
      
      return defaultState;
    } catch (error) {
      console.error('Error parsing editor state, using default state', error);
      return defaultState;
    }
  }, [initialValue, defaultState]);

  const config = useMemo(() => ({
    ...editorConfig,
    editorState: getSafeInitialState(),
    theme: {
      ...editorConfig.theme,
      // Add any theme overrides here
    },
    onError: (error) => {
      console.error('Lexical editor error:', error);
      return true; // Prevent error from bubbling
    },
  }), [getSafeInitialState]);

  return (
    <div className="relative h-full">
      <LexicalComposer initialConfig={config}>
        <div className="relative">
          <FloatingFormatToolbarPlugin />
          <BlockToolbarPlugin />
          
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="focus:outline-none min-h-[300px] p-4" 
                spellCheck={false}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Type / for commands, or start writing...
              </div>
            }
          />
          
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <TablePlugin />
          <MarkdownShortcutPlugin transformers={[]} />
          <KeyboardShortcutsPlugin />
          
          <OnChangePlugin
            onChange={(editorState) => {
              if (onChange) {
                onChange(editorState);
              }
            }}
          />
        </div>
      </LexicalComposer>
    </div>
  );
};

export default NotionEditor;
