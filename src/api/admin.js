import apiClient from '../services/api';

const adminApi = {
  // 카드 도감 등록
  createCardMaster(data) {
    return apiClient.post('/v1/card-masters', data);
  },
  
  // 향후 추가될 어드민 API들...
  getAdminStats() {
    return apiClient.get('/v1/admin/stats');
  }
};

export default adminApi;
