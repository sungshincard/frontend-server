import apiClient from './api';

const orderService = {
  createOrder(orderData) {
    return apiClient.post('/v1/orders', orderData);
  },
  
  getOrder(orderId) {
    return apiClient.get(`/v1/orders/${orderId}`);
  },
  
  getPurchaseHistory() {
    return apiClient.get('/v1/orders/buy');
  },
  
  getSalesHistory() {
    return apiClient.get('/v1/orders/sell');
  },
  
  updateShipping(orderId, shippingData) {
    return apiClient.put(`/v1/orders/${orderId}/shipping`, null, {
      params: {
        carrier: shippingData.carrier,
        trackingNumber: shippingData.trackingNumber
      }
    });
  },
  
  cancelOrder(orderId, reason) {
    return apiClient.post(`/v1/orders/${orderId}/cancel`, null, {
      params: { reason }
    });
  },
  
  confirmOrder(orderId) {
    return apiClient.post(`/v1/orders/${orderId}/confirm`);
  }
};

export default orderService;
