<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cards, storeReviews } from '../data/catalog'
import apiClient from '../services/api'

const route = useRoute()
const router = useRouter()

const dbStore = ref(null)

const fetchStore = async () => {
  try {
    const res = await apiClient.get(`/stores/${route.params.storeId}`)
    dbStore.value = res.data
  } catch (error) {
    console.error('상점 정보를 불러오지 못했습니다.', error)
  }
}

onMounted(() => {
  fetchStore()
})

const store = computed(() => {
  return dbStore.value ? {
    id: dbStore.value.id,
    name: dbStore.value.storeName,
    intro: dbStore.value.intro || '등록된 상점 소개가 없습니다.',
    rating: dbStore.value.ratingAvg?.toFixed(1) || '0.0',
    reviews: dbStore.value.reviewCount || 0,
    sales: dbStore.value.completedSaleCount || 0,
    badges: ['인증회원']
  } : null
})

const storeListings = computed(() => {
  if (!store.value) return []
  return cards.flatMap((card) =>
    card.listings
      .filter((listing) => listing.seller === store.value.name)
      .map((listing) => ({ ...listing, card })),
  )
})

const reviews = computed(() => storeReviews[store.value?.id] || [])
const ratingSummary = computed(() => {
  if (!reviews.value.length) return { average: '0.0', count: 0 }
  const total = reviews.value.reduce((sum, item) => sum + item.rating, 0)
  return {
    average: (total / reviews.value.length).toFixed(1),
    count: reviews.value.length,
  }
})

const goListing = (listingId) => router.push(`/listings/${listingId}`)
</script>

<template>
  <div v-if="store" class="store-page container">
    <section class="store-hero">
      <div class="store-mark">{{ store.name.charAt(0) }}</div>
      <div class="store-copy">
        <p class="eyebrow">Store</p>
        <h1>{{ store.name }}</h1>
        <p>{{ store.intro }}</p>
        <div class="store-stats">
          <article><span>평점</span><strong>{{ store.rating }}</strong></article>
          <article><span>후기 수</span><strong>{{ store.reviews }}</strong></article>
          <article><span>판매 완료</span><strong>{{ store.sales }}</strong></article>
          <article><span>판매 중</span><strong>{{ storeListings.length }}</strong></article>
        </div>
        <div class="badge-row">
          <span v-for="badge in store.badges" :key="badge">{{ badge }}</span>
        </div>
      </div>
    </section>

    <section class="store-section">
      <div class="section-head">
        <h2>판매 중 상품</h2>
        <span>{{ storeListings.length }}개</span>
      </div>
      <div class="store-grid">
        <article
          v-for="item in storeListings"
          :key="item.id"
          class="store-listing-card"
          role="button"
          tabindex="0"
          @click="goListing(item.id)"
        >
          <div class="store-image">
            <img :src="item.imageUrl" :alt="item.title">
          </div>
          <div class="store-listing-copy">
            <strong>{{ item.title }}</strong>
            <span>{{ item.card.setName }} · {{ item.condition }} · {{ item.grading }}</span>
            <small>{{ item.price }}</small>
          </div>
        </article>
      </div>
    </section>

    <section class="store-section">
      <div class="section-head">
        <h2>후기 / 리뷰</h2>
        <span>{{ ratingSummary.count }}개 · 평균 {{ ratingSummary.average }}</span>
      </div>

      <div class="review-summary">
        <article>
          <span>평균 평점</span>
          <strong>{{ ratingSummary.average }}</strong>
        </article>
        <article>
          <span>후기 수</span>
          <strong>{{ ratingSummary.count }}</strong>
        </article>
        <article>
          <span>거래 완료</span>
          <strong>{{ store.sales }}</strong>
        </article>
      </div>

      <div class="review-list">
        <article v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-head">
            <strong>{{ review.reviewer }}</strong>
            <span>{{ review.createdAt }}</span>
          </div>
          <div class="review-stars">
            <span v-for="star in 5" :key="star" :class="{ active: star <= review.rating }">★</span>
          </div>
          <p>{{ review.content }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.store-page {
  padding: 40px 0 80px;
  display: grid;
  gap: 24px;
}

.store-hero,
.store-section {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.store-hero {
  padding: 28px;
  display: flex;
  gap: 22px;
}

.store-mark {
  width: 86px;
  height: 86px;
  border-radius: 26px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: #2c2407;
  font-size: 2rem;
  font-weight: 900;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.store-copy h1,
.section-head h2,
.store-listing-copy strong,
.store-stats strong {
  color: var(--color-text-strong);
}

.store-copy p,
.store-listing-copy span,
.store-listing-copy small,
.store-stats span,
.section-head span {
  color: var(--color-text-muted);
}

.store-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.store-stats article {
  padding: 14px;
  border-radius: 16px;
  background: var(--color-background-elevated);
  display: grid;
  gap: 4px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.badge-row span {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-weight: 700;
}

.store-section {
  padding: 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.store-listing-card {
  padding: 16px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  display: grid;
  gap: 12px;
  cursor: pointer;
}

.store-image {
  overflow: hidden;
  border-radius: 16px;
}

.store-image img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
}

.store-listing-copy {
  display: grid;
  gap: 6px;
}

.review-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.review-summary article,
.review-card {
  padding: 16px;
  border-radius: 18px;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
}

.review-summary span,
.review-head span,
.review-card p {
  color: var(--color-text-muted);
}

.review-summary strong,
.review-head strong {
  color: var(--color-text-strong);
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.review-stars {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  color: #d1d5db;
}

.review-stars .active {
  color: var(--color-primary);
}

@media (max-width: 960px) {
  .store-hero,
  .store-stats,
  .store-grid,
  .review-summary {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
