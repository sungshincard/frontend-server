<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/services/productService'
import { getImageUrl } from '@/services/api'

const router = useRouter()

const slides = [
  {
    title: '스칼렛&바이올렛 하이라이트',
    subtitle: '신규 세트 · 인기 카드 · 빠른 거래 진입',
    description: '이번 주 주목받는 카드와 새로 등록된 출품을 메인에서 바로 확인합니다.',
  },
  {
    title: '신규 세트 프리뷰',
    subtitle: '출시 예정 카드와 미리 보는 희귀 카드',
    description: '출시 예정 상품과 사전 관심 카드 흐름을 홈에서 분리해 보여줍니다.',
  },
]

const currentSlide = ref(0)
const recentSaleCards = ref([])
const newCards = ref([])
const trendingCards = ref([])
const loading = ref(true)

const collections = computed(() => [
  { title: '새로 출품된 카드', items: recentSaleCards.value, type: 'sale' },
  { title: '새로 등록된 카드', items: newCards.value, type: 'master' },
])

const spotlightItems = computed(() =>
  trendingCards.value.map((item) => ({
    ...item,
    label: '현재 주목받는 카드',
  }))
)

onMounted(async () => {
  try {
    const [saleRes, masterRes] = await Promise.all([
      productService.getRecentSaleCards(),
      productService.getRecentCards()
    ]);
    
    recentSaleCards.value = saleRes.data || [];
    console.log(recentSaleCards.value);
    newCards.value = masterRes.data || [];
    
    // For spotlight, let's just use first 3 new cards if trending is not separate
    trendingCards.value = (newCards.value || []).slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch home data:', error);
  } finally {
    loading.value = false;
  }
})

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const goCards = () => router.push('/cards')
const goCardDetail = (id) => router.push(`/cards/${id}`)
const goSaleDetail = (id) => router.push(`/sale-cards/${id}`)
const activeSlide = computed(() => slides[currentSlide.value])
</script>

<template>
  <div class="home-page">
    <section class="hero-slider container">
      <button type="button" class="slider-arrow left" @click="prevSlide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="slider-stage">
        <div class="slider-copy">
          <p class="eyebrow">Pokemon Card Marketplace</p>
          <h1>{{ activeSlide.title }}</h1>
          <strong>{{ activeSlide.subtitle }}</strong>
          <p>{{ activeSlide.description }}</p>
          <button type="button" class="hero-button" @click="goCards">바로 보기</button>
        </div>

        <div class="slider-visual">
          <div class="visual-card tall dark"></div>
          <div class="visual-card shirt"></div>
          <div class="visual-card jacket"></div>
          <div class="visual-card shoes"></div>
        </div>
      </div>

      <button type="button" class="slider-arrow right" @click="nextSlide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div class="slider-indicator">{{ currentSlide + 1 }}/{{ slides.length }}</div>
    </section>

    <section class="spotlight-wrap">
      <div class="container spotlight-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Spotlight</p>
            <h2>현재 주목받는 카드</h2>
          </div>
        </div>

        <div v-if="loading" class="loading-placeholder">로딩 중...</div>
        <div v-else class="spotlight-grid">
          <article 
            v-for="item in spotlightItems" 
            :key="item.id" 
            class="spotlight-card"
            @click="goCardDetail(item.id)"
          >
            <div class="spotlight-art">
              <img v-if="item.imageUrl" :src="getImageUrl(item.imageUrl)" :alt="item.cardName">
            </div>
            <strong>{{ item.cardName }}</strong>
            <span class="rarity">{{ item.rarity }}</span>
          </article>
        </div>
      </div>
    </section>

    <section class="collection-section container">
      <article v-for="section in collections" :key="section.title" class="collection-card">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">Collection</p>
            <h2>{{ section.title }}</h2>
          </div>
        </div>

        <div v-if="loading" class="loading-placeholder">로딩 중...</div>
        <div v-else class="product-row">
          <button
            v-for="item in section.items"
            :key="item.id"
            type="button"
            class="product-card"
            @click="section.type === 'sale' ? goSaleDetail(item.id) : goCardDetail(item.id)"
          >
            <div class="product-art">
              <!-- If it's a SaleCard, it might have its own images or use CardMaster's -->
              <img v-if="section.type === 'sale'" :src="getImageUrl(item.imageUrls?.[0] || item.cardMaster?.imageUrl)" :alt="item.title">
              <img v-else :src="getImageUrl(item.imageUrl)" :alt="item.cardName">
            </div>
            <strong>{{ section.type === 'sale' ? item.title : item.cardName }}</strong>
            <span v-if="section.type === 'sale'" class="price">{{ item.price?.toLocaleString() }}원</span>
            <span v-else class="rarity">{{ item.rarity }}</span>
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 40px 0 80px;
}

.hero-slider,
.spotlight-section,
.collection-card {
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  margin-bottom: 40px;
}

.hero-slider {
  position: relative;
  overflow: hidden;
  padding: 60px 80px;
  background: var(--color-background-elevated);
}

.slider-stage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 400px;
}

.slider-copy {
  max-width: 500px;
}

.slider-copy h1,
.section-head h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.slider-copy h1 {
  font-size: 42px;
  line-height: 1.1;
  margin-bottom: 16px;
  font-weight: 700;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.slider-copy strong {
  display: block;
  margin-bottom: 12px;
  color: var(--color-text-strong);
  font-size: 18px;
}

.slider-copy p,
.product-card span {
  color: var(--color-text-muted);
}

.hero-button {
  margin-top: 24px;
  padding: 16px 24px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-background-elevated);
  font-weight: 700;
  font-size: 14px;
}

.slider-visual {
  position: relative;
  width: 400px;
  height: 400px;
}

.visual-card {
  position: absolute;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

.visual-card.tall {
  top: 20px; left: 10%; width: 30%; height: 80%;
}
.visual-card.shirt {
  top: 0; left: 45%; width: 30%; height: 90%; background: #e0e0e0;
}
.visual-card.jacket {
  top: 40px; right: 0; width: 30%; height: 75%;
}
.visual-card.shoes {
  bottom: 0; left: 30%; width: 40%; height: 30%; background: var(--color-panel);
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-panel-soft);
  border: none;
  color: var(--color-text-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease, transform 0.2s ease;
}

.slider-arrow:hover {
  background: var(--color-border);
  transform: translateY(-50%) scale(1.05);
}

.slider-arrow.left { left: 24px; }
.slider-arrow.right { right: 24px; }

.slider-indicator {
  position: absolute;
  right: 24px;
  bottom: 24px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.spotlight-wrap,
.collection-section {
  margin-top: 40px;
}

.collection-section {
  display: grid;
  gap: 40px;
}

.collection-card {
  padding: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
}

.spotlight-section {
  padding: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
}

.section-head h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-primary);
  display: inline-block;
}

.spotlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.product-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.spotlight-card,
.product-card {
  padding: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  text-align: left;
}

.product-card {
  padding: 16px;
}

.spotlight-card:hover,
.product-card:hover {
  border-color: var(--color-primary);
}

.spotlight-card strong,
.product-card strong {
  display: block;
  color: var(--color-text-strong);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.rarity,
.price {
  font-weight: 700;
  font-size: 14px;
}

.rarity {
  color: var(--color-text-muted);
}

.price {
  color: var(--color-accent);
}

.spotlight-art,
.product-art {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.spotlight-art {
  height: 240px;
}

.product-art {
  height: 200px;
  margin-bottom: 12px;
}

.spotlight-art img,
.product-art img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.spotlight-card:hover .spotlight-art img,
.product-card:hover .product-art img {
  transform: scale(1.05);
}

.loading-placeholder {
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
  font-weight: 600;
}

@media (max-width: 1100px) {
  .slider-stage,
  .spotlight-grid,
  .product-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .spotlight-grid,
  .product-row {
    grid-template-columns: 1fr;
  }
  .slider-visual {
    display: none;
  }
  .slider-arrow {
    display: none;
  }
}
</style>
