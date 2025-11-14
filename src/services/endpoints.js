const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    CUSTOM_LOGIN: `${API_BASE_URL}/auth/api/v1/login_custom`,
    MS_SSO_LOGIN: `${API_BASE_URL}/auth/v1/ssologin`,
    REGISTER: `${API_BASE_URL}/auth/api/v1/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    GET_DEPARTMENTS:`${API_BASE_URL}/auth/api/v1/get_departments`,
    GET_ROLES:`${API_BASE_URL}/auth/api/v1/get_all_roles`,
    GET_TRANSACTION_DATA:`${API_BASE_URL}/auth/api/v1/get_transcation_history`,
    GET_ALL_USERS:`${API_BASE_URL}/auth/api/v1/get_all_users`,
    ADD_USERS:`${API_BASE_URL}/auth/api/v1/add_users`,
    UPDATE_USERS:`${API_BASE_URL}/auth/api/v1/update_user`,
    CHANGE_USER_STATUS:`${API_BASE_URL}/auth/api/v1/change_user_status`
  
  },
  COMPANY: {
    COMPANY_REGISTER: `${API_BASE_URL}/company/company_register`,

  },
  WORKFLOW:{
    GET_WORKFLOWS:`${API_BASE_URL}/workflow/api/v1/get_workflows`,
    GET_ALL_COMPONENTS:`${API_BASE_URL}/workflow/api/v1/get_all_components`,
    ADD_WORKFLOWS:`${API_BASE_URL}/workflow/api/v1/add_workflows`,
    GET_WOKRFLOWS_VERSIONS:`${API_BASE_URL}/workflow/api/v1/getworkflowversioncontent`,
    EXECUTE_WORKFLOW_VERSION:`${API_BASE_URL}/workflow/api/v1/execute_workflow_version`,
    DELETE_WORKFLOW:`${API_BASE_URL}/workflow/api/v1/delete_workflow`,
    DELETE_WORKFLOW_VERSION:`${API_BASE_URL}/workflow/api/v1/delete_workflow_version`,
    PUBLISH_WORKFLOW:`${API_BASE_URL}/workflow/api/v1/publish`,
    CHANGE_LATEST_VERSION:`${API_BASE_URL}/workflow/api/v1/change_latest_version`
    },
  DOCUMENT: {
    UPLOAD_FILE: `${API_BASE_URL}/document/api/v1/upload_document`,
    GET_FILES: `${API_BASE_URL}/document/api/v1/get_documents`,
    GET_ALL_COMPONENTS: `${API_BASE_URL}/document/api/v1/get_all_components`,
  },
  META_COMPANY: {
    GET_MODELS: `${API_BASE_URL}/meta/api/v1/company/get_models`,
    GET_MODEL_PROVIDERS: `${API_BASE_URL}/meta/api/v1/company/get_model_providers`,
    GET_MODEL_CONFIG: `${API_BASE_URL}/meta/api/v1/company/get_model_config`,
    GET_PROVIDER_CONFIG: `${API_BASE_URL}/meta/api/v1/company/get_provider_config`,
    ADD_MODEL: `${API_BASE_URL}/meta/api/v1/company/add_model`,
    UPDATE_MODEL: `${API_BASE_URL}/meta/api/v1/company/update_model`,
    ADD_MODEL_PROVIDER: `${API_BASE_URL}/meta/api/v1/company/add_model_provider`,
    ADD_PROVIDER: `${API_BASE_URL}/meta/api/v1/company/add_provider`,
    UPDATE_PROVIDER: `${API_BASE_URL}/meta/api/v1/company/update_provider`,
  },
  KNOWLEDGE_BASE: {
    GET_KNOWLEDGE_BASE: `${API_BASE_URL}/knowledgebase/api/v1/get_kbs`,
  },
};

export { API_BASE_URL };