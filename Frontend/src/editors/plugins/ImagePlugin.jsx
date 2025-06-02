import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import { useEffect } from "react";

export default function ImagePlugin({ onImageUpload }) {
  const [editor] = useLexicalComposerContext();

  const insertImage = (url, altText) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createParagraphNode();
        const imgElement = document.createElement("img");
        imgElement.src = url;
        imgElement.alt = altText;
        imgElement.className = "max-w-full h-auto";
        imageNode.append(imgElement);
        selection.insertNodes([imageNode]);
      }
    });
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    for (const file of imageFiles) {
      const url = await onImageUpload(file);
      if (url) {
        insertImage(url, file.name);
      }
    }
  };

  const handlePaste = async (event) => {
    const files = Array.from(event.clipboardData.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    event.preventDefault();
    for (const file of imageFiles) {
      const url = await onImageUpload(file);
      if (url) {
        insertImage(url, file.name);
      }
    }
  };

  useEffect(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    editorElement.addEventListener("drop", handleDrop);
    editorElement.addEventListener("paste", handlePaste);

    return () => {
      editorElement.removeEventListener("drop", handleDrop);
      editorElement.removeEventListener("paste", handlePaste);
    };
  }, [editor]);

  return null;
}
