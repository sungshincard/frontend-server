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
  },

  prepareShipment(orderId) {
    return apiClient.post(`/v1/shipments/${orderId}/prepare`);
  },

  deliverShipment(orderId) {
    return apiClient.post(`/v1/shipments/${orderId}/deliver`);
  },

  // [테스트 전용] 주문 상태를 PAYMENT_COMPLETED → SHIPPING 으로 강제 변경
  forceShippingForTest(orderId) {
    return apiClient.post(`/v1/test/orders/${orderId}/shipping`);
  },

  // [테스트 전용] 주문 상태를 SHIPPING → DELIVERED 로 강제 변경
  forceDeliverForTest(orderId) {
    return apiClient.post(`/v1/test/orders/${orderId}/delivered`);
  },

  // [테스트 전용] 주문 상태를 DELIVERED → PURCHASE_CONFIRMED 로 강제 변경
  forceConfirmForTest(orderId) {
    return apiClient.post(`/v1/test/orders/${orderId}/confirm`);
  }
};

export default orderService;
