import { defineStore } from 'pinia'

const STORAGE_KEY = 'watchlist-card-ids'

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    cardIds: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  }),
  getters: {
    hasCard: (state) => (cardId) => state.cardIds.includes(cardId),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cardIds))
    },
    toggle(cardId) {
      if (this.cardIds.includes(cardId)) {
        this.cardIds = this.cardIds.filter((id) => id !== cardId)
      } else {
        this.cardIds = [cardId, ...this.cardIds]
      }
      this.persist()
    },
  },
})
