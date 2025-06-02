import { useState } from "react";
import { useParams } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { Settings, Image, Copy, Trash, X, Smile } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import editorService from "../../services/editor.service";

const EMOJI_LIST = [
  "📄",
  "📝",
  "📚",
  "📌",
  "📎",
  "📋",
  "📁",
  "📂",
  "🗂️",
  "📊",
  "📈",
  "📉",
  "📇",
  "📑",
  "🗒️",
  "🗓️",
  "📅",
  "📆",
  "📍",
  "📌",
  "✏️",
  "✒️",
  "🖋️",
  "📝",
  "💼",
  "🗄️",
  "📰",
  "🗞️",
  "📓",
  "📔",
];

export default function PageSettings({
  page,
  onUpdate,
  onDelete,
  onDuplicate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { workspaceId, pageId } = useParams();

  const handleIconChange = async (icon) => {
    try {
      await onUpdate({ icon });
      setShowEmojiPicker(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await editorService.updatePageCover(
        workspaceId,
        pageId,
        file
      );
      await onUpdate({ cover: result.url });
    } catch (error) {
      toast.error("Failed to upload cover image");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      setIsOpen(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleDuplicate = async () => {
    try {
      await onDuplicate();
      setIsOpen(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 hover:bg-secondary rounded-md"
      >
        <Settings className="w-4 h-4" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">
                Page Settings
              </Dialog.Title>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon Settings */}
              <div>
                <label className="text-sm font-medium">Page Icon</label>
                <div className="flex items-center mt-2 space-x-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-secondary rounded-md text-2xl"
                  >
                    {page.icon || "📄"}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Click to change icon
                  </span>
                </div>

                {showEmojiPicker && (
                  <div className="mt-2 p-2 border rounded-md grid grid-cols-10 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleIconChange(emoji)}
                        className="p-1 hover:bg-secondary rounded-md text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-sm font-medium">Cover Image</label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md cursor-pointer"
                  >
                    <Image className="w-4 h-4" />
                    <span>Upload cover image</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-secondary rounded-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate page</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-destructive/10 text-destructive rounded-md"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete page</span>
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
