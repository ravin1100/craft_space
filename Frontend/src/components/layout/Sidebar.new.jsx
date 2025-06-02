import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Home, Inbox, Settings, FileText, Plus, ChevronDown, 
  ChevronRight, Trash2, LayoutGrid, UserPlus, ChevronLeft, Menu, X, Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  children,
  className = '',
  ...props 
}) => (
  <div className="relative">
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
      <div className="flex items-center min-w-0">
        <span className={cn('text-[#6b7280]', isCollapsed ? 'mr-0' : 'mr-3')}>
          {icon}
        </span>
        {!isCollapsed && (
          <span className="truncate">{label}</span>
        )}
      </div>
      {!isCollapsed && count !== undefined && (
        <span className="ml-2 text-xs text-gray-400">{count}</span>
      )}
      {!isCollapsed && hasChildren && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="ml-auto text-gray-400 hover:text-gray-600 p-1 -mr-1"
        >
          {isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      )}
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

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sample pages data - replace with API call
  const pages = [
    { id: 'important', title: 'Important', icon: <Star size={18} /> },
    { id: 'misc', title: 'Miscellaneous', icon: <FileText size={18} /> },
    { id: 'dsa', title: 'DSA', icon: <FileText size={18} /> },
    { id: 'java111', title: 'Java 111 class Notes', icon: <FileText size={18} /> },
    { id: 'b21', title: 'B21-Java111 Notes by Kapi...', icon: <FileText size={18} /> },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isPageActive = (pageId) => {
    return location.pathname.includes(`/page/${pageId}`);
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
            isActive={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<Inbox size={20} />}
            isActive={location.pathname === '/inbox'}
            onClick={() => navigate('/inbox')}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<Star size={20} />}
            isActive={location.pathname === '/favorites'}
            onClick={() => navigate('/favorites')}
            isCollapsed={true}
          />
        </div>

        {/* Bottom icons */}
        <div className="mt-auto flex flex-col items-center space-y-4">
          <SidebarItem
            icon={<Settings size={20} />}
            isActive={location.pathname === '/settings'}
            onClick={() => navigate('/settings')}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<LayoutGrid size={20} />}
            isActive={location.pathname === '/templates'}
            onClick={() => navigate('/templates')}
            isCollapsed={true}
          />
          <SidebarItem
            icon={<Trash2 size={20} />}
            isActive={location.pathname === '/trash'}
            onClick={() => navigate('/trash')}
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'W'}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-[#111827]">My Workspace</h3>
              <p className="text-xs text-[#6b7280]">Free Plan</p>
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
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="mb-2">
          <SidebarItem
            icon={<Home size={18} />}
            label="Home"
            isActive={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          />
          <SidebarItem
            icon={<Inbox size={18} />}
            label="Inbox"
            count={3}
            isActive={location.pathname === '/inbox'}
            onClick={() => navigate('/inbox')}
          />
          <SidebarItem
            icon={<Star size={18} />}
            label="Favorites"
            isActive={location.pathname === '/favorites'}
            onClick={() => navigate('/favorites')}
          />
        </div>

        {/* Pages section */}
        <div className="mt-6">
          <div 
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wider cursor-pointer hover:bg-gray-50 rounded mx-2"
            onClick={() => toggleSection('workspace')}
          >
            <span>Pages</span>
            <div className="flex items-center">
              <button 
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle new page creation
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {expandedSections.workspace && (
            <div className="mt-1">
              {pages.map((page) => (
                <SidebarItem
                  key={page.id}
                  icon={page.icon}
                  label={page.title}
                  isActive={isPageActive(page.id)}
                  onClick={() => navigate(`/page/${page.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 p-2">
        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          isActive={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
        />
        <SidebarItem
          icon={<LayoutGrid size={18} />}
          label="Templates"
          isActive={location.pathname === '/templates'}
          onClick={() => navigate('/templates')}
        />
        <SidebarItem
          icon={<Trash2 size={18} />}
          label="Trash"
          isActive={location.pathname === '/trash'}
          onClick={() => navigate('/trash')}
        />
        <SidebarItem
          icon={<UserPlus size={18} />}
          label="Invite Members"
          onClick={() => {}}
        />
        
        {/* User profile */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-[#111827] truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-[#6b7280]">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
