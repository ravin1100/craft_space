import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
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

  return !isAuthenticated() ? children : <Navigate to="/workspace/default" replace />;
}

function WorkspaceDefaultPage() {
  const { showWorkspaceModal, setShowWorkspaceModal } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWorkspace && !showWorkspaceModal) {
      // If a workspace is active and modal isn't explicitly shown, go to its dashboard.
      navigate(`/workspace/${currentWorkspace.id}/dashboard`, { replace: true });
    } else if (!currentWorkspace && !showWorkspaceModal && !workspaceLoading) {
      // If no active workspace, modal not shown, and not loading, ensure modal is triggered.
      // AuthContext also has logic for this, but this is a safeguard for this specific page.
      console.log("WorkspaceDefaultPage: No current workspace, ensuring modal is shown.");
      setShowWorkspaceModal(true);
    }
  }, [currentWorkspace, showWorkspaceModal, setShowWorkspaceModal, navigate, workspaceLoading]);

  return (
    <div className="p-6 flex flex-col items-center justify-center h-full text-center">
      <p className="text-xl text-gray-700 mb-4">
        {showWorkspaceModal || (!currentWorkspace && !workspaceLoading) 
          ? "Please select or create a workspace."
          : "Loading your workspace..."
        }
      </p>
      {(workspaceLoading || (!currentWorkspace && showWorkspaceModal)) && (
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mt-4"></div>
      )}
    </div>
  );
}

function WorkspaceRoutes() {
  const { isAuthenticated, showWorkspaceModal, setShowWorkspaceModal, userLoading } = useAuth();
  const { workspaces, currentWorkspace, fetchWorkspaces, setCurrentWorkspaceById, loading: workspaceLoading, setCurrentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation(); // Added for checking current path
  
  // Set initial workspace if not set
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // If no workspaces and not loading, show create workspace modal
  useEffect(() => {
    if (!userLoading && !workspaceLoading && workspaces.length === 0 && !showWorkspaceModal) {
      setShowWorkspaceModal(true);
    }
  }, [workspaces, userLoading, workspaceLoading, showWorkspaceModal, setShowWorkspaceModal]);

  // Handle modal close
  const handleCloseModal = () => {
    setShowWorkspaceModal(false);
    // It's assumed that WorkspaceSelectionModal calls setCurrentWorkspace internally upon successful selection/creation
    // BEFORE it calls this onClose handler.
    if (currentWorkspace) {
      navigate(`/workspace/${currentWorkspace.id}/dashboard`, { replace: true });
    } else {
      // If modal is closed and there's still no currentWorkspace:
      if (location.pathname === "/workspace/default" || location.pathname === "/") {
        // If on the dedicated page for workspace selection, or at root of protected area,
        // and modal was dismissed without choosing/creating, re-show it.
        console.warn("Modal closed on /workspace/default without selection. Re-showing modal.");
        setShowWorkspaceModal(true);
      } else {
        // If elsewhere, this is an unexpected state. Log it.
        // AuthContext should generally handle redirecting to /workspace/default if no workspace is active.
        console.warn("Modal closed without current workspace on an unexpected page:", location.pathname);
      }
    }
  };

  return (
    <>
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
          {/* Dynamic dashboard route that captures workspaceId */}
          <Route path="workspace/default" element={<WorkspaceDefaultPage />} />

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
          
          {/* Redirect /dashboard to the /workspace/default to handle modal logic */}
          <Route path="dashboard" element={<Navigate to="/workspace/default" replace />} />
          
          {/* Default redirect for the root of WorkspaceRoutes to /workspace/default */}
          <Route index element={<Navigate to="workspace/default" replace />} />
          {/* Consider a more specific catch-all or a 404 component within WorkspaceLayout */}
          {/* <Route path="*" element={<Navigate to="workspace/default" replace />} /> */}
        </Route>
      </Routes>
    </>
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
