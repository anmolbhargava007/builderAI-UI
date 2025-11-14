import { API_ENDPOINTS } from "./endpoints"
import apiClient from "./interceptor"

class companyModelService {
    getModels = (compid, userid) => {
        return apiClient
            .get(API_ENDPOINTS.META_COMPANY.GET_MODELS, { 
                params: { 
                    compid: compid,
                    userid: userid 
                } 
            })
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    getModelProviders = (compid, userid) => {
        return apiClient
            .get(API_ENDPOINTS.META_COMPANY.GET_MODEL_PROVIDERS, {
                params: {
                    compid: compid,
                    userid: userid
                }
            })
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    getModelConfig = () => {
        return apiClient
            .get(API_ENDPOINTS.META_COMPANY.GET_MODEL_CONFIG)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    getProviderConfig = () => {
        return apiClient
            .get(API_ENDPOINTS.META_COMPANY.GET_PROVIDER_CONFIG)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    toggleModel = (modelId, isEnabled) => {
        // TODO: Implement toggle functionality when backend endpoint is available
        console.log(`Toggling model ${modelId} to ${isEnabled}`)
        return Promise.resolve({ success: true })
    }

    toggleModelProvider = (providerId, isEnabled) => {
        // TODO: Implement toggle functionality when backend endpoint is available
        console.log(`Toggling model provider ${providerId} to ${isEnabled}`)
        return Promise.resolve({ success: true })
    }

    addNewModel = (modelData) => {
        return apiClient
            .post(API_ENDPOINTS.META_COMPANY.ADD_MODEL, modelData)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    updateModel = (modelData) => {
        return apiClient
            .post(API_ENDPOINTS.META_COMPANY.UPDATE_MODEL, modelData)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    addNewProvider = (providerData) => {
        return apiClient
            .post(API_ENDPOINTS.META_COMPANY.ADD_PROVIDER, providerData)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }

    updateProvider = (providerData) => {
        return apiClient
            .post(API_ENDPOINTS.META_COMPANY.UPDATE_PROVIDER, providerData)
            .then((response) => {
                return response
            }).catch((error) => {
                console.log(error)
                throw error
            })
    }
}

export default new companyModelService()
