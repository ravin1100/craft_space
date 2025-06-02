import api from './api.config';

class TrashService {
  async getTrashedPages(workspaceId) {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/pages/trash`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trashed pages:', error);
      throw error;
    }
  }

  async hardDeletePage(workspaceId, pageId) {
    try {
      await api.delete(`/workspaces/${workspaceId}/pages/trash/${pageId}`);
    } catch (error) {
      console.error('Error hard deleting page:', error);
      throw error;
    }
  }

  async restorePage(workspaceId, pageId) {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/pages/trash/${pageId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring page:', error);
      throw error;
    }
  }
}

export default new TrashService();
