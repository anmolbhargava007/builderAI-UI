import apiClient from './interceptor';
import { API_ENDPOINTS } from './endpoints';

class authService {
  async customLoginUser(userInfo) {
    
    return apiClient
      .post(API_ENDPOINTS.AUTH.CUSTOM_LOGIN, userInfo)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }


  async msSSOLoginUser(userInfo) {
    return apiClient
      .post(API_ENDPOINTS.AUTH.MS_SSO_LOGIN, userInfo)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }
  async getAllRoles(){
     return apiClient
      .get(API_ENDPOINTS.AUTH.GET_ROLES)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }

  getTransactionHistory=(payload)=>{
      return apiClient
      .get(API_ENDPOINTS.AUTH.GET_TRANSACTION_DATA,{ params:payload })
      .then(response=>{
        return response
      }).catch((err)=>{
        console.log(err)
      })
    } 
}

export default new authService();