import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";
import workspaceService from "../services/workspace.service";
import editorService from "../services/editor.service";
import PageEditor from "../editors/PageEditor";
import TailwindAdvancedEditor from "../components/novel/advanced-editor";

export default function PageView() {
  const { workspaceId, pageId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(page, "page");

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const [pageData] = await Promise.all([
          workspaceService.getPageById(workspaceId, pageId),
          // editorService.getPageContent(workspaceId, pageId),
        ]);

        console.log(pageData, "pageData");

        setPage({
          ...pageData,
          content: JSON.parse(pageData?.content ?? null),
        });
        setError(null);
      } catch (err) {
        setError("Failed to load page");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [workspaceId, pageId]);

  const handleTitleChange = (e) => {
    setPage((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleTitleBlur = async () => {
    try {
      const json = page.content?.getJSON?.() ?? null;
  
      await workspaceService.updatePage(workspaceId, pageId, {
        title: page.title,
        content: JSON.stringify(json),
      });
      toast.success("Page title updated");
    } catch (error) {
      console.error("Failed to update page title:", error);
      toast.error("Failed to update page title");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const debouncedSave = useDebouncedCallback(async (content) => {
    try {
      const json = content.getJSON();
      console.log(JSON.stringify(json), "jjjjjjjj");
      await workspaceService.updatePage(workspaceId, pageId, {
        title: page.title,
        content: JSON.stringify(json),
      });
      console.log("Auto-saved content");
    } catch (error) {
      console.error("Failed to auto-save page:", error);
      toast.error("Failed to auto-save page");
    }
  }, 5000);

  const handleSave = useCallback(
    (content) => {
      setPage((prev) => ({
        ...prev,
        content,
      }));

      debouncedSave(content);
    },
    [debouncedSave]
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <input
          type="text"
          value={page?.title || ""}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-4xl font-bold bg-transparent outline-none border-none focus:ring-0 p-0 mb-2 text-foreground"
          placeholder="Untitled"
        />
        <div className="h-px bg-border w-full"></div>
      </div>
      <TailwindAdvancedEditor
        content={page?.content ?? null}
        onUpdate={handleSave}
      />
    </div>
  );
}
