import apiClient from './api';

const notificationService = {
  getMyNotifications() {
    return apiClient.get('/v1/notifications/me');
  },
  
  getUnreadCount() {
    return apiClient.get('/v1/notifications/me/unread-count');
  },
  
  markAsRead(id) {
    return apiClient.patch(`/v1/notifications/${id}/read`);
  },
  
  markAllAsRead() {
    return apiClient.patch('/v1/notifications/me/read-all');
  },
  
  deleteNotification(id) {
    return apiClient.delete(`/v1/notifications/${id}`);
  }
};

export default notificationService;
