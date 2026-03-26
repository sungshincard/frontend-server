<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '../../services/productService'

const router = useRouter()
const watchlist = ref([])
const isLoading = ref(true)

const fetchWatchlist = async () => {
  try {
    isLoading.value = true
    const response = await productService.getMyWatchlist()
    watchlist.value = response.data
  } catch (error) {
    console.error('Failed to fetch watchlist:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchWatchlist)

const goCard = (id) => router.push(`/cards/${id}`)
</script>

<template>
  <div class="watchlist-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Collection</p>
        <h1>관심 상품</h1>
        <p>내가 찜한 카드 목록입니다.</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>관심 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="watchlist.length === 0" class="empty-state">
      <div class="empty-icon">❤️</div>
      <h3>관심 상품이 없습니다.</h3>
      <p>도감에서 마음에 드는 카드를 찜해 보세요!</p>
      <button type="button" class="primary-button" @click="router.push('/cards')">카드 보러가기</button>
    </div>

    <div v-else class="watchlist-grid">
      <article 
        v-for="card in watchlist" 
        :key="card.id" 
        class="card-item"
        @click="goCard(card.id)"
      >
        <div class="card-visual">
          <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.cardName" />
          <div v-else class="placeholder-art"></div>
        </div>
        <div class="card-info">
          <span class="set-name">{{ card.cardSetName }}</span>
          <strong>{{ card.cardName }}</strong>
          <div class="card-meta">
            <span>{{ card.rarity }}</span>
            <span class="price" v-if="card.lowestPrice">{{ card.lowestPrice.toLocaleString() }}원~</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.watchlist-page {
  padding: 0 0 60px;
}

.page-head {
  margin-bottom: 32px;
}

.eyebrow {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.page-head h1 {
  font-size: 32px;
  color: var(--color-text-strong);
  margin: 0 0 8px;
}

.page-head p {
  color: var(--color-text-muted);
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.card-item {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-soft);
  border-color: var(--color-primary);
}

.card-visual {
  aspect-ratio: 0.71;
  background: var(--color-panel-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-visual img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-name {
  font-size: 11px;
  color: var(--color-text-muted);
}

.card-info strong {
  font-size: 15px;
  color: var(--color-text-strong);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.card-meta span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.price {
  color: var(--color-primary) !important;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: grayscale(1);
  opacity: 0.3;
}

.primary-button {
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--color-primary);
  color: #2c2407;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
}
</style>
