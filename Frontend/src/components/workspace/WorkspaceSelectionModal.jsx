import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { toast } from 'react-hot-toast';
import { X, Plus } from 'lucide-react';

const WorkspaceSelectionModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const {
    workspaces,
    currentWorkspace,
    loading,
    createWorkspace,
    setCurrentWorkspace
  } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  const handleSelectWorkspace = async (workspace) => {
    try {
      await setCurrentWorkspace(workspace);
      onClose();
      navigate(`/workspace/${workspace.id}`);
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
      await createWorkspace({
        name: workspaceName.trim(),
        description: 'My new workspace',
      });
      
      // Don't close the modal here - it will be handled by the workspace context
      // after successful creation and navigation
      setWorkspaceName('');
      setIsCreating(false);
    } catch (error) {
      setIsCreating(false);
      console.error('Failed to create workspace:', error);
      // Error toast will be shown by the createWorkspace function
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select a Workspace</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Your Workspaces</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : workspaces.length === 0 ? (
              <p className="text-sm text-gray-500">No workspaces found</p>
            ) : (
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleSelectWorkspace(workspace)}
                    className={`w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors ${currentWorkspace?.id === workspace.id ? 'bg-blue-50 border border-blue-100' : 'border'}`}
                  >
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-sm text-gray-500">
                      {workspace.pages?.length || 0} pages
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="flex gap-2">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreating}
              />
              <button
                type="submit"
                disabled={isCreating || !workspaceName.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : (
                  <>
                    <Plus size={16} className="mr-1" /> Create
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelectionModal;
