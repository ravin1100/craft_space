import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Home, Inbox, Settings, FileText, Plus, ChevronDown, 
  ChevronRight, Trash2, LayoutGrid, UserPlus, ChevronLeft, Menu, Star, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import pageService from '../../services/page.service'; // Added for bookmarking

// Utility function for conditional class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Sidebar item component
const SidebarItem = ({ 
  icon, 
  label, 
  isActive = false, 
  count,
  isCollapsed = false,
  hasChildren = false,
  isExpanded = false,
  onToggle = () => {},
  onDelete,
  onToggleFavorite, // New prop
  isBookmarked, // New prop
  children,
  className = '',
  ...props 
}) => (
  <div className="relative group">
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-lg mx-2 text-sm font-medium',
        'hover:bg-gray-100 transition-colors duration-150',
        isActive ? 'bg-gray-100 text-[#111827]' : 'text-[#4b5563]',
        isCollapsed ? 'justify-center px-2' : 'px-3',
        className
      )}
      {...props}
    >
      <div className="flex items-center min-w-0 flex-1">
        <span className={cn('text-[#6b7280]', isCollapsed ? 'mr-0' : 'mr-3')}>
          {icon}
        </span>
        {!isCollapsed && (
          <span className="truncate">{label}</span>
        )}
      </div>
      
      <div className="flex items-center">
        {!isCollapsed && count !== undefined && (
          <span className="ml-2 text-xs text-gray-400">{count}</span>
        )}
        {!isCollapsed && hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 p-1 -mr-1"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
        {!isCollapsed && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent page navigation if item is clicked
              onToggleFavorite(e);
            }}
            className={`ml-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={isBookmarked ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
        {!isCollapsed && onDelete && (
          <button
            onClick={(e) => {
              // e.stopPropagation();
              onDelete(e);
            }}
            className="ml-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete page"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
    {!isCollapsed && hasChildren && children && (
      <div className={cn(
        'overflow-hidden transition-all duration-200',
        isExpanded ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="py-1 pl-8 pr-2">
          {children}
        </div>
      </div>
    )}
  </div>
);

export default function Sidebar({ isCollapsed, onToggleCollapse, workspaceId, onOpenCreatePageModal, onOpenCreateWorkspaceModal, currentWorkspace }) {
  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const { 
    currentWorkspace: contextWorkspace, 
    pages, 
    loadPages, 
    workspaces, 
    setCurrentWorkspace, 
    deletePage
  } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the workspace from props or context
  const workspace = currentWorkspace || contextWorkspace;

  console.log('workspace', workspace, currentWorkspace, contextWorkspace);
  
  // This effect is now handled in WorkspaceContext
  useEffect(() => {
    // No-op - page loading is handled by WorkspaceContext
  }, [workspace?.id]);

  // Handle workspace switch
  const handleWorkspaceSwitch = async (newWorkspace) => {
    try {
      // Update the workspace in context (this will also update localStorage)
      await setCurrentWorkspace(newWorkspace);
      
      // Let the WorkspaceContext handle the page loading
      // We'll show the success message immediately
      toast.success(`Switched to workspace: ${newWorkspace.name}`);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      toast.error('Failed to switch workspace');
    }
  };

  const handleNewPageClick = (e) => {
    e.stopPropagation();
    if (onOpenCreatePageModal) {
      onOpenCreatePageModal();
    } else {
      console.error('onOpenCreatePageModal is not defined');
    }
  };

  // Animation variants
  const containerVariants = {
    open: { 
      height: 'auto',
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    closed: { 
      height: 0,
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  // Search state for filtering pages
  const [search, setSearch] = useState("");

  // Format pages for display and filter by search
  const formattedPages = (pages || [])
    .map(page => ({
      id: page.id,
      title: page.title || 'Untitled',
      // The main icon can change based on bookmark status if desired, or use page.iconUrl
      icon: page.bookmarked ? <Star size={18} className="text-yellow-500" /> : (page.iconUrl ? <img src={page.iconUrl} alt="icon" className="w-4 h-4" /> : <FileText size={18} />),
      bookmarked: page.bookmarked // Ensure bookmarked status is carried over
    }))
    .filter(page =>
      page.title.toLowerCase().includes(search.toLowerCase())
    );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isPageActive = (pageId) => {
    return location.pathname.includes(`/page/${pageId}`);
  };
  
  const handlePageClick = (pageId) => {
    navigate(`/workspace/${workspace?.id}/page/${pageId}`);
  };

  const handleDeletePage = async (e, pageId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage(workspace.id, pageId);
        toast.success('Page deleted successfully');
      } catch (error) {
        console.error('Failed to delete page:', error);
        toast.error('Failed to delete page');
      }
    }
  };

  const handleToggleFavorite = async (e, pageId, currentStatus) => {
    e.stopPropagation(); // Prevent page navigation
    if (!workspace || !workspace.id) {
      toast.error('Workspace context is not available.');
      return;
    }
    const newStatus = !currentStatus;
    try {
      // Ensure pageService is imported and configured correctly
      await pageService.toggleBookmark(workspace.id, pageId, newStatus);
      toast.success(`Page ${newStatus ? 'added to' : 'removed from'} favorites`);
      if (loadPages) {
        loadPages(workspace.id); // Refresh the pages list
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      let errorMessage = 'Failed to update favorite status.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.statusText) {
        errorMessage = `Failed: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div className="h-full bg-white border-r border-gray-200 flex flex-col py-4">
        {/* Collapsed navigation */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          
          <SidebarItem
            icon={<Home size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/dashboard`}
            onClick={() => navigate(`/workspace/${workspace?.id}/dashboard`)}
            isCollapsed={true}
          />
          {/* <SidebarItem
            icon={<Inbox size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/inbox`}
            onClick={() => navigate(`/workspace/${workspace?.id}/inbox`)}
            isCollapsed={true}
          /> */}
          <SidebarItem
            icon={<Star size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/favorites`}
            onClick={() => navigate(`/workspace/${workspace?.id}/favorites`)}
            isCollapsed={true}
          />
        </div>

        {/* Bottom icons */}
        <div className="mt-auto flex flex-col items-center space-y-4">
          <SidebarItem
            icon={<Settings size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/settings`}
            onClick={() => navigate(`/workspace/${workspace?.id}/settings`)}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<LayoutGrid size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/templates`}
            onClick={() => navigate(`/workspace/${workspace?.id}/templates`)}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<Trash2 size={20} />}
            isActive={location.pathname === `/workspace/${workspace?.id}/trash`}
            onClick={() => navigate(`/workspace/${workspace?.id}/trash`)}
            isCollapsed={true}
          />
        </div>
      </div>
    );
  }

  // Expanded sidebar view
  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Workspace header */}
      <div className="p-4 border-b border-gray-200 h-16 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'W'}
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <h3 
                  className="text-sm font-semibold text-[#111827] cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    if (onOpenCreateWorkspaceModal) {
                      onOpenCreateWorkspaceModal();
                    }
                  }}
                >
                  {currentWorkspace?.name || ''}
                </h3>
              </div>
              
              {/* Workspace menu */}
              <AnimatePresence>
                {isWorkspaceMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 absolute left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2 space-y-1">
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => {
                            handleWorkspaceSwitch(ws);
                            setIsWorkspaceMenuOpen(false);
                            navigate(`/workspace/${ws.id}`);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors',
                            ws.id === workspace?.id && 'bg-gray-100 text-blue-600'
                          )}
                        >
                          {ws.name}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsWorkspaceMenuOpen(false);
                          if (onOpenCreateWorkspaceModal) {
                            onOpenCreateWorkspaceModal();
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center space-x-2">
                          <Plus size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">Create Workspace</span>
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* <p className="text-xs text-[#6b7280]">Free Plan</p> */}
            </div>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search Page"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {/* Main navigation */}
          <div className="mb-2">
            <SidebarItem
              icon={<Home size={18} />}
              label="Home"
              isActive={location.pathname === `/workspace/${workspace?.id}/dashboard`}
              onClick={() => navigate(`/workspace/${workspace?.id}/dashboard`)}
            />
            {/* <SidebarItem
              icon={<Inbox size={18} />}
              label="Inbox"
              count={5}
              isActive={location.pathname === `/workspace/${workspace?.id}/inbox`}
              onClick={() => navigate(`/workspace/${workspace?.id}/inbox`)}
            /> */}
          </div>

          {/* Pages section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 mb-1">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</h3>
              <button
                onClick={handleNewPageClick}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
                title="New page"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-0.5">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              ) : formattedPages.length > 0 ? (
                formattedPages.map((page) => (
                  <SidebarItem
                    key={page.id}
                    icon={page.icon}
                    label={page.title}
                    isActive={isPageActive(page.id)}
                    onClick={() => handlePageClick(page.id)}
                    onDelete={(e) => handleDeletePage(e, page.id)}
                    isBookmarked={page.bookmarked} // Pass bookmarked status
                    onToggleFavorite={(e) => handleToggleFavorite(e, page.id, page.bookmarked)} // Pass handler
                    className="pl-1"
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No pages yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div className="mt-auto border-t border-gray-100 pt-2">
          <SidebarItem
            icon={<LayoutGrid size={18} />}
            label="Templates"
            isActive={location.pathname === `/workspace/${workspace?.id}/templates`}
            onClick={() => navigate(`/workspace/${workspace?.id}/templates`)}
          />
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            isActive={location.pathname === `/workspace/${workspace?.id}/settings`}
            onClick={() => navigate(`/workspace/${workspace?.id}/settings`)}
          />
          <SidebarItem
            icon={<Trash2 size={18} />}
            label="Trash"
            isActive={location.pathname === `/workspace/${workspace?.id}/trash`}
            onClick={() => navigate( `/workspace/${workspace?.id}/trash`)}
          />
          <SidebarItem
            icon={<UserPlus size={18} />}
            label="Invite Members"
            onClick={() => navigate(`/workspace/${workspace?.id}/invite`)}
          />
        </div>
      </div>
    </div>
  );
}
