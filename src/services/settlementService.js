import apiClient from '@/services/api'

const settlementService = {
  getMySettlements() {
    return apiClient.get('/v1/settlements/me')
  }
}

export default settlementService
