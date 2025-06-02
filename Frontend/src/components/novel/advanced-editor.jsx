import React, { useEffect, useState } from "react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  ImageResizer,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import hljs from "highlight.js";
import { defaultEditorContent } from "../../lib/content";

const extensions = [...defaultExtensions, slashCommand];

export default function TailwindAdvancedEditor({ content, onUpdate }) {
  // Initialize state with either the provided content or default content
  const [initialContent, setInitialContent] = useState(
    content ?? defaultEditorContent
  );

  // Update initialContent when content prop changes
  useEffect(() => {
    if (content) {
      setInitialContent(content);
    }
  }, [content]);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState(0);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Apply syntax highlighting to any <pre><code> blocks in the HTML string
  const highlightCodeblocks = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    doc.querySelectorAll("pre code").forEach((codeEl) => {
      hljs.highlightElement(codeEl);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  // Debounce updates so we only save every 500ms
  const debouncedInternalUpdate = useDebouncedCallback((editor) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());

    const html = editor.getHTML();
    window.localStorage.setItem("html-content", highlightCodeblocks(html));
    window.localStorage.setItem("novel-content", JSON.stringify(json));

    if (
      editor.storage.markdown &&
      typeof editor.storage.markdown.getMarkdown === "function"
    ) {
      window.localStorage.setItem(
        "markdown",
        editor.storage.markdown.getMarkdown()
      );
    }

    setSaveStatus("Saved");
  }, 500);

  // If `content` prop changes (including from null to something), update the editor
  useEffect(() => {
    setInitialContent(content ?? defaultEditorContent);
  }, [content]);

  return (
    <EditorRoot>
      <EditorContent
        initialContent={initialContent}
        extensions={extensions}
        className="relative min-h-[500px] w-full max-w-screen-lg sm:mb-[calc(20vh)]"
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) =>
            handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class:
              "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          },
        }}
        onUpdate={({ editor }) => {
          // Internal saving logic
          debouncedInternalUpdate(editor);
          setSaveStatus("Unsaved");

          // User-provided callback
          if (typeof onUpdate === "function") {
            onUpdate(editor);
          }
        }}
        slotAfter={<ImageResizer />}
      >
        {/* Slash-command dropdown */}
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={(val) => item.command(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        {/* Bottom toolbar with selectors */}
        <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
          <Separator orientation="vertical" />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" />
          <MathSelector />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </GenerativeMenuSwitch>
      </EditorContent>
    </EditorRoot>
  );
}
