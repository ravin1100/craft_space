import { useCallback, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { debounce } from "lodash";
import { toast } from "react-hot-toast";

export default function AutoSavePlugin({ workspaceId, pageId, onSave }) {
  const [editor] = useLexicalComposerContext();
  const saveInProgress = useRef(false);
  const pendingContent = useRef(null);

  const saveContent = useCallback(
    debounce(async (editorState) => {
      if (!onSave || saveInProgress.current) {
        pendingContent.current = editorState;
        return;
      }

      try {
        saveInProgress.current = true;
        const content = editorState.toJSON();
        await onSave({ content });

        // Check if there's pending content that needs to be saved
        if (pendingContent.current && pendingContent.current !== editorState) {
          saveContent(pendingContent.current);
        }
        pendingContent.current = null;
      } catch (error) {
        console.error("Failed to save content:", error);
        toast.error("Failed to save changes. Please try again.");
      } finally {
        saveInProgress.current = false;
      }
    }, 1000),
    [onSave]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      saveContent(editorState);
    });
  }, [editor, saveContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      saveContent.cancel();
    };
  }, [saveContent]);

  return null;
}
