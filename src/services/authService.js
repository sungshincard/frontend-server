import apiClient from './api';

const authService = {
  login(email, password) {
    return apiClient.post('/v1/members/login', { email, password });
  },
  
  join(data) {
    return apiClient.post('/v1/members/join', data);
  },
  
  getMe() {
    return apiClient.get('/v1/members/me');
  },
  
  updateProfile(data) {
    return apiClient.patch('/v1/members/me', data);
  },
  
  getAddresses() {
    return apiClient.get('/v1/members/addresses');
  },
  
  addAddress(data) {
    return apiClient.post('/v1/members/addresses', data);
  },

  updateAddress(id, data) {
    return apiClient.put(`/v1/members/addresses/${id}`, data);
  },

  deleteAddress(id) {
    return apiClient.delete(`/v1/members/addresses/${id}`);
  },

  setDefaultAddress(id) {
    return apiClient.patch(`/v1/members/addresses/${id}/default`);
  }
};

export default authService;
