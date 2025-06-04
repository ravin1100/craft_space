import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import workspaceService from "../services/workspace.service";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext({});

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPagesLoading, setIsPagesLoading] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  // Load workspaces only when authenticated
  const loadWorkspaces = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    let mounted = true;
    setLoading(true);
    
    try {
      const data = await workspaceService.getUserWorkspaces();
      console.log(data, 'data')
      if (mounted) {
        setWorkspaces(data);
        
        const savedId = localStorage.getItem('currentWorkspaceId');
        console.log(savedId, 'savedId')
        const matched = data.find(w => String(w.id) === savedId);
        console.log(matched, 'matched')
        if (matched) {
          localStorage.setItem('currentWorkspaceId', matched.id);
          setCurrentWorkspaceState(matched);
        } else if (data.length > 0) {
          console.log(data, 'data')
          setCurrentWorkspaceState(data[0]);
          localStorage.setItem('currentWorkspaceId', data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      toast.error("Failed to load workspaces");
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // Load workspaces when authentication state changes
  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Load and save current workspace to localStorage
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
      // Only load pages if we're not already loading them
      if (!isPagesLoading && !loading) {
        loadPages(currentWorkspace.id);
      }
    }
  }, [currentWorkspace, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending page loads
      setIsPagesLoading(false);
    };
  }, []);

  // Load saved workspace on initial load
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (savedWorkspaceId && workspaces.length > 0) {
      const savedWorkspace = workspaces.find(w => String(w.id) === savedWorkspaceId);
      if (savedWorkspace) {
        setCurrentWorkspaceState(savedWorkspace);
      }
      // Don't set a default workspace if we have a saved one
      // This prevents overriding the saved workspace
    } else if (workspaces.length > 0) {
      // Only set default if we have no saved workspace
      setCurrentWorkspaceState(workspaces[0]);
    }
  }, [workspaces]);
  
  // Custom setter for current workspace that also updates localStorage
  const setCurrentWorkspace = async (workspace) => {
    console.log(workspace,'setCurrentWorkspace')
    if (workspace?.id) {
      localStorage.setItem('currentWorkspaceId', workspace.id);
      await setCurrentWorkspaceState(workspace);
      // Don't navigate here - let the component handle the navigation
      return workspace;
    } else {
      localStorage.removeItem('currentWorkspaceId');
      setCurrentWorkspaceState(null);
      return null;
    }
  };
  
  // Clear workspace state on logout
  const clearWorkspace = () => {
    setCurrentWorkspaceState(null);
    setWorkspaces([]);
    setPages([]);
    localStorage.removeItem('currentWorkspaceId');
  };

  const getWorkspace = async (workspaceId) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) return workspace;
      
      // If workspace not in local state, try to fetch it
      const data = await workspaceService.getWorkspace(workspaceId);
      setWorkspaces(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
      toast.error("Failed to load workspace");
      throw error;
    }
  };

  // Function to refresh workspaces
  const refreshWorkspaces = async () => {
    try {
      await loadWorkspaces();
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      toast.error("Failed to load workspaces");
      throw error;
    }
  };

  const loadPages = async (workspaceId) => {
    try {
      // Prevent multiple loads by checking loading state
      if (isPagesLoading) return;
      
      setIsPagesLoading(true);
      const data = await workspaceService.getWorkspacePages(workspaceId);
      setPages(data);
    } catch (error) {
      console.error("Failed to load pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setIsPagesLoading(false);
    }
  };

  const createWorkspace = async (data) => {
    try {
      const newWorkspace = await workspaceService.createWorkspace(data);
      setWorkspaces((prev) => [...prev, newWorkspace]);
      await setCurrentWorkspace(newWorkspace);  // Await the state update
      navigate(`/workspace/${newWorkspace.id}`);
      toast.success("Workspace created successfully");
      return newWorkspace;
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("Failed to create workspace");
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId, data) => {
    try {
      const updatedWorkspace = await workspaceService.updateWorkspace(
        workspaceId,
        data
      );
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspaceId ? updatedWorkspace : w))
      );
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updatedWorkspace);
      }
      toast.success("Workspace updated successfully");
      return updatedWorkspace;
    } catch (error) {
      console.error("Failed to update workspace:", error);
      toast.error("Failed to update workspace");
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      if (currentWorkspace?.id === workspaceId) {
        const nextWorkspace = workspaces.find((w) => w.id !== workspaceId);
        setCurrentWorkspace(nextWorkspace);
        if (nextWorkspace) {
          navigate(`/workspace/${nextWorkspace.id}`);
        } else {
          navigate("/dashboard");
        }
      }
      toast.success("Workspace deleted successfully");
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast.error("Failed to delete workspace");
      throw error;
    }
  };

  const createPage = async (workspaceId, data) => {
    try {
      const newPage = await workspaceService.createPage(workspaceId, data);
      setPages((prev) => [...prev, newPage]);
      navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
      toast.success("Page created successfully");
      return newPage;
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("Failed to create page");
      throw error;
    }
  };

  const updatePage = async (workspaceId, pageId, data) => {
    try {
      const updatedPage = await workspaceService.updatePage(
        workspaceId,
        pageId,
        data
      );
      setPages((prev) => prev.map((p) => (p.id === pageId ? updatedPage : p)));
      toast.success("Page updated successfully");
      return updatedPage;
    } catch (error) {
      console.error("Failed to update page:", error);
      toast.error("Failed to update page");
      throw error;
    }
  };

  const deletePage = async (workspaceId, pageId) => {
    try {
      await workspaceService.deletePage(workspaceId, pageId);
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      navigate(`/workspace/${workspaceId}`);
      toast.success("Page deleted successfully");
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error("Failed to delete page");
      throw error;
    }
  };

  const duplicatePage = async (workspaceId, pageId) => {
    try {
      const newPage = await workspaceService.duplicatePage(workspaceId, pageId);
      setPages((prev) => [...prev, newPage]);
      navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
      toast.success("Page duplicated successfully");
      return newPage;
    } catch (error) {
      console.error("Failed to duplicate page:", error);
      toast.error("Failed to duplicate page");
      throw error;
    }
  };

  const value = {
    workspaces,
    currentWorkspace,
    pages,
    loading,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    getWorkspace,
    loadWorkspaces,
    loadPages,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    clearWorkspace,
    setPages,
    setWorkspaces,
    setCurrentWorkspaceState
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
