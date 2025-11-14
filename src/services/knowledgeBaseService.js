import apiClient from './interceptor';
import { API_ENDPOINTS } from './endpoints';

class KnowledgeBaseService {

    getAllKnowledgeBase = async () => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.KNOWLEDGE_BASE.GET_KNOWLEDGE_BASE
            );
            return response.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    getAllKnowledgeBaseList = async () => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.KNOWLEDGE_BASE.GET_KNOWLEDGE_BASE_LIST
            );
            return response.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    saveNewKB = async (payload) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.KNOWLEDGE_BASE.SAVE_KNOWLEDGE_BASE,
                payload
            );
            return response.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    editKB = async (payload) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.KNOWLEDGE_BASE.SAVE_KNOWLEDGE_BASE,
                payload
            );
            return response.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

}

export default new KnowledgeBaseService();