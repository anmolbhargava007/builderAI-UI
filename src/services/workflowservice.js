import apiClient from './interceptor';
import { API_ENDPOINTS } from './endpoints';

class WorkFlowService {
	getAllWorkflow  = (compid) => {
        return apiClient
        .get(API_ENDPOINTS.WORKFLOW.GET_WORKFLOWS,{params:{compid:compid}})
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
  async add_Workflows(payload) {
    return apiClient
      .post(API_ENDPOINTS.WORKFLOW.ADD_WORKFLOWS, payload)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
   }
	getComponent =(compid,userid) => {
        return apiClient
        .get(API_ENDPOINTS.WORKFLOW.GET_ALL_COMPONENTS,{ params: { compid: compid,userid:userid } })
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
  getWorkflowVersions = (workflowid,workflowversionid) => {
        return apiClient
        .get(API_ENDPOINTS.WORKFLOW.GET_WOKRFLOWS_VERSIONS, { params: { workflowid: workflowid,workflowversionid:workflowversionid } })
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
  addExecuteWorkflowVersion = (payload) => {
        const config = {
        headers: { "content-type": "multipart/form-data" },
        };
        return apiClient
        .post(API_ENDPOINTS.WORKFLOW.EXECUTE_WORKFLOW_VERSION, payload,config)
        .then(response => {
          return response
        })
        .catch((err) => {
         throw err
        });
    } 
    deleteWorkflow = (payload) => {
        return apiClient
        .put(API_ENDPOINTS.WORKFLOW.DELETE_WORKFLOW, payload)
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
     delteWorkflowVerion = (payload) => {
        return apiClient
        .put(API_ENDPOINTS.WORKFLOW.DELETE_WORKFLOW_VERSION, payload)
        .then(response => {
          return response
        })
        .catch((err) => {
          console.log(err);
        });
    }
    publishWorkflow=(payload)=>{
      return apiClient
      .post(API_ENDPOINTS.WORKFLOW.PUBLISH_WORKFLOW,payload)
      .then(response=>{
        return response
      })
      .catch((err)=>{
        console.log(err)
      })
    }
    change_latest_version=(payload)=>{
      return apiClient
      .post(API_ENDPOINTS.WORKFLOW.CHANGE_LATEST_VERSION,payload)
      .then(response=>{
        return response
      })
      .catch((err)=>{
        console.log(err)
      })
    }
          
}
export default new WorkFlowService();