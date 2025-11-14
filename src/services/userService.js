
import { API_ENDPOINTS } from "./endpoints"
import apiClient from "./interceptor"

class userService {
    get_All_Users = (compid) => {
        return apiClient
            .get(API_ENDPOINTS.AUTH.GET_ALL_USERS, { params: { compid: compid } })
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
            })
    }
    add_User = (payload) => {
        return apiClient
            .post(API_ENDPOINTS.AUTH.ADD_USERS, payload)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
            })
    }
    update_User = (payload) => {
        return apiClient
            .put(API_ENDPOINTS.AUTH.UPDATE_USERS, payload)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
            })
    }
    change_User_status = (payload) => {
        return apiClient
            .put(API_ENDPOINTS.AUTH.CHANGE_USER_STATUS, payload)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
            })
    }
}



export default new userService()