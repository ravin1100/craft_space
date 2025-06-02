import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $insertNodes } from "lexical";
import { toast } from "react-hot-toast";
import { useWorkspace } from "../contexts/WorkspaceContext";
import editorService from "../services/editor.service";
import PageSettings from "../components/page/PageSettings";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import AutoSavePlugin from "./plugins/AutoSavePlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import ListPlugin from "./plugins/ListPlugin";
import ImagePlugin from "./plugins/ImagePlugin";

const editorConfig = {
  namespace: "NotionEditor",
  onError(error) {
    console.error("Lexical error:", error);
    toast.error("An error occurred in the editor");
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    CodeHighlightNode,
    CodeNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
  theme: {
    root: "p-4 border-none outline-none",
    link: "cursor-pointer text-primary hover:underline",
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
      underlineStrikethrough: "underline line-through",
    },
    image: "max-w-full h-auto",
  },
};

export default function PageEditor({
  workspaceId,
  pageId,
  initialContent,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [metadata, setMetadata] = useState({});
  const { updatePage, deletePage, duplicatePage } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialContent) {
      setTitle(initialContent.title || "");
      setMetadata(initialContent.metadata || {});
    }
  }, [initialContent]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleSave({ title: newTitle });
  };

  const handleSave = async (updates) => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(updates);
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = useCallback(
    async (file) => {
      try {
        const result = await editorService.uploadImage(
          workspaceId,
          pageId,
          file
        );
        return result.url;
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error("Failed to upload image");
        return null;
      }
    },
    [workspaceId, pageId]
  );

  const handlePageUpdate = async (updates) => {
    try {
      await updatePage(workspaceId, pageId, updates);
    } catch (error) {
      toast.error("Failed to update page");
    }
  };

  const handlePageDelete = async () => {
    try {
      await deletePage(workspaceId, pageId);
      navigate(`/workspace/${workspaceId}`);
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  const handlePageDuplicate = async () => {
    try {
      const newPage = await duplicatePage(workspaceId, pageId);
      navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
    } catch (error) {
      toast.error("Failed to duplicate page");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Title and Settings */}
        <div className="mb-8 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="flex-1 text-4xl font-bold bg-transparent border-none outline-none placeholder-muted-foreground"
          />
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-muted-foreground">Saving...</span>
            )}
            <PageSettings
              page={initialContent}
              onUpdate={handlePageUpdate}
              onDelete={handlePageDelete}
              onDuplicate={handlePageDuplicate}
            />
          </div>
        </div>

        {/* Cover Image */}
        {initialContent?.cover && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={initialContent.cover}
              alt="Page cover"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Lexical Editor */}
        <div className="prose prose-sm max-w-none">
          <LexicalComposer initialConfig={editorConfig}>
            <div className="relative min-h-[500px] border border-border rounded-lg">
              <ToolbarPlugin />
              <div className="p-4">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className="outline-none min-h-[480px]" />
                  }
                  placeholder={
                    <div className="absolute top-[72px] left-4 text-muted-foreground">
                      Start writing...
                    </div>
                  }
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <CodeHighlightPlugin />
                <ListPlugin />
                <ImagePlugin onImageUpload={handleImageUpload} />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <AutoSavePlugin
                  workspaceId={workspaceId}
                  pageId={pageId}
                  onSave={handleSave}
                />
              </div>
            </div>
          </LexicalComposer>
        </div>
      </div>
    </div>
  );
}
