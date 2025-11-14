import { API_ENDPOINTS } from './endpoints';
import apiClient from './interceptor';

class DepartmentService {

 get_departments(compid) {
	return apiClient
		.get(API_ENDPOINTS.AUTH.GET_DEPARTMENTS,{params:{compid}})
		.then((response) => response)
		.catch((err) => {
			throw err;
		});
}

	
}
export default new DepartmentService();