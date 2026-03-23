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
  getPokemons() {
    return apiClient.get('/v1/pokemons');
  },
  
  getPokemonDetail(id) {
    return apiClient.get(`/v1/pokemons/${id}`);
  },
  
  // Metadata APIs
  getCardMetadata() {
    return apiClient.get('/v1/metadata/cards');
  }
};

export default productService;
