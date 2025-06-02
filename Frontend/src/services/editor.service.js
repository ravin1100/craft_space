import api from './api.config';

class EditorService {
  async getPageContent(workspaceId, pageId) {
    const response = await api.get(`/workspaces/${workspaceId}/pages/${pageId}/content`);
    return response.data;
  }

  async savePageContent(workspaceId, pageId, content) {
    const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}/content`, content);
    return response.data;
  }

  async savePageTitle(workspaceId, pageId, title) {
    const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}/title`, { title });
    return response.data;
  }

  async uploadImage(workspaceId, pageId, file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(
      `/workspaces/${workspaceId}/pages/${pageId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getPageMetadata(workspaceId, pageId) {
    const response = await api.get(`/workspaces/${workspaceId}/pages/${pageId}/metadata`);
    return response.data;
  }

  async updatePageMetadata(workspaceId, pageId, metadata) {
    const response = await api.put(`/workspaces/${workspaceId}/pages/${pageId}/metadata`, metadata);
    return response.data;
  }
}

export default new EditorService(); 