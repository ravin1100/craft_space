import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import authService from "../services/auth.service";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage if token exists
  useEffect(() => {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    
    console.log('AuthContext - Initializing with stored user:', storedUser);
    console.log('AuthContext - Token exists:', !!token);
    
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Verify session with backend
  useEffect(() => {
    const verifySession = async () => {
      const token = authService.getToken();
      if (token && !user) { // Only run if token exists but user is not yet set by initial effect, or to re-validate
        console.log('AuthContext: Verifying session with backend using /api/users/me');
        setLoading(true);
        try {
          const currentUser = await authService.getMe();
          console.log('AuthContext: Session verified, user data:', currentUser);
          setUser(currentUser);
          // If user data from /me is different from localStorage, update localStorage
          if (JSON.stringify(currentUser) !== JSON.stringify(authService.getUser())) {
            authService.setUser(currentUser);
          }
        } catch (error) {
          console.error('AuthContext: Session verification failed', error.response?.status);
          if (error.response && error.response.status === 403) {
            console.log('AuthContext: Received 403, logging out.');
            await logout(); // logout already navigates to '/'
          } else {
            // For other errors (e.g., network), you might want to clear user or handle differently
            // For now, we'll just log it and potentially clear the user if appropriate
            // setUser(null); // Or keep stale user data and let them try to interact
            console.error('AuthContext: Error during session verification, not a 403:', error);
          }
        }
        setLoading(false);
      }
    };

    verifySession();
  }, []); // Run once on mount, or consider dependencies if needed

  const isAuthenticated = () => {
    return !!authService.getToken();
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process');
      const data = await authService.login(email, password, { skipErrorHandler: true });
      console.log('AuthContext: Login successful, received data:', data);
      
      // Ensure we have user data before setting it
      if (!data.user) {
        console.warn('No user data in login response, using empty object');
      } else {
        console.log('Setting user data:', data.user);
      }
      
      setUser(data.user || {});
      
      // Show success message
      toast.success("Welcome back!");
      
      // Show workspace selection modal instead of direct navigation
      console.log('AuthContext: Showing workspace selection');
      setShowWorkspaceModal(true);
      
      return data;
    } catch (error) {
      console.error("AuthContext: Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Clear any partial auth state
      authService.clearAuth();
      setUser(null);
      
      // Re-throw the error to be handled by the component
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = await authService.register(email, password, name);
      setUser(data.user);
      
      // Show success message
      toast.success("Registration successful!");
      
      // Show workspace selection modal instead of direct navigation
      console.log('AuthContext: Showing workspace selection after registration');
      setShowWorkspaceModal(true);
      
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      // toast.error(error.response?.data?.debugMessage || "Failed to register");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Clear workspace state
      if (window.clearWorkspace) {
        window.clearWorkspace();
      }
      navigate("/");
      // toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    showWorkspaceModal,
    setShowWorkspaceModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
