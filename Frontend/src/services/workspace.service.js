import api from './api.config';

class WorkspaceService {
  // Workspace operations
  async getUserWorkspaces() {
    const response = await api.get('/workspaces');
    return response.data;
  }

  async getWorkspace(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  }

  async createWorkspace(data) {
    const response = await api.post('/workspaces', data);
    return response.data;
  }

  async updateWorkspace(workspaceId, data) {
    const response = await api.put(`/workspaces/${workspaceId}`, data);
    return response.data;
  }

  async deleteWorkspace(workspaceId) {
    await api.delete(`/workspaces/${workspaceId}`);
  }

  // Page operations
  async getWorkspacePages(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}/pages`);
    return response.data;
  }

  async createPage(workspaceId, data) {
    const response = await api.post(`/workspaces/${workspaceId}/pages`, data);
    return response.data;
  }

  async getPageById(workspaceId, pageId) {
    const response = await api.get(`/workspaces/${workspaceId}/pages/${pageId}`);
    return response.data;
  }

  async updatePage(workspaceId, pageId, data) {
    const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}`, data);
    return response.data;
  }

  async deletePage(workspaceId, pageId) {
    await api.delete(`/workspaces/${workspaceId}/pages/${pageId}`);
  }

  async duplicatePage(workspaceId, pageId) {
    const response = await api.post(`/workspaces/${workspaceId}/pages/${pageId}/duplicate`);
    return response.data;
  }

  // Icon and cover operations
  async updatePageIcon(workspaceId, pageId, icon) {
    const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}/icon`, { icon });
    return response.data;
  }

  async updatePageCover(workspaceId, pageId, file) {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await api.put(
      `/workspaces/${workspaceId}/pages/${pageId}/cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export default new WorkspaceService(); 