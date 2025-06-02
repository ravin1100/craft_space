import api from './api.config';

class UserService {
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      if (!response.data) {
        throw new Error('No user data received');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Return a default user object if there's an error
      return {
        name: 'User',
        email: 'No email',
        profilePicture: null,
        isEmailVerified: false
      };
    }
  }
}

export default new UserService();
