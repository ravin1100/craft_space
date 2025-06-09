import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import CreatePageModal from '../page/CreatePageModal';
import WorkspaceSelectionModal from '../workspace/WorkspaceSelectionModal';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/user.service';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import aiService from '../../services/ai.service';
import { Bot } from 'lucide-react';
import { marked } from 'marked';

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { logout } = useAuth();
  const { currentWorkspace, workspaces, loading: workspaceContextLoading } = useWorkspace();
  const [currentUser, setCurrentUser] = useState({
    name: 'User',
    email: 'Loading...',
    profilePicture: null,
    isEmailVerified: false
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  
  // AI Assistant state
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const chatContainerRef = useRef(null);
  console.log('WorkspaceLayout - workspaceId from URL:', workspaceId);
  
  // Redirect to a valid workspace if no workspace ID is provided in the URL
  useEffect(() => {
    // Only proceed if the workspace context is done loading and there's no workspaceId in the URL
    if (!workspaceContextLoading && !workspaceId) {
      if (currentWorkspace && currentWorkspace.id) {
        // If context has a current workspace, navigate to it
        console.log(`WorkspaceLayout: Navigating to currentWorkspace from context: ${currentWorkspace.id}`);
        navigate(`/workspace/${currentWorkspace.id}`, { replace: true });
      } else if (workspaces && workspaces.length > 0 && workspaces[0].id) {
        // If no currentWorkspace in context, but list of workspaces is available, navigate to the first one
        console.log(`WorkspaceLayout: Navigating to first workspace from list: ${workspaces[0].id}`);
        navigate(`/workspace/${workspaces[0].id}`, { replace: true });
      } else {
        // No workspace ID in URL, no current workspace in context, and no workspaces in the list
        console.log('WorkspaceLayout: No workspaceId in URL, no currentWorkspace, and no workspaces available.');
        // Consider navigating to a specific route like '/no-workspaces' or '/create-workspace'
      }
    }
  }, [workspaceId, navigate, currentWorkspace, workspaces, workspaceContextLoading]);
  
  // Use the workspaceId from URL or the one we're redirecting to
  const effectiveWorkspaceId = workspaceId;
  
  // Fetch current user details
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
        console.log('Fetching current user details...');
        const userData = await userService.getCurrentUser();
        console.log('Fetched user data:', userData);
        
        // Only update if we got valid data
        if (userData && (userData.name || userData.email)) {
          setCurrentUser({
            name: userData.name || userData.email.split('@')[0],
            email: userData.email || 'No email',
            profilePicture: userData.profilePicture || null,
            isEmailVerified: userData.isEmailVerified || false
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchCurrentUser, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Helper function to get user initial
  const getUserInitial = () => {
    if (loading) return '...';
    return currentUser.name.charAt(0).toUpperCase();
  };
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

  // Handle page created callback
  const handlePageCreated = useCallback((newPage) => {
    toast.success(`Page "${newPage.title}" created successfully`);
    setIsCreateModalOpen(false);
    // Optionally refresh the pages list or navigate to the new page
    // navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
  }, [workspaceId]);

  // Handle workspace created callback
  const handleWorkspaceCreated = useCallback((newWorkspace) => {
    toast.success(`Workspace "${newWorkspace.name}" created successfully`);
    setIsCreateWorkspaceModalOpen(false);
    // Navigate to the new workspace
    navigate(`/workspace/${newWorkspace.id}`);
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };
  
  // AI Assistant handlers
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
        toast.error('Failed to initialize ');
      } finally {
        setIsAiLoading(false);
      }
    }
    
    setIsAiAssistantOpen(!isAiAssistantOpen);
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
      
      let rawApiResponse = await aiService.query(userQuestion);
      console.log('Raw AI Response:', rawApiResponse);
      const htmlContent = marked(rawApiResponse || ''); // Process with marked
      console.log('HTML Content after marked:', htmlContent);
      
      // Replace thinking message with actual response
      setChatMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const thinkingIndex = newMessages.findIndex(msg => msg.isThinking);
        
        if (thinkingIndex !== -1) {
          newMessages[thinkingIndex] = {
            role: 'assistant',
            content: htmlContent, // Store HTML string
            isHtml: true,         // Add flag
            timestamp: new Date(),
            isThinking: false     // Clear thinking state
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="flex h-screen bg-[#fff7f0] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
        <Sidebar 
          isCollapsed={!sidebarOpen} 
          onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
          workspaceId={effectiveWorkspaceId}
          onOpenCreatePageModal={() => setIsCreateModalOpen(true)}
          onOpenCreateWorkspaceModal={() => setIsCreateWorkspaceModalOpen(true)}
          currentWorkspace={currentWorkspace}
        />
        
        {/* Create Page Modal */}
        <CreatePageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPageCreated={handlePageCreated}
          workspaceId={effectiveWorkspaceId}
        />
      </div>
      
      {/* Workspace Selection Modal */}
      <WorkspaceSelectionModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={handleWorkspaceCreated}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 h-16 flex">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-[#111827] truncate max-w-xs">
              {currentWorkspace?.name || 'My Workspace'}
            </h1>
            <div className="flex items-center space-x-4">
              {/* <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search pages..."
                  className="block w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <kbd className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                    ⌘K
                  </kbd>
                </div>
              </div> */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-fuchsia-500 flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <span className="text-white font-medium">
                    {getUserInitial()}
                  </span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.name}
                              {currentUser.isEmailVerified && (
                                <span className="ml-1 text-blue-500" title="Verified">
                                  ✓
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={currentUser.email}>
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center space-x-2"
                          role="menuitem"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Floating AI Assistant Button */}
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            onClick={handleAiAssistantToggle}
            className="w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-all duration-200 transform hover:scale-105"
            aria-label="AI Assistant"
          >
            <Bot size={30} className="text-white" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md shadow-md whitespace-nowrap">
              Ask AI
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
        
        {/* AI Assistant Chat Modal */}
        {isAiAssistantOpen && (
          <div className="fixed bottom-36 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-100 overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                AI Assistant
              </h3>
              <button 
                onClick={handleAiAssistantToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Chat messages container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto py-4 px-4 bg-gray-50"
            >
              {chatMessages.map((message, index) => {
              console.log('Rendering message:', message);
              return (
                <div 
                  key={index} 
                  className={`mb-3 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${message.role === 'user' 
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
                      message.isHtml ? (
                      <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: message.content }} />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    )
                    )}
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })}
              
              {/* Loading indicator when the chat is empty */}
              {chatMessages.length === 0 && isAiLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              )}
              
              {/* Empty state */}
              {chatMessages.length === 0 && !isAiLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mb-3">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <h4 className="text-md font-medium text-gray-800 mb-2">How can I help you today?</h4>
                  <p className="text-gray-600 text-sm max-w-xs">Ask me anything about your documents or any other questions you might have.</p>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <form onSubmit={handleAiQuery} className="flex items-center gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 border border-gray-300 rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isAiLoading && !chatMessages.some(m => m.isThinking)}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-full ${userQuestion.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!userQuestion.trim() || (isAiLoading && !chatMessages.some(m => m.isThinking))}
                >
                  {isAiLoading && !chatMessages.some(m => m.isThinking) ? (
                    <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
