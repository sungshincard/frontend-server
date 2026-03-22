<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { latestListings, recentTrades, risingCards } from '../data/catalog'

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

const collections = [
  { title: '새로 출품된 카드', items: latestListings },
  { title: '새로 출시된 카드', items: recentTrades },
  { title: '현재 시세보다 저렴한 카드', items: latestListings.slice().reverse() },
]

const spotlightItems = computed(() =>
  risingCards.map((item) => ({
    ...item,
    label: '현재 주목받는 카드',
  }))
)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const goCards = () => router.push('/cards')
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

        <div class="spotlight-grid">
          <article v-for="item in spotlightItems" :key="item.name" class="spotlight-card">
            <div class="spotlight-art"></div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.change }}</span>
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

        <div class="product-row">
          <button
            v-for="item in section.items"
            :key="`${section.title}-${item.name}`"
            type="button"
            class="product-card"
            @click="goCards"
          >
            <div class="product-art"></div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.price }}</span>
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
  background: #f0f0f0;
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
  bottom: 0; left: 30%; width: 40%; height: 30%; background: #ffffff;
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

.spotlight-section {
  padding: 32px;
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

.spotlight-card {
  padding: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.spotlight-card strong,
.product-card strong {
  display: block;
  color: var(--color-text-strong);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.spotlight-card span {
  color: var(--color-accent);
  font-weight: 700;
  font-size: 14px;
}

.spotlight-art,
.product-art {
  background: #f5f5f5;
  border: 1px solid var(--color-border);
}

.spotlight-art {
  min-height: 240px;
  margin-bottom: 16px;
}

.collection-section {
  display: grid;
  gap: 40px;
}

.collection-card {
  padding: 32px;
}

.product-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.product-card {
  text-align: left;
  padding: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  transition: border-color var(--transition-fast);
}

.product-card:hover {
  border-color: var(--color-primary);
}

.product-art {
  min-height: 200px;
  margin-bottom: 12px;
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
