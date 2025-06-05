import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import workspaceService from '../../services/workspace.service';
import { toast } from 'react-hot-toast';
import { X, Plus, Check, FolderPlus, Folder, Search, Trash2, AlertCircle } from 'lucide-react';

const WorkspaceSelectionModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('select'); // 'select' or 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspacesWithPageCounts, setWorkspacesWithPageCounts] = useState([]);
  const {
    workspaces,
    currentWorkspace,
    loading,
    createWorkspace,
    setCurrentWorkspace,
    deleteWorkspace,
    pages
  } = useWorkspace();
  const navigate = useNavigate();

  console.log('Selected workspace:', workspaces);
  
  // Get page counts for each workspace
  useEffect(() => {
    const fetchPageCounts = async () => {
      const updatedWorkspaces = await Promise.all(workspaces.map(async (workspace) => {
        try {
          // Try to get the page count from the workspace object directly
          if (workspace.pageCount !== undefined) {
            return { ...workspace };
          }
          
          // If the current workspace's pages are already loaded, use that count
          if (currentWorkspace?.id === workspace.id && pages.length > 0) {
            return { ...workspace, pageCount: pages.length };
          }
          
          // Otherwise fetch the pages for this workspace
          const workspacePages = await workspaceService.getWorkspacePages(workspace.id);
          return { ...workspace, pageCount: workspacePages.length };
        } catch (error) {
          console.error(`Failed to get pages for workspace ${workspace.id}:`, error);
          return { ...workspace, pageCount: 0 };
        }
      }));
      
      setWorkspacesWithPageCounts(updatedWorkspaces);
    };
    
    if (workspaces.length > 0) {
      fetchPageCounts();
    }
  }, [workspaces, currentWorkspace, pages]);
  
  // Filter workspaces based on search query and ensure each workspace appears only once
  const uniqueWorkspaces = useMemo(() => {
    // Create a map to track seen workspace IDs
    const seen = new Map();
    const unique = [];
    
    // Filter by search query if needed
    const filtered = !searchQuery.trim() 
      ? workspacesWithPageCounts 
      : workspacesWithPageCounts.filter(workspace => 
          workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    
    // Ensure uniqueness
    filtered.forEach(workspace => {
      if (!seen.has(workspace.id)) {
        seen.set(workspace.id, true);
        unique.push(workspace);
      }
    });
    
    return unique;
  }, [workspacesWithPageCounts, searchQuery]);

  // useEffect(() => {
  //   if (workspaces.length > 0 && !currentWorkspace) {
  //     setCurrentWorkspace(workspaces[0]);
  //   }
  // }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  const handleSelectWorkspace = async (workspace) => {
    try {
      await setCurrentWorkspace(workspace);
      // localStorage.setItem('currentWorkspaceId', workspace.id); // Redundant: setCurrentWorkspace handles this
      onClose();
      navigate(`/workspace/${workspace.id}/dashboard`);
    } catch (error) {
      console.error('Failed to select workspace:', error);
      toast.error('Failed to select workspace');
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    
    try {
      setIsCreating(true);
      const newWorkspace = await createWorkspace({
        name: workspaceName.trim(),
        description: 'My new workspace',
      });
      
      // Close the modal after successful creation
      setWorkspaceName('');
      setIsCreating(false);
      onClose();
      
      // Navigate to the new workspace
      if (newWorkspace && newWorkspace.id) {
        navigate(`/workspace/${newWorkspace.id}`);
      }
    } catch (error) {
      setIsCreating(false);
      console.error('Failed to create workspace:', error);
      // Error toast will be shown by the createWorkspace function
    }
  };

  const handleDeleteClick = (workspace, e) => {
    e.stopPropagation(); // Prevent triggering the workspace selection
    setWorkspaceToDelete(workspace);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workspaceToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteWorkspace(workspaceToDelete.id);
      setShowDeleteConfirm(false);
      setWorkspaceToDelete(null);
      // The workspace context will handle navigation and state updates
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      // Error toast will be shown by the deleteWorkspace function
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setWorkspaceToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && workspaceToDelete && (
        <div className="absolute inset-0 flex items-center justify-center z-[101]" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-xl p-6 max-w-md shadow-2xl border border-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Delete Workspace</h3>
            </div>
            
            <p className="text-gray-600 mb-2">Are you sure you want to delete <span className="font-medium">'{workspaceToDelete.name}'</span>?</p>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone and all pages within this workspace will be permanently deleted.</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-purple-600">
          <h2 className="text-xl font-bold text-white">Workspace</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-white">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all ${activeTab === 'select' 
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' 
              : 'text-gray-500 hover:text-orange-500 border-b-2 border-transparent'}`}
          >
            <Folder size={18} />
            Select Existing
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all ${activeTab === 'create' 
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' 
              : 'text-gray-500 hover:text-purple-500 border-b-2 border-transparent'}`}
          >
            <FolderPlus size={18} />
            Create New
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'select' ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Workspaces</h3>
              
              {/* Search input */}
              {workspaces.length > 0 && (
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-orange-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-orange-50/30 border border-orange-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-200 transition-all"
                  />
                  {searchQuery && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} className="text-orange-400 hover:text-orange-600" />
                    </button>
                  )}
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-orange-500"></div>
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-3 flex justify-center">
                    <Folder className="h-16 w-16 text-orange-200" />
                  </div>
                  <p className="text-gray-600 font-medium">No workspaces found</p>
                  <p className="text-gray-500 text-sm mt-1">Get started by creating your first workspace</p>
                  <button 
                    onClick={() => setActiveTab('create')} 
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                  >
                    Create workspace
                  </button>
                </div>
              ) : uniqueWorkspaces.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-2 flex justify-center">
                    <Search className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-medium">No workspaces match your search</p>
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {uniqueWorkspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleSelectWorkspace(workspace)}
                      className={`w-full flex items-center p-4 rounded-xl transition-all ${currentWorkspace?.id === workspace.id 
                        ? 'bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 shadow-sm' 
                        : 'bg-white border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 shadow-sm'}`}
                    >
                      <div className={`flex items-center justify-center h-10 w-10 rounded-lg mr-3 ${currentWorkspace?.id === workspace.id 
                        ? 'bg-gradient-to-r from-orange-500 to-purple-500' 
                        : 'bg-gradient-to-br from-orange-100 to-purple-100'}`}>
                        <Folder className={`h-5 w-5 ${currentWorkspace?.id === workspace.id ? 'text-white' : 'text-orange-500'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${currentWorkspace?.id === workspace.id ? 'text-orange-700' : 'text-gray-800'}`}>{workspace.name}</div>
                        <div className="text-sm text-gray-500">
                          {workspace.pageCount || 0} pages
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Delete button */}
                        <button 
                          onClick={(e) => handleDeleteClick(workspace, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Delete workspace"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        {/* Selected indicator */}
                        {currentWorkspace?.id === workspace.id && (
                          <div className="flex-shrink-0 bg-orange-500 text-white p-1 rounded-full">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Workspace</h3>
              <form onSubmit={handleCreateWorkspace} className="space-y-5">
                <div>
                  <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Enter workspace name"
                    className="w-full border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-200 bg-purple-50/30"
                    disabled={isCreating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !workspaceName.trim()}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isCreating ? 'Creating...' : (
                    <>
                      <Plus size={16} className="mr-2" /> Create Workspace
                    </>
                  )}
                </button>
                {workspaces.length > 0 && (
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('select')} 
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center mx-auto gap-1"
                    >
                      <Folder size={14} />
                      Select an existing workspace
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelectionModal;
