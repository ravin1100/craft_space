import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { LogOut, FileText, Plus, Menu, Search } from 'lucide-react';
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
  const { currentWorkspace, setCurrentWorkspace, getWorkspace, createPage } = useWorkspace();
  const { logout } = useAuth();
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (workspaceId) {
          const workspace = await getWorkspace(workspaceId);
          setCurrentWorkspace(workspace);

          const mockPages = [
            { id: '1', title: 'Getting Started', updatedAt: new Date() },
            { id: '2', title: 'Project Plan', updatedAt: new Date() },
            { id: '3', title: 'Meeting Notes', updatedAt: new Date() },
          ];
          setPages(mockPages);

          if (mockPages.length > 0 && !activePage) {
            setActivePage(mockPages[0]);
          }
        } else {
          setCurrentWorkspace(null);
          setPages([]);
          setActivePage(null);
        }
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setError("Failed to load workspace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

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

      setPages(prev => [newPage, ...prev]);
      setActivePage(newPage);
      
      // Optional: Save the page to the backend if needed
      if (createPage) {
        try {
          await createPage({
            workspaceId,
            title: 'Untitled',
            content: newPage.content,
          });
        } catch (err) {
          console.error('Failed to save page to backend:', err);
        }
      }
    } catch (err) {
      console.error('Error creating page:', err);
    }
  }, [createPage, workspaceId]);

  const handlePageSelect = (page) => {
    setActivePage(page);
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

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Navigation */}
      <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                {currentWorkspace?.name || 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} className="text-gray-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
          <div className="h-full flex flex-col">
            <div className="p-4">
              <button
                onClick={handleCreatePage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Plus size={16} />
                <span>New Page</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pages
              </h3>
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageSelect(page.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                      activePage?.id === page.id
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText 
                      size={16} 
                      className={`flex-shrink-0 ${activePage?.id === page.id ? 'text-orange-500' : 'text-gray-400'}`} 
                    />
                    <span className="truncate">{page.title || 'Untitled'}</span>
                  </button>
                ))}
                
                {pages.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No pages yet. Create one!
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Workspace</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{currentWorkspace?.name || 'My Workspace'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          {activePage ? (
            <div className="max-w-4xl mx-auto p-8">
              <div className="w-full h-full">
            
                <div className="mb-8">
                <input
                  type="text"
                  value={activePage.title || ''}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full text-4xl font-bold bg-transparent outline-none border-none focus:ring-0 p-0 mb-2 text-foreground"
                  placeholder="Untitled"
                />
                <div className="h-px bg-border w-full"></div>
              </div>
              <TailwindAdvancedEditor
                content={activePage.content}
                onUpdate={handleEditorChange}
              />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {pages.length === 0 ? 'Create your first page' : 'Select a page'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {pages.length === 0
                    ? 'Get started by creating a new page.'
                    : 'Select a page from the sidebar or create a new one.'}
                </p>
                <button
                  onClick={handleCreatePage}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
                >
                  <Plus size={18} />
                  <span>New Page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDashboard;
