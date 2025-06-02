import api from './api.config';

class SettingsService {
  async updateUserProfile(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async updateWorkspaceSettings(workspaceId, settingsData) {
    try {
      const response = await api.put(`/workspaces/${workspaceId}/settings`, settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating workspace settings:', error);
      throw error;
    }
  }

  async getWorkspaceSettings(workspaceId) {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace settings:', error);
      throw error;
    }
  }
  
  // Convert image file to base64 string
  async convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async uploadProfilePicture(imageFile) {
    try {
      // Convert the image to base64 string
      const base64Image = await this.convertImageToBase64(imageFile);
      
      // Send the base64 image as part of JSON payload
      const response = await api.put('/users/profile', {
        profilePicture: base64Image
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}

export default new SettingsService();
