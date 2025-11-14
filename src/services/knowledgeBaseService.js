import apiClient from './interceptor';
import { API_ENDPOINTS } from './endpoints';

class KnowledgeBaseService {

	getAllKnowledgeBase  = (compid) => {
  console.log(API_ENDPOINTS.KNOWLEDGE_BASE.GET_KNOWLEDGE_BASE)
        return apiClient
        .get(API_ENDPOINTS.KNOWLEDGE_BASE.GET_KNOWLEDGE_BASE)
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
          
}
export default new KnowledgeBaseService();