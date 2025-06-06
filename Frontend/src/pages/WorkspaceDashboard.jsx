import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { LogOut, FileText, Plus, Menu, Search, Star, Clock, Calendar, LayoutGrid, Settings, Trash2, UserPlus, Bot, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';
import TailwindAdvancedEditor from '../components/novel/advanced-editor';
import workspaceService from '../services/workspace.service';
import aiService from '../services/ai.service';
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
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphData, setGraphData] = useState(null); // { nodes: [], edges: [] }
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  const handleAiAssistantToggle = async () => {
    // If opening the assistant, automatically call uploadFiles with empty body
    if (!isAiAssistantOpen) {
      try {
        setIsAiLoading(true);
        // Call uploadFiles with empty FormData
        const formData = new FormData();
        await aiService.uploadFiles(formData);
        // Set hasUploadedFiles to true to skip the upload screen
        setHasUploadedFiles(true);
        setUserQuestion('');
        
        // Add welcome message
        setChatMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. How can I help you today?',
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error initializing AI assistant:', error);
        toast.error('Failed to initialize AI assistant');
      } finally {
        setIsAiLoading(false);
      }
    }
    
    setIsAiAssistantOpen(!isAiAssistantOpen);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsAiLoading(true);
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      await aiService.uploadFiles(formData);
      setHasUploadedFiles(true);
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiQuery = async (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: userQuestion,
      timestamp: new Date()
    };
    
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    setUserQuestion('');
    
    try {
      setIsAiLoading(true);
      
      // Add a temporary thinking message
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: '...',
          isThinking: true,
          timestamp: new Date()
        }
      ]);
      
      const response = await aiService.query(userQuestion);
      
      // Replace thinking message with actual response
      setChatMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const thinkingIndex = newMessages.findIndex(msg => msg.isThinking);
        
        if (thinkingIndex !== -1) {
          newMessages[thinkingIndex] = {
            role: 'assistant',
            content: response || 'Sorry, I couldn\'t process your question.',
            timestamp: new Date()
          };
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error('Error querying AI:', error);
      
      // Replace thinking message with error message
      setChatMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const thinkingIndex = newMessages.findIndex(msg => msg.isThinking);
        
        if (thinkingIndex !== -1) {
          newMessages[thinkingIndex] = {
            role: 'assistant',
            content: 'Sorry, an error occurred while processing your question.',
            timestamp: new Date(),
            isError: true
          };
        }
        
        return newMessages;
      });
      
      toast.error('Failed to get AI response');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function
      if (debouncedSave) {
        debouncedSave.flush();
      }
    };
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Select a workspace</h2>
          <p className="text-muted-foreground">
            Choose a workspace from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  const filteredPages = pages ? pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

          {/* <button
            onClick={async () => {
              setGraphLoading(true);
              setGraphData(null);
              try {
                // 1. POST to upload
                const uploadRes = await fetch('http://localhost:8080/api/ai/upload', {
                  method: 'POST',
                });
                if (!uploadRes.ok) throw new Error('Upload failed');
                toast.success('Data uploaded successfully');
                // 2. GET the graph
                const graphRes = await fetch(`http://localhost:8080/api/ai/graph?workspaceId=${workspaceId}`);
                if (!graphRes.ok) throw new Error('Failed to fetch knowledge graph');
                const graphJson = await graphRes.json();
                setGraphData(graphJson);
                toast.success('Knowledge graph generated!');
              } catch (err) {
                toast.error('Knowledge graph generation failed');
              } finally {
                setGraphLoading(false);
              }
            }}
            className={`flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg border-4 border-dashed border-red-500 hover:opacity-90 transition-all shadow-md ${graphLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={graphLoading}
          >
            <div className="p-2 bg-white/20 rounded-md">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium">Generate Knowledge Graph</h3>
              <p className="text-sm text-white/80">AI-powered knowledge extraction</p>
              {graphLoading && <span className="text-xs text-white/70">Generating...</span>}
            </div>
          </button> */}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button 
              onClick={handleAiAssistantToggle}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bot size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
            </button>
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

        {/* AI Assistant Modal */}
        {isAiAssistantOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Bot size={18} className="text-orange-500" />
                  AI Assistant
                </h3>
                <button 
                  onClick={handleAiAssistantToggle}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Chat messages container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto py-4 px-6 bg-gray-50"
              >
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' 
                        ? 'bg-orange-500 text-white' 
                        : message.isError 
                          ? 'bg-red-50 text-red-800 border border-red-200' 
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}
                    >
                      {message.isThinking ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator when the chat is empty */}
                {chatMessages.length === 0 && isAiLoading && (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                )}
                
                {/* Empty state */}
                {chatMessages.length === 0 && !isAiLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot size={48} className="text-orange-500 mb-4" />
                    <h4 className="text-xl font-medium text-gray-800 mb-2">How can I help you today?</h4>
                    <p className="text-gray-600 max-w-md">Ask me anything about your documents or any other questions you might have.</p>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleAiQuery} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isAiLoading && !chatMessages.some(m => m.isThinking)}
                  />
                  <button
                    type="submit"
                    className={`p-3 rounded-full ${userQuestion.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={!userQuestion.trim() || (isAiLoading && !chatMessages.some(m => m.isThinking))}
                  >
                    {isAiLoading && !chatMessages.some(m => m.isThinking) ? (
                      <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </form>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  AI responses are generated based on your documents and may not always be accurate.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceDashboard;
