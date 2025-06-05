import api from './api.config';

const TOKEN_KEY = 'notion_token';
const USER_KEY = 'notion_user';

class AuthService {
  async login(email, password, axiosConfig = {}) {
    try {
      console.log('AuthService: Sending login request to /api/auth/login');
      const response = await api.post('/auth/login', { 
        email: email.trim(),
        password: password
      }, {
        ...axiosConfig, // Merge incoming config
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
    // try {
    //   await api.post('/auth/logout');
    // } catch (error) {
    //   console.error('Logout error:', error);
    // } finally {
      this.clearAuth();
    // }
  }

  async getMe() {
    try {
      console.log('AuthService: Fetching current user with /api/users/me');
      const response = await api.get('/users/me');
      console.log('AuthService: /api/users/me response received', response.data);
      // Optionally update user in localStorage if it's different or more up-to-date
      // this.setUser(response.data); 
      return response.data;
    } catch (error) {
      console.error('AuthService: Error fetching /api/users/me', error.response?.status, error.response?.data);
      // Do not clearAuth here, let AuthContext handle it based on status
      throw error; 
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
    console.log('AuthService: Raw user string from localStorage:', userStr);
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        console.log('AuthService: Parsed user from localStorage:', user);
        return user;
      } catch (e) {
        console.error('AuthService: Error parsing user from localStorage. String was:', userStr, e);
        this.clearAuth(); // Clear potentially corrupted auth data
        return null;
      }
    }
    // If userStr is null, 'undefined', or 'null' (as strings), return null
    if (userStr === 'undefined' || userStr === 'null') {
        console.warn('AuthService: user_key in localStorage was "undefined" or "null" string. Clearing auth.');
        this.clearAuth(); // Clear potentially corrupted auth data
    }
    return null;
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