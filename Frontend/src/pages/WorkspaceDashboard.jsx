import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { LogOut, FileText, Plus, Menu, Search, Star, Clock, Calendar, LayoutGrid, Settings, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';
import TailwindAdvancedEditor from '../components/novel/advanced-editor';
import workspaceService from '../services/workspace.service';
// Simple ID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, setCurrentWorkspace, getWorkspace, createPage, pages, loadPages } = useWorkspace();
  const { logout, user } = useAuth();
  const [activePage, setActivePage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPages, setRecentPages] = useState([]);
  const [favoritePages, setFavoritePages] = useState([]);

  // Effect to fetch workspace data - runs only when workspaceId changes
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (workspaceId) {
          const workspace = await getWorkspace(workspaceId);
          setCurrentWorkspace(workspace);
          
          // Load pages from the workspace context
          await loadPages(workspaceId);
        } else {
          setCurrentWorkspace(null);
        }
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setError("Failed to load workspace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
    // Only depend on workspaceId and the functions, not on pages which changes after loadPages
  }, [workspaceId]);

  // Effect to update recent and favorite pages when pages change
  useEffect(() => {
    if (pages && pages.length > 0) {
      // Sort pages by updated date for recent pages
      const sortedPages = [...pages].sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      
      setRecentPages(sortedPages.slice(0, 5));
      
      // Simulate some favorite pages (in a real app, this would be user-specific)
      setFavoritePages(pages.filter((_, index) => index % 3 === 0).slice(0, 3));
    } else {
      setRecentPages([]);
      setFavoritePages([]);
    }
  }, [pages]);

  const getEmptyEditorState = () => JSON.stringify({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Start writing here...',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });

  const handleCreatePage = useCallback(async () => {
    try {
      const newPage = {
        id: generateId(),
        title: 'Untitled',
        content: getEmptyEditorState(),
        updatedAt: new Date(),
      };

      // Don't directly modify the pages state from context
      // Instead, use the createPage function from context which will update the pages state
      if (createPage) {
        try {
          // Create the page through the context which will handle updating the pages array
          // Pass workspaceId and data as separate parameters
          const createdPage = await createPage(workspaceId, {
            title: 'Untitled',
            content: newPage.content,
          });
          
          // If successful, set the active page to the newly created page
          if (createdPage) {
            setActivePage(createdPage);
          } else {
            // Fallback if createPage doesn't return the created page
            setActivePage(newPage);
          }
          
          // Note: The toast is already handled in the context's createPage function
        } catch (err) {
          console.error('Failed to save page to backend:', err);
          // Note: Error toast is already handled in the context's createPage function
        }
      }
    } catch (err) {
      console.error('Error creating page:', err);
      toast.error('Error creating page');
    }
  }, [createPage, workspaceId, getEmptyEditorState]);

  const handlePageSelect = (pageId) => {
    if (!pages || !pageId) return;
    
    // Always navigate to the page view when clicking on a page from the dashboard
    navigate(`/workspace/${workspaceId}/page/${pageId}`);
  };

  const debouncedSave = useDebouncedCallback(async (content) => {
    if (!activePage) return;
    
    try {
      const json = content.getJSON();
      await workspaceService.updatePage(workspaceId, activePage.id, {
        title: activePage.title,
        content: JSON.stringify(json),
      });
      console.log('Auto-saved content');
    } catch (error) {
      console.error('Failed to auto-save page:', error);
      toast.error('Failed to auto-save page');
    }
  }, 5000);

  const handleEditorChange = useCallback((content) => {
    if (activePage) {
      setActivePage(prev => ({
        ...prev,
        content,
        updatedAt: new Date(),
      }));
      debouncedSave(content);
    }
  }, [activePage, debouncedSave]);

  const handleTitleChange = (e) => {
    if (!activePage) return;
    setActivePage(prev => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleTitleBlur = async () => {
    if (!activePage) return;
    
    try {
      const json = activePage.content?.getJSON?.() ?? null;
      await workspaceService.updatePage(workspaceId, activePage.id, {
        title: activePage.title,
        content: JSON.stringify(json),
      });
      toast.success('Page updated');
    } catch (error) {
      console.error('Failed to update page:', error);
      toast.error('Failed to update page');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const handleLogout = () => {
    logout();
  };

  const filteredPages = pages ? pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">Select a workspace</h2>
          <p className="text-muted-foreground">
            Choose a workspace from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {currentWorkspace?.name || 'Your Workspace'}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {user?.name || 'User'}'s workspace
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            <div className="p-2 bg-white/20 rounded-md">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">New Page</h3>
              <p className="text-sm text-white/80">Create a new document</p>
            </div>
          </button>

          <button 
            onClick={() => navigate(`/workspace/${workspaceId}/templates`)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            <div className="p-2 bg-white/20 rounded-md">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Templates</h3>
              <p className="text-sm text-white/80">Browse document templates</p>
            </div>
          </button>

          <button 
            onClick={() => navigate(`/workspace/${workspaceId}/invite`)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            <div className="p-2 bg-white/20 rounded-md">
              <UserPlus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Invite</h3>
              <p className="text-sm text-white/80">Invite team members</p>
            </div>
          </button>
        </div>

        {/* Recent Pages */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              Recent Pages
            </h2>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : recentPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => handlePageSelect(page.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <h3 className="font-medium text-gray-800 truncate">{page.title || 'Untitled'}</h3>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {page.excerpt || 'No content'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">No recent pages</p>
              <button
                onClick={handleCreatePage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                <span>Create your first page</span>
              </button>
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Star size={18} className="text-gray-500" />
              Favorites
            </h2>
          </div>

          {favoritePages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoritePages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => handlePageSelect(page.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-start gap-3"
                >
                  <div className="p-2 bg-orange-50 rounded-md">
                    <FileText size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">{page.title || 'Untitled'}</h3>
                    <p className="text-xs text-gray-500">
                      Updated {new Date(page.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">No favorite pages yet</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
            
            <button 
              onClick={() => navigate(`/workspace/${workspaceId}/trash`)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Trash</span>
            </button>
            
            <button 
              onClick={() => navigate(`/workspace/${workspaceId}/templates`)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LayoutGrid size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Templates</span>
            </button>
            
            <button 
              onClick={() => navigate(`/workspace/${workspaceId}/invite`)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Invite</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDashboard;
