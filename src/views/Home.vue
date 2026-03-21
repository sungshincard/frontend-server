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
      <button type="button" class="slider-arrow left" @click="prevSlide">‹</button>

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

      <button type="button" class="slider-arrow right" @click="nextSlide">›</button>

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
  padding: 36px 0 84px;
}

.hero-slider,
.spotlight-card,
.collection-card,
.product-card {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.hero-slider {
  position: relative;
  overflow: hidden;
  padding: 32px 86px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.slider-stage {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.1fr);
  gap: 26px;
  align-items: center;
  min-height: 460px;
}

.slider-copy h1,
.section-head h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.slider-copy h1 {
  font-size: clamp(2.8rem, 5vw, 4.6rem);
  line-height: 1.08;
  margin-bottom: 10px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.slider-copy strong {
  display: block;
  margin-bottom: 12px;
  color: var(--color-text-strong);
  font-size: 1.2rem;
}

.slider-copy p,
.product-card span {
  color: var(--color-text-muted);
}

.hero-button {
  margin-top: 22px;
  padding: 13px 20px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #2c2407;
  font-weight: 800;
}

.slider-visual {
  position: relative;
  min-height: 390px;
}

.visual-card {
  position: absolute;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08)),
    #d9d9d3;
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.12);
}

.visual-card.tall {
  top: 22px;
  left: 6%;
  width: 24%;
  height: 72%;
}

.visual-card.shirt {
  top: 0;
  left: 34%;
  width: 26%;
  height: 82%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08)),
    #c6c8d8;
}

.visual-card.jacket {
  top: 18px;
  right: 2%;
  width: 28%;
  height: 68%;
}

.visual-card.shoes {
  bottom: 18px;
  left: 37%;
  width: 22%;
  height: 26%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02)),
    #2c2b29;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(255,255,255,0.56);
  color: #77725f;
  font-size: 2.1rem;
  line-height: 1;
}

.slider-arrow.left {
  left: 22px;
}

.slider-arrow.right {
  right: 22px;
}

.slider-indicator {
  position: absolute;
  right: 22px;
  bottom: 18px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(120, 120, 120, 0.46);
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}

.spotlight-wrap,
.collection-section {
  margin-top: 28px;
}

.spotlight-section {
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.section-head {
  margin-bottom: 16px;
}

.section-head.compact {
  margin-bottom: 12px;
}

.spotlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.spotlight-card {
  padding: 18px;
}

.spotlight-card strong,
.product-card strong {
  color: var(--color-text-strong);
}

.spotlight-card span {
  color: var(--color-primary);
  font-weight: 800;
}

.spotlight-art,
.product-art {
  border-radius: 20px;
  background:
    radial-gradient(circle at 34% 26%, rgba(255,255,255,0.52), transparent 18%),
    linear-gradient(135deg, rgba(122,104,30,0.65), rgba(240,217,117,0.18)),
    linear-gradient(180deg, #80712f, #e7d04c);
}

.spotlight-art {
  min-height: 260px;
  margin-bottom: 14px;
}

.collection-section {
  display: grid;
  gap: 20px;
}

.collection-card {
  padding: 22px;
}

.product-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  padding: 16px;
  text-align: left;
}

.product-art {
  min-height: 220px;
  margin-bottom: 12px;
}

@media (max-width: 1100px) {
  .slider-stage,
  .spotlight-grid,
  .product-row {
    grid-template-columns: 1fr;
  }

  .hero-slider {
    padding-inline: 28px;
  }

  .slider-arrow {
    display: none;
  }
}
</style>
