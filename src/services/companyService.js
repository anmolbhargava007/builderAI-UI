import { API_ENDPOINTS } from './endpoints';
import apiClient from './interceptor';

class CompanyService {

 company_register(payload) {
	return apiClient
		.post(API_ENDPOINTS.AUTH.REGISTER, payload)
		.then((response) => response)
		.catch((err) => {
			throw err;
		});
}

	
}
export default new CompanyService();