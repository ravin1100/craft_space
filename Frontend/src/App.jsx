import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";
import { Toaster } from "react-hot-toast";
import WorkspaceLayout from "./components/layout/WorkspaceLayout";
import WorkspaceSelectionModal from "./components/workspace/WorkspaceSelectionModal";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import PageView from "./pages/PageView";
import TemplatesPage from "./pages/TemplatesPage";
import TrashPage from "./pages/TrashPage";
import SettingsPage from "./pages/SettingsPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InviteMembers from "./components/workspace/InviteMembers";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return !isAuthenticated() ? children : <Navigate to="/workspace/1" replace />;
}

function WorkspaceRoutes() {
  const { showWorkspaceModal, setShowWorkspaceModal } = useAuth();
  const { workspaces, currentWorkspace, loading } = useWorkspace();
  const navigate = useNavigate();
  
  // Set initial workspace if not set
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // If no workspaces and not loading, show create workspace modal
  useEffect(() => {
    if (!loading && workspaces.length === 0 && !showWorkspaceModal) {
      setShowWorkspaceModal(true);
    }
  }, [workspaces, loading, showWorkspaceModal, setShowWorkspaceModal]);

  // Handle modal close
  const handleCloseModal = () => {
    // Only allow closing if there are workspaces
    if (workspaces.length > 0) {
      setShowWorkspaceModal(false);
    }
  };

  return (
    <WorkspaceProvider>
      <WorkspaceSelectionModal 
        isOpen={showWorkspaceModal} 
        onClose={handleCloseModal} 
      />
      <Routes>
        <Route path="/" element={<WorkspaceLayout />}>
          {/* Dynamic dashboard route that captures workspaceId */}
          <Route path="workspace/:workspaceId">
            <Route index element={<WorkspaceDashboard />} />
            <Route path="page/:pageId" element={<PageView />} />
            <Route path="dashboard" element={<WorkspaceDashboard />} />
            {/* Other routes */}
          <Route path="inbox" element={<div className="p-6">Inbox Content</div>} />
          <Route path="favorites" element={<div className="p-6">Favorites</div>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="invite" element={<InviteMembers />} />
          </Route>
          
          {/* Redirect /dashboard to the first available workspace */}
          <Route path="dashboard" element={<Navigate to="workspace" replace />} />
          
          {/* Default redirects */}
          <Route index element={<Navigate to="workspace" replace />} />
          <Route path="*" element={<Navigate to="workspace" replace />} />
        </Route>
      </Routes>
    </WorkspaceProvider>
  );
}

// Main App component that wraps everything with necessary providers
function AppContent() {
  const { clearWorkspace } = useWorkspace();
  
  // Expose clearWorkspace to window for AuthContext to use
  useEffect(() => {
    window.clearWorkspace = clearWorkspace;
    return () => {
      delete window.clearWorkspace;
    };
  }, [clearWorkspace]);

  return (
    <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <WorkspaceRoutes />
              </PrivateRoute>
            }
          />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <AppContent />
          <Toaster position="bottom-right" />
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
