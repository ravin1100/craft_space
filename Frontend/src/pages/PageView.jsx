import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";
import { Tag, X } from "lucide-react";
import workspaceService from "../services/workspace.service";
import editorService from "../services/editor.service";
import smartService from "../services/smart.service";
import PageEditor from "../editors/PageEditor";
import TailwindAdvancedEditor from "../components/novel/advanced-editor";
import AutoTagGenerator from "../components/smart/AutoTagGenerator";

export default function PageView() {
  const { workspaceId, pageId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

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
        
        // Set tags if available
        if (pageData?.tags && Array.isArray(pageData.tags)) {
          setTags(pageData.tags);
        }
        
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
      const actualContent = content.getText() || "";
      console.log(JSON.stringify(json), "jjjjjjjj");
      await workspaceService.updatePage(workspaceId, pageId, {
        title: page.title,
        content: JSON.stringify(json),
        textContent: actualContent,
      });
      console.log("Auto-saved content");
    } catch (error) {
      console.error("Failed to auto-save page:", error);
      toast.error("Failed to auto-save page");
    }
  }, 2000);

  // Handle tag updates
  const handleTagsUpdate = useCallback(async (newTags) => {
    try {
      setTags(newTags);
      await smartService.updatePageTags(workspaceId, pageId, newTags);
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  }, [workspaceId, pageId]);
  
  // Remove a tag
  const removeTag = async (tagToRemove) => {
    try {
      const newTags = tags.filter(tag => tag !== tagToRemove);
      setTags(newTags);
      await smartService.updatePageTags(workspaceId, pageId, newTags);
      toast.success('Tag removed');
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

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
      {/* Auto Tag Generator restored below title/tags */}
      <AutoTagGenerator
        content={page?.content}
        pageId={pageId}
        existingTags={tags}
        onTagsUpdate={setTags}
      />
      <TailwindAdvancedEditor
        content={page?.content ?? null}
        onUpdate={handleSave}
        pageId={pageId}
        existingTags={tags}
        onTagsUpdate={handleTagsUpdate}
      />
    </div>
  );
}
