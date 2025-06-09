import api from './api.config';
import aiService from './ai.service';

/**
 * SmartService handles AI-powered features like auto-linking, 
 * knowledge graph generation, and auto-tagging
 */
class SmartService {
  /**
   * Get link suggestions for the given text content
   * @param {string} workspaceId - The workspace ID
   * @param {string} content - The text content to analyze
   * @returns {Promise<Array>} - Array of suggested links
   */
  // async getSuggestedLinks(workspaceId, content) {
  //   try {
  //     const response = await api.post(`/workspaces/${workspaceId}/smart/suggest-links`, { content });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error getting link suggestions:', error);
  //     // throw error;
  //   }
  // }

  /**
   * Get knowledge graph data for the workspace
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise<Object>} - Knowledge graph data
   */
  async getKnowledgeGraph(workspaceId) {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/smart/knowledge-graph`);
      return response.data;
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Generate tags for the given content
   * @param {string} workspaceId - The workspace ID
   * @param {string} content - The text content to analyze
   * @returns {Promise<Array>} - Array of generated tags
   */
  async generateTags(workspaceId, content) {
    try {
      // const response = await api.post(`/workspaces/${workspaceId}/smart/generate-tags`, { content });
      // return response.data;
    } catch (error) {
      console.error('Error generating tags:', error);
      throw error;
    }
  }
  
  /**
   * Get AI-generated tags for a page using the AI service
   * @param {string} pageId - The page ID
   * @returns {Promise<Array>} - Array of generated tags
   */
  async getAiGeneratedTags(pageId) {
    try {
      const response = await aiService.generatePageTags(pageId);
      // The response is a comma-separated string of tags
      if (response && typeof response === 'string') {
        return response.split(',').map(tag => tag.trim());
      }
      return [];
    } catch (error) {
      console.error('Error getting AI-generated tags:', error);
      throw error;
    }
  }

  /**
   * Update tags for a page
   * @param {string} workspaceId - The workspace ID
   * @param {string} pageId - The page ID
   * @param {Array} tags - Array of tags
   * @returns {Promise<Object>} - Updated page data
   */
  async updatePageTags(workspaceId, pageId, tags) {
    try {
      // Get auth token
      const token = localStorage.getItem('notion_token');
      
      // Send tags as a direct array in the request body with explicit Authorization header
      // Using PUT method as specified by the API
      const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}/tags`, tags, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating page tags:', error);
      throw error;
    }
  }

  /**
   * Search pages by tags
   * @param {string} workspaceId - The workspace ID
   * @param {Array} tags - Array of tags to search for
   * @returns {Promise<Array>} - Array of matching pages
   */
  async searchByTags(workspaceId, tags) {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/smart/search-by-tags`, { tags });
      return response.data;
    } catch (error) {
      console.error('Error searching by tags:', error);
      throw error;
    }
  }
}

export default new SmartService();
