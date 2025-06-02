import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Folder,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function WorkspaceList() {
  const {
    workspaces,
    currentWorkspace,
    pages,
    createWorkspace,
    createPage,
    deleteWorkspace,
    setCurrentWorkspace,
  } = useWorkspace();
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState({});
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { workspaceId, pageId } = useParams();

  const toggleWorkspace = (id) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace({ name: newWorkspaceName });
      setNewWorkspaceName("");
      setIsCreateWorkspaceOpen(false);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleCreatePage = async (workspaceId) => {
    try {
      await createPage(workspaceId, {
        title: "Untitled",
        icon: "📄",
      });
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold">Workspaces</h2>
        <button
          onClick={() => setIsCreateWorkspaceOpen(true)}
          className="p-1 hover:bg-secondary rounded-md"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="space-y-1">
            <div
              className={`flex items-center px-4 py-1.5 hover:bg-secondary cursor-pointer ${
                workspace.id === currentWorkspace?.id ? "bg-secondary" : ""
              }`}
              onClick={() => {
                setCurrentWorkspace(workspace);
                toggleWorkspace(workspace.id);
              }}
            >
              <button className="p-1 hover:bg-secondary/50 rounded-md">
                {expandedWorkspaces[workspace.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Folder className="w-4 h-4 mx-2" />
              <span className="flex-1 truncate">{workspace.name}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreatePage(workspace.id);
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-200 rounded-md hover:text-gray-700"
                  title="Add page"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWorkspaceToDelete(workspace);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-1 text-gray-500 hover:bg-red-50 rounded-md hover:text-red-600"
                  title="Delete workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedWorkspaces[workspace.id] && (
              <div className="ml-9 space-y-1">
                {pages
                  .filter((page) => page.workspaceId === workspace.id)
                  .map((page) => (
                    <Link
                      key={page.id}
                      to={`/workspace/${workspace.id}/page/${page.id}`}
                      className={`flex items-center px-4 py-1.5 hover:bg-secondary rounded-md ${
                        page.id === pageId ? "bg-secondary" : ""
                      }`}
                    >
                      <span className="mr-2">{page.icon || "📄"}</span>
                      <span className="truncate">{page.title}</span>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Create Workspace Dialog */}
      <Dialog
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md"
          >
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 mb-3">
                    <Folder className="h-6 w-6 text-white" />
                  </div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    New Workspace
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">
                    Organize your pages in a shared workspace
                  </p>
                </div>

                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div>
                    <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Workspace Name
                    </label>
                    <input
                      id="workspace-name"
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="e.g., My Project"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateWorkspaceOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWorkspaceName.trim()}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Workspace
                    </button>
                  </div>
                </form>
              </div>
            </Dialog.Panel>
          </motion.div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={isDeleteDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Workspace
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the workspace "{workspaceToDelete?.name}"? This action cannot be undone and will permanently delete all pages and content within this workspace.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={async () => {
                        if (workspaceToDelete) {
                          await deleteWorkspace(workspaceToDelete.id);
                          setIsDeleteDialogOpen(false);
                          setWorkspaceToDelete(null);
                        }
                      }}
                    >
                      Delete Workspace
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
