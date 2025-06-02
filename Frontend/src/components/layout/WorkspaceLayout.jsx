import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import CreatePageModal from '../page/CreatePageModal';
import WorkspaceSelectionModal from '../workspace/WorkspaceSelectionModal';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/user.service';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { logout } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [currentUser, setCurrentUser] = useState({
    name: 'User',
    email: 'Loading...',
    profilePicture: null,
    isEmailVerified: false
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  console.log('WorkspaceLayout - workspaceId from URL:', workspaceId);
  
  // Redirect to the first workspace if no workspace ID is provided
  // useEffect(() => {
  //   if (!workspaceId) {
  //     // In a real app, you would fetch the first available workspace ID here
  //     // For now, we'll redirect to a placeholder ID
  //     navigate('/workspace/1', { replace: true });
  //   }
  // }, [workspaceId, navigate]);
  
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
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#111827] truncate max-w-xs">
              {currentWorkspace?.name || 'My Workspace'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
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
              </div>
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-fuchsia-500 flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {getUserInitial()}
                    </span>
                  )}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {currentUser.profilePicture && (
                            <img 
                              src={currentUser.profilePicture} 
                              alt={currentUser.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
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
      </div>
    </div>
  );
}
