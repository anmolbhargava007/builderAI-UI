import apiClient from './interceptor';
import { API_ENDPOINTS } from './endpoints';

class documentService {
  async getFiles() {
    return apiClient
      .post(API_ENDPOINTS.DOCUMENT.GET_FILES)
      .then((response) => response)
      .catch((err) => { throw err; });
  }

  async uploadFile(formData) {
    return apiClient
      .post(API_ENDPOINTS.DOCUMENT.UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response)
      .catch((err) => { throw err; });
  }

  async getAllComponents() {
    return apiClient
      .get(API_ENDPOINTS.DOCUMENT.GET_ALL_COMPONENTS)
      .then((response) => response.data)
      .catch((err) => { throw err; });
  }
}

export default new documentService(); 