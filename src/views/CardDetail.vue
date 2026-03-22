<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardGroups, getCardById, getCardsByGroupId, getStoreByName } from '../data/catalog'
import { useWatchlistStore } from '../stores/watchlist'

const route = useRoute()
const router = useRouter()
const watchlistStore = useWatchlistStore()
const marketFilters = ['모든 상태', 'A', 'B', 'C', 'D', 'PSA10', 'PSA9', 'PSA8 이하', 'BGS10 BL', 'BGS10 G']
const activeMarketFilter = ref('모든 상태')
const showPurchaseOverlay = ref(false)

const card = computed(() => getCardById(route.params.cardId))

const relatedCards = computed(() => {
  if (!card.value) return []
  return getCardsByGroupId(card.value.groupId).filter((item) => item.id !== card.value.id)
})

const relatedGroups = computed(() => {
  if (!card.value) return []
  return cardGroups.filter((group) => card.value.relatedGroups.includes(group.id))
})

const listingGallery = computed(() => {
  if (!card.value) return []

  return card.value.listings
})

const goCard = (cardId) => router.push(`/cards/${cardId}`)
const goGroup = (groupId) => router.push(`/cards/group/${groupId}`)
const goListingNew = () => router.push({ path: '/listings/new', query: { cardId: card.value?.id } })
const openPurchaseOverlay = () => { showPurchaseOverlay.value = true }
const closePurchaseOverlay = () => { showPurchaseOverlay.value = false }
const goListingDetail = (listingId) => router.push(`/listings/${listingId}`)
const goStore = (seller) => {
  const store = getStoreByName(seller)
  if (store) router.push(`/stores/${store.id}`)
}
const toggleWatchlist = () => {
  if (!card.value) return
  watchlistStore.toggle(card.value.id)
}
const isWatched = computed(() => (card.value ? watchlistStore.hasCard(card.value.id) : false))
const gradingLabel = (listing) => {
  if (listing.gradingCompany === 'NONE') return '미감정'
  return listing.gradingScore ? `${listing.gradingCompany} ${listing.gradingScore}` : listing.gradingCompany
}
</script>

<template>
  <div v-if="card" class="detail-page container">
    <section class="detail-hero mobile-shell">
      <div class="visual-column">
        <div class="main-visual artwork">
          <div class="phone-card">
            <div class="phone-card-head">
              <span>{{ card.name }}</span>
              <small>{{ card.hp }}</small>
            </div>
            <div class="phone-card-art"></div>
            <div class="phone-card-foot">
              <span>{{ card.type }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-column">
        <p class="eyebrow">{{ card.setName }}</p>
        <h1>{{ card.name }}</h1>
        <p class="summary">{{ card.summary }}</p>

        <div class="spec-grid">
          <div><span>레어리티</span><strong>{{ card.rarity }}</strong></div>
          <div><span>언어</span><strong>{{ card.language }}</strong></div>
          <div><span>타입</span><strong>{{ card.type }}</strong></div>
          <div><span>HP</span><strong>{{ card.hp }}</strong></div>
          <div><span>약점</span><strong>{{ card.weakness }}</strong></div>
          <div><span>진화 단계</span><strong>{{ card.stage }}</strong></div>
        </div>

        <div class="price-panel">
          <div>
            <span>현재 최저가</span>
            <strong>{{ card.lowestPrice }}</strong>
          </div>
          <div>
            <span>최근 거래가</span>
            <strong>{{ card.recentPrice }}</strong>
          </div>
          <div>
            <span>평균 거래가</span>
            <strong>{{ card.averagePrice }}</strong>
          </div>
          <div>
            <span>출품 수</span>
            <strong>{{ card.listingCount }}개</strong>
          </div>
        </div>

        <div class="action-row">
          <button type="button" class="primary" @click="openPurchaseOverlay">구매하기</button>
          <button type="button" class="secondary" @click="goListingNew">출품하기</button>
          <button type="button" class="tertiary" @click="toggleWatchlist">
            {{ isWatched ? '관심 해제' : '관심 등록' }}
          </button>
        </div>
      </div>
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
            :key="`${item.seller}-${item.price}`"
            class="listing-card"
            role="button"
            tabindex="0"
            @click="goListingDetail(item.id)"
          >
            <div class="listing-image">
              <img :src="item.imageUrl" :alt="item.seller" />
              <strong class="listing-price-overlay">{{ item.price }}</strong>
              <span class="listing-grade-overlay">{{ gradingLabel(item) }}</span>
            </div>
            <div class="listing-copy">
              <strong>{{ item.seller }}</strong>
              <p>
                <button type="button" class="seller-link" @click.stop="goStore(item.seller)">
                  {{ item.seller }}
                </button>
                · {{ item.conditionGrade }} 등급
              </p>
              <span>{{ item.date }}</span>
            </div>
          </article>
        </div>
      </article>
    </section>

    <section class="detail-grid lower single-column">
      <article class="detail-card chart-card">
        <div class="section-head">
          <div>
            <h2>매매 시세</h2>
          </div>
        </div>
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

    <section class="detail-grid lower single-column">
      <article class="detail-card">
        <div class="section-head">
          <div>
            <h2>같은 카드군의 다른 버전</h2>
          </div>
        </div>
        <div class="related-grid related-grid-cards">
          <button v-for="item in relatedCards" :key="item.id" type="button" class="related-card" @click="goCard(item.id)">
            <strong>{{ item.name }}</strong>
            <span>{{ item.setName }}</span>
            <small>{{ item.lowestPrice }}</small>
          </button>
        </div>
      </article>

      <article class="detail-card">
        <div class="section-head">
          <div>
            <h2>관련 카드군</h2>
          </div>
        </div>
        <div class="related-grid">
          <button v-for="item in relatedGroups" :key="item.id" type="button" class="related-card" @click="goGroup(item.id)">
            <strong>{{ item.name }}</strong>
            <span>{{ item.subtitle }}</span>
            <small>{{ item.cardCount }}개 카드</small>
          </button>
        </div>
      </article>
    </section>

    <div v-if="showPurchaseOverlay" class="purchase-overlay" @click.self="closePurchaseOverlay">
      <div class="purchase-sheet">
        <div class="overlay-head">
          <div>
            <p class="eyebrow">Listings</p>
            <h2>구매할 출품을 선택하세요</h2>
            <span>{{ card.name }}에 등록된 판매 상품 중 하나를 먼저 선택합니다.</span>
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
              <img :src="item.imageUrl" :alt="item.title">
            </div>
            <div class="overlay-copy">
              <strong>{{ item.title }}</strong>
              <p>{{ item.seller }} · {{ item.conditionGrade }} · {{ gradingLabel(item) }}</p>
              <small>{{ item.description }}</small>
              <div class="overlay-meta">
                <span>상태 {{ item.status }}</span>
                <span>관심 {{ item.favoriteCount }}</span>
              </div>
            </div>
            <div class="overlay-action">
              <strong>{{ item.price }}</strong>
              <button type="button" class="overlay-select" @click="goListingDetail(item.id)">이 출품 보기</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  padding: 40px 0 80px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
  gap: 40px;
  margin-bottom: 40px;
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
  aspect-ratio: 1;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.4;
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

.spec-grid span {
  font-size: 12px;
  color: var(--color-text-subtle);
}

.spec-grid strong {
  font-size: 14px;
  color: var(--color-text-strong);
}

.price-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.price-panel div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-panel span {
  font-size: 14px;
  color: var(--color-text-subtle);
}

.price-panel strong {
  font-size: 18px;
  color: var(--color-text-strong);
  font-weight: 700;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-row button {
  padding: 16px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  transition: opacity var(--transition-fast);
}

.action-row button:hover {
  opacity: 0.8;
}

.action-row .primary {
  grid-column: span 2;
  background: var(--color-primary);
  color: var(--color-background-elevated);
  border: 1px solid var(--color-primary);
}

.action-row .secondary {
  background: var(--color-background-elevated);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.action-row .tertiary {
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
  margin-top: 60px;
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
  gap: 10px;
  margin-bottom: 18px;
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

.related-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.related-grid-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.related-card {
  min-height: 148px;
  padding: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  transition: border-color var(--transition-fast);
}

.related-card:hover {
  border-color: var(--color-primary);
}

.related-card strong {
  font-size: 14px;
  color: var(--color-text-strong);
}

.related-card span,
.related-card small {
  font-size: 12px;
  color: var(--color-text-subtle);
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

@media (max-width: 900px) {
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
