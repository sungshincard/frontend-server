import apiClient from './api';

const productService = {
  // Card Master APIs
  searchCards(params) {
    return apiClient.get('/v1/card-masters/search', { params });
  },
  
  getCardDetail(id) {
    return apiClient.get(`/v1/card-masters/${id}`);
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
  }
};

export default productService;
