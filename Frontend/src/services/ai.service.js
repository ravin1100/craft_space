import api from './api.config';

class AIService {
  /**
   * Upload files to the AI service for processing
   * @param {FormData} formData - FormData containing files to upload
   * @returns {Promise} - Promise with the upload response
   */
  async uploadFiles(formData) {
    try {
      // Get auth token
      const token = localStorage.getItem('notion_token');
      
      const response = await api.post('ai/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading files to AI service:', error);
      throw error;
    }
  }

  /**
   * Generate tags for a specific page
   * @param {string} pageId - The ID of the page to generate tags for
   * @returns {Promise<string>} - Promise with comma-separated tags
   */
  async generatePageTags(pageId) {
    try {
      // Get auth token
      const token = localStorage.getItem('notion_token');
      
      const response = await api.get(`/ai/upload/${pageId}/tag`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating tags for page:', error);
      throw error;
    }
  }

  /**
   * Query the AI with a question
   * @param {string} question - The user's question
   * @returns {Promise} - Promise with the AI response
   */
  async query(question) {
    try {
      // Get auth token
      const token = localStorage.getItem('notion_token');
      
      const response = await api.post('ai/query', { question }, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error querying AI service:', error);
      throw error;
    }
  }
}

export default new AIService();
