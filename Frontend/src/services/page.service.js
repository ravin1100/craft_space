import api from './api.config';

class PageService {
  async createPage(workspaceId, pageData) {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/pages`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  async getRootPages(workspaceId) {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/pages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching root pages:', error);
      throw error;
    }
  }

  async getPage(workspaceId, pageId) {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/pages/${pageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  async updatePage(workspaceId, pageId, pageData) {
    try {
      const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  async deletePage(workspaceId, pageId) {
    try {
      await api.delete(`/workspaces/${workspaceId}/pages/${pageId}`);
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  async toggleBookmark(workspaceId, pageId, bookmarked) {
    try {
      await api.put(`/workspaces/${workspaceId}/pages/${pageId}/bookmark?bookmarked=${bookmarked}`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }
}

export default new PageService();
