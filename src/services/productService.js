import apiClient from './api';

const productService = {
  // Card Master APIs
  searchCards(params) {
    return apiClient.get('/v1/card-masters/search', { params });
  },
  
  getCardDetail(id) {
    return apiClient.get(`/v1/card-masters/${id}`);
  },

  getRecentCards() {
    return apiClient.get('/v1/card-masters/recent');
  },
  
  // Pokemon APIs
  getPokemons(params = {}) {
    return apiClient.get('/v1/pokemons', { params });
  },
  
  getPokemonDetail(id) {
    return apiClient.get(`/v1/pokemons/${id}`);
  },
  
  // Metadata APIs
  getMetadata(gameType = 'POKEMON') {
    return apiClient.get('/v1/metadata/cards', { params: { gameType } });
  },
  // SaleCard APIs
  getSaleCardsByCardMaster(cardMasterId, conditionGrade) {
    const params = conditionGrade ? { conditionGrade } : {};
    return apiClient.get(`/v1/sale-cards/card-master/${cardMasterId}`, { params });
  },

  getSaleCardDetail(id) {
    return apiClient.get(`/v1/sale-cards/${id}`);
  },

  getRecentSaleCards() {
    return apiClient.get('/v1/sale-cards/recent');
  },
  
  getMySaleCards() {
    return apiClient.get('/v1/sale-cards/me');
  },

  createSaleCard(data) {
    return apiClient.post('/v1/sale-cards', data);
  },

  updateSaleCard(id, data) {
    return apiClient.put(`/v1/sale-cards/${id}`, data);
  },

  updateSaleCardStatus(id, status) {
    return apiClient.patch(`/v1/sale-cards/${id}/status`, null, { params: { status } });
  },

  // Image Upload API
  uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return apiClient.post('/v1/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Watchlist (Favorite) APIs
  toggleWatchlist(cardMasterId) {
    return apiClient.post(`/v1/watchlist/toggle/${cardMasterId}`);
  },

  checkWatchlist(cardMasterId) {
    return apiClient.get(`/v1/watchlist/check/${cardMasterId}`);
  },

  getMyWatchlist() {
    return apiClient.get('/v1/watchlist/me');
  }
};

export default productService;
