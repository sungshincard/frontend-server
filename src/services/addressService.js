import apiClient from './api';

const addressService = {
  getAddresses() {
    return apiClient.get('/v1/members/addresses');
  },
  
  createAddress(addressData) {
    return apiClient.post('/v1/members/addresses', addressData);
  },
  
  updateAddress(id, addressData) {
    return apiClient.put(`/v1/members/addresses/${id}`, addressData);
  },
  
  deleteAddress(id) {
    return apiClient.delete(`/v1/members/addresses/${id}`);
  },
  
  setDefaultAddress(id) {
    return apiClient.patch(`/v1/members/addresses/${id}/default`);
  }
};

export default addressService;
