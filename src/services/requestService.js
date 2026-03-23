import apiClient from './api';

const requestService = {
  createRequest(data) {
    return apiClient.post('/v1/card-requests', data);
  },
  
  getMyRequests() {
    return apiClient.get('/v1/card-requests/me');
  },
  
  getPendingRequests() {
    return apiClient.get('/v1/card-requests/pending');
  },
  
  reviewRequest(id, data) {
    return apiClient.patch(`/v1/card-requests/${id}/review`, data);
  }
};

export default requestService;
