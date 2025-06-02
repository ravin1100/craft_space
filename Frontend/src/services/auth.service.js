import api from './api.config';

const TOKEN_KEY = 'notion_token';
const USER_KEY = 'notion_user';

class AuthService {
  async login(email, password) {
    try {
      console.log('AuthService: Sending login request to /api/auth/login');
      const response = await api.post('/auth/login', { 
        email: email.trim(),
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('AuthService: Login response received', { 
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      if (response.data.token) {
        this.setToken(response.data.token);
      } else {
        console.warn('No token in login response');
      }
      
      if (response.data.user) {
        this.setUser(response.data.user);
      } else {
        console.warn('No user data in login response');
      }
      
      return response.data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      };
      
      console.error('AuthService: Login error:', errorDetails);
      
      // Enhance the error with more context
      const enhancedError = new Error(error.response?.data?.message || 'Login failed');
      enhancedError.details = errorDetails;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  }

  async register(email, password, name) {
    console.log('AuthService: Sending register request');
    const response = await api.post('/auth/signup', { email, password, name });
    console.log('AuthService: Register response received', { status: response.status });
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async validateToken() {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setUser(user) {
    console.log('AuthService: Setting user in localStorage:', user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('AuthService: Retrieved user from localStorage:', user);
    return user;
  }

  clearAuth() {
    console.log('AuthService: Clearing auth data');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService(); 