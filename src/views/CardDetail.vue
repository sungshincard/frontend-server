<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardGroups, getCardsByGroupId, getStoreByName } from '../data/catalog'
import { useWatchlistStore } from '../stores/watchlist'
import productService from '../services/productService'
import { getImageUrl } from '../services/api'

const route = useRoute()
const router = useRouter()
const watchlistStore = useWatchlistStore()
const marketFilters = ['모든 상태', 'S', 'A', 'B', 'C', 'D']
const activeMarketFilter = ref('모든 상태')
const listings = ref([])
const card = ref(null)
const isLoading = ref(true)
const showPurchaseOverlay = ref(false)

const fetchCardDetail = async (id) => {
  try {
    isLoading.value = true
    const response = await productService.getCardDetail(id)
    console.log(response.data);
    card.value = response.data
    // Fetch listings for this card
    fetchListings()
  } catch (error) {
    console.error('Failed to fetch card detail:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchListings = async () => {
  if (!card.value) return
  try {
    const condition = activeMarketFilter.value === '모든 상태' ? null : activeMarketFilter.value
    const response = await productService.getSaleCardsByCardMaster(card.value.id, condition)
    listings.value = response.data
  } catch (error) {
    console.error('Failed to fetch listings:', error)
  }
}

const fetchRelatedCards = async (pokemonId) => {
  try {
    const response = await productService.searchCards({ pokemonId, size: 20 })
    // Filter out the current card
    relatedCards.value = response.data.content.filter(c => c.id !== card.value.id)
  } catch (error) {
    console.error('Failed to fetch related cards:', error)
  }
}

onMounted(() => {
  fetchCardDetail(route.params.cardId)
})

watch(() => route.params.cardId, (newId) => {
  if (newId) fetchCardDetail(newId)
})

watch(activeMarketFilter, fetchListings)

// const relatedCards = computed(() => {
//   // Still using mock related for now as per plan focus on Phase 3
//   if (!card.value || !card.value.groupId) return []
//   return getCardsByGroupId(card.value.groupId).filter((item) => item.id !== card.value.id)
// })

const relatedGroups = computed(() => {
  if (!card.value || !card.value.relatedGroups) return []
  return cardGroups.filter((group) => card.value.relatedGroups.includes(group.id))
})

const listingGallery = computed(() => listings.value)

const goCard = (cardId) => router.push(`/cards/${cardId}`)
const goSaleCardNew = () => router.push({ path: '/sale-cards/new', query: { cardId: card.value?.id } })
const openPurchaseOverlay = () => { showPurchaseOverlay.value = true }
const closePurchaseOverlay = () => { showPurchaseOverlay.value = false }
const goSaleCardDetail = (saleCardId) => router.push(`/sale-cards/${saleCardId}`)
const goStore = (seller) => {
  // If we have seller store ID in response, use it. For now, using mock.
  const store = getStoreByName(seller)
  if (store) router.push(`/stores/${store.id}`)
}

const toggleWatchlist = async () => {
  if (!card.value) return
  try {
    await productService.toggleWatchlist(card.value.id)
    // Manually toggle or refetch
    card.value.isWatched = !card.value.isWatched
    card.value.favoriteCount = card.value.isWatched 
      ? (card.value.favoriteCount || 0) + 1 
      : Math.max(0, (card.value.favoriteCount || 0) - 1)
  } catch (error) {
    console.error('Toggle watchlist failed:', error)
    alert('관심 등록 처리에 실패했습니다. 로그인이 필요할 수 있습니다.')
  }
}
const isWatched = computed(() => card.value?.isWatched || false)
const favoriteCount = computed(() => card.value?.favoriteCount || 0)

</script>

<template>
  <div v-if="isLoading" class="loading-state container">
    <p>데이터를 불러오는 중입니다...</p>
  </div>
  <div v-else-if="card" class="detail-page container">
    <section class="detail-hero">
      <div class="visual-column">
        <div class="main-visual artwork">
          <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.cardName" class="detail-card-image" />
          <div v-else class="phone-card" :class="card.pokemonCardType?.toLowerCase()">
            <div class="phone-card-head">
              <span>{{ card.cardName }}</span>
              <small v-if="card.pokemonCardType === 'POKEMON'">{{ card.hp }} HP</small>
            </div>
            <div class="phone-card-art"></div>
            <div class="phone-card-foot">
              <span>{{ card.pokemonCardType === 'POKEMON' ? (card.evolutionStage || '기본') : (card.subType || card.pokemonCardType) }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-column">
        <h1>{{ card.cardName }}</h1>

        <div class="spec-grid">
          <div><span>종류</span><strong>{{ card.categoryName || '정보 없음' }}</strong></div>
          <div v-if="card.elementalTypeName"><span>타입(속성)</span><strong>{{ card.elementalTypeName }}</strong></div>
          <template v-if="card.pokemonCardType === 'POKEMON'">
            <div><span>HP</span><strong>{{ card.hp }}</strong></div>
            <div><span>진화 단계</span><strong>{{ card.evolutionStage }}</strong></div>
          </template>
          <div><span>레어리티</span><strong>{{ card.rarity }}</strong></div>
          <div><span>언어</span><strong>{{ card.language }}</strong></div>
          <div><span>일러스트</span><strong>{{ card.illustrator }}</strong></div>
          <div><span>확장팩 넘버</span><strong>{{ card.expansionCode }}</strong></div>
          <div><span>블록</span><strong>{{ card.block }}</strong></div>
        </div>

        <div class="price-panel">
          <div>
            <span>현재 최저가</span>
            <strong>{{ card.lowestPrice?.toLocaleString() || '-' }}원</strong>
          </div>
          <div>
            <span>현재 최고가</span>
            <strong>{{ card.highestPrice?.toLocaleString() || '-' }}원</strong>
          </div>
          <div>
            <span>최근 거래가</span>
            <strong>{{ card.recentTradePrice?.toLocaleString() || '-' }}원</strong>
          </div>
          <div>
            <span>평균 거래가</span>
            <strong>{{ card.averagePrice ? Math.round(card.averagePrice).toLocaleString() : '-' }}원</strong>
          </div>
          <div>
            <span>현재 출품 수</span>
            <strong>{{ card.activeListingCount || 0 }}개</strong>
          </div>
        </div>

      </div>
    </section>

    <section class="controls-section">
      <div class="hero-controls">
        <div class="market-filter-row">
          <button
            v-for="filter in marketFilters"
            :key="filter"
            type="button"
            class="market-filter-chip"
            :class="{ active: activeMarketFilter === filter }"
            @click="activeMarketFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <div class="action-row">
          <button type="button" class="primary" @click="openPurchaseOverlay">구매하기</button>
          <button type="button" class="secondary" @click="goSaleCardNew">출품하기</button>
          <button type="button" class="tertiary" @click="toggleWatchlist">
            <span class="heart-icon" :class="{ active: isWatched }">❤️</span>
            {{ isWatched ? '관심 해제' : '관심 등록' }}
            <small v-if="favoriteCount > 0">{{ favoriteCount }}</small>
          </button>
        </div>
      </div>
    </section>
    
    <section class="detail-grid lower single-column">
      <article class="detail-card chart-card">
        <div class="chart-trade-layout">
          <div class="chart-box">
            <div class="chart-line"></div>
            <div class="chart-line secondary"></div>
          </div>
          <aside class="trade-side-panel">
            <div class="section-head compact">
              <div>
                <p class="eyebrow">Trades</p>
                <h2>최근 거래 이력</h2>
              </div>
            </div>
            <div class="trade-list">
              <div v-for="item in card.trades" :key="`${item.date}-${item.price}`" class="trade-row">
                <div>
                  <strong>{{ item.date }}</strong>
                  <span>{{ item.spec }}</span>
                </div>
                <strong>{{ item.price }}</strong>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </section>

    <section class="detail-grid top-split">
      <article class="detail-card">
        <div class="section-head">
          <div>
            <h2>출품 목록</h2>
          </div>
        </div>
        <div class="listing-gallery">
          <article
            v-for="item in listingGallery"
            :key="item.id"
            class="listing-card"
            role="button"
            tabindex="0"
            @click="goSaleCardDetail(item.id)"
          >
            <div class="listing-image">
              <img v-if="item.imageUrls && item.imageUrls.length > 0" :src="getImageUrl(item.imageUrls[0])" :alt="item.title" />
              <div v-else class="no-img-placeholder">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16L8.586 11.414C8.961 11.039 9.47 10.828 10 10.828C10.53 10.828 11.039 11.039 11.414 11.414L15 15M14 14L15.586 12.414C15.961 12.039 16.47 11.828 17 11.828C17.53 11.828 18.039 12.039 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>No Image</span>
              </div>
              <strong class="listing-price-overlay">{{ item.price?.toLocaleString() }}원</strong>
              <span class="listing-grade-overlay">{{ item.conditionGrade }} 등급</span>
            </div>
            <div class="listing-copy">
              <strong>{{ item.title }}</strong>
              <p>
                {{ item.sellerNickname }}
                · {{ item.conditionGrade }} 등급
              </p>
              <span>{{ new Date(item.createdAt).toLocaleDateString() }}</span>
            </div>
          </article>
        </div>
      </article>
    </section>

    <div v-if="showPurchaseOverlay" class="purchase-overlay" @click.self="closePurchaseOverlay">
      <div class="purchase-sheet">
        <div class="overlay-head">
          <div>
            <p class="eyebrow">Listings</p>
            <h2>구매할 출품을 선택하세요</h2>
            <span>{{ card.cardName }}에 등록된 판매 상품 중 하나를 먼저 선택합니다.</span>
          </div>
          <button type="button" class="overlay-close" @click="closePurchaseOverlay">닫기</button>
        </div>

        <div class="overlay-list-grid">
          <article
            v-for="item in listingGallery"
            :key="item.id"
            class="overlay-listing-card"
          >
            <div class="overlay-image">
              <img v-if="item.imageUrls && item.imageUrls.length > 0" :src="getImageUrl(item.imageUrls[0])" :alt="item.title" />
              <div v-else class="no-img-placeholder">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16L8.586 11.414C8.961 11.039 9.47 10.828 10 10.828C10.53 10.828 11.039 11.039 11.414 11.414L15 15M14 14L15.586 12.414C15.961 12.039 16.47 11.828 17 11.828C17.53 11.828 18.039 12.039 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="overlay-copy">
              <strong>{{ item.title }}</strong>
              <p>{{ item.seller }} · {{ item.conditionGrade }} 등급</p>
              <small>{{ item.description }}</small>
              <div class="overlay-meta">
                <span>상태 {{ item.status }}</span>
                <span>관심 {{ item.favoriteCount }}</span>
              </div>
            </div>
            <div class="overlay-action">
              <strong>{{ item.price }}</strong>
              <button type="button" class="overlay-select" @click="goSaleCardDetail(item.id)">이 출품 보기</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  padding: 80px 0 80px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
  gap: 40px;
  margin-bottom: 24px;
  align-items: stretch;
}

.detail-hero.mobile-shell {
  max-width: 520px;
  margin: 0 auto;
  grid-template-columns: 1fr;
}

.visual-column,
.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-visual {
  width: 100%;
  aspect-ratio: 0.71;
  background: #f8f8f8;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-card-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
}

.phone-card {
  width: min(100%, 280px);
  aspect-ratio: 0.71;
  padding: 16px;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
}

.phone-card-head,
.phone-card-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-weight: 700;
  font-size: 12px;
}

.phone-card-art {
  flex: 1;
  margin: 12px 0;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
}

.thumb-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.thumb-box {
  aspect-ratio: 1;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-subtle);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.info-column h1 {
  margin: 0 0 24px;
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text-strong);
  line-height: 1.1;
}

.summary {
  color: var(--color-text-muted);
  font-size: 14px;
  margin-bottom: 24px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.spec-grid div {
  padding: 12px 16px;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.spec-grid > div {
  display: grid;
  grid-template-columns: 100px 1fr;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}

.spec-grid span {
  background: var(--color-panel-soft);
  padding: 12px;
  font-size: 13px;
  color: var(--color-text-subtle);
  font-weight: 600;
  border-right: 1px solid var(--color-border);
}

.spec-grid strong {
  padding: 12px;
  font-size: 13px;
  color: var(--color-text-strong);
  font-weight: 700;
}

.price-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 24px 0;
  border-top: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.price-panel div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.price-panel span {
  font-size: 13px;
  color: var(--color-text-subtle);
}

.price-panel strong {
  font-size: 16px;
  color: var(--color-text-strong);
  font-weight: 700;
}

.hero-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.controls-section {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}

.action-row {
  display: flex;
  gap: 12px;
}

.action-row button {
  padding: 16px 20px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
  transition: opacity var(--transition-fast);
  white-space: nowrap;
  flex: 1;
}

.action-row .primary {
  flex: 2.2;
  background: var(--color-text-strong);
  color: var(--color-background);
  border: 1px solid var(--color-text-strong);
}

.action-row .secondary {
  flex: 1;
  background: var(--color-background);
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
}

.action-row .tertiary {
  flex: 1;
  background: var(--color-background);
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.heart-icon {
  filter: grayscale(1);
  transition: transform 0.2s;
}

.heart-icon.active {
  filter: grayscale(0);
  transform: scale(1.2);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
  margin-top: 24px;
}

.detail-grid.top-split {
  grid-template-columns: 1fr;
}

.detail-grid.single-column {
  grid-template-columns: 1fr;
}

.section-head h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 12px;
  display: inline-block;
}

.section-head.compact h2 {
  margin-bottom: 8px;
}

.listing-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.listing-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.listing-image {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  aspect-ratio: 1;
}

.no-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background-elevated);
  color: var(--color-text-subtle);
  gap: 8px;
}

.no-img-placeholder svg {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.no-img-placeholder span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-price-overlay,
.listing-grade-overlay {
  position: absolute;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(24, 24, 27, 0.82);
  color: var(--color-primary-text);
  font-size: 13px;
  font-weight: 700;
}

.listing-price-overlay {
  left: 12px;
}

.listing-grade-overlay {
  right: 12px;
}

.listing-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.listing-copy strong {
  font-size: 14px;
  color: var(--color-text-strong);
}

.listing-copy p,
.listing-copy span {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-subtle);
}

.seller-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-weight: 700;
}

.market-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.market-filter-chip {
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.market-filter-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-background-elevated);
}

.chart-trade-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.35fr) minmax(300px, 0.85fr);
  gap: 20px;
}

.chart-box {
  width: 100%;
  min-height: 340px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  position: relative;
}

.trade-side-panel {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 18px 18px 6px;
  background: var(--color-background-elevated);
}

.trade-list {
  display: flex;
  flex-direction: column;
}

.trade-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.trade-row div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trade-row strong {
  color: var(--color-text-strong);
  font-weight: 700;
}

.trade-row span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.trade-row span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.purchase-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(10, 10, 10, 0.66);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.purchase-sheet {
  width: min(1120px, 100%);
  max-height: 86vh;
  overflow: auto;
  border-radius: 28px;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
  padding: 26px;
}

.overlay-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  margin-bottom: 22px;
}

.overlay-head h2 {
  margin: 0 0 8px;
  color: var(--color-text-strong);
}

.overlay-head span,
.overlay-copy p,
.overlay-copy small,
.overlay-meta span {
  color: var(--color-text-muted);
}

.overlay-close {
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  border-radius: 999px;
  padding: 10px 16px;
}

.overlay-list-grid {
  display: grid;
  gap: 16px;
}

.overlay-listing-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 180px;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  background: var(--color-background-elevated);
}

.overlay-image {
  overflow: hidden;
  border-radius: 18px;
  background: var(--color-panel-soft);
}

.overlay-image img {
  width: 100%;
  height: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
}

.overlay-copy {
  display: grid;
  align-content: start;
  gap: 8px;
}

.overlay-copy strong,
.overlay-action strong {
  color: var(--color-text-strong);
}

.overlay-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.overlay-action {
  display: grid;
  align-content: space-between;
  justify-items: end;
  gap: 12px;
}

.overlay-action strong {
  font-size: 1.3rem;
}

.overlay-select {
  width: 100%;
  padding: 14px 18px;
  border: 0;
  border-radius: 16px;
  background: var(--color-primary);
  color: #2c2407;
  font-weight: 800;
}

@media (max-width: 768px) {
  .hero-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .action-row {
    grid-template-columns: 1fr 1fr;
  }

  .detail-hero,
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .listing-gallery,
  .chart-trade-layout {
    grid-template-columns: 1fr;
  }

  .related-grid-cards {
    grid-template-columns: 1fr;
  }

  .overlay-listing-card {
    grid-template-columns: 1fr;
  }

  .overlay-action {
    justify-items: stretch;
  }
}
</style>
