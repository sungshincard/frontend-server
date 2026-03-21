<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardGroups, getCardById, getCardsByGroupId } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const card = computed(() => getCardById(route.params.cardId))

const relatedCards = computed(() => {
  if (!card.value) return []
  return getCardsByGroupId(card.value.groupId).filter((item) => item.id !== card.value.id)
})

const relatedGroups = computed(() => {
  if (!card.value) return []
  return cardGroups.filter((group) => card.value.relatedGroups.includes(group.id))
})

const goCard = (cardId) => router.push(`/cards/${cardId}`)
const goGroup = (groupId) => router.push(`/cards/group/${groupId}`)
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
        <div class="thumb-row">
          <div class="thumb-box">앞면</div>
          <div class="thumb-box">뒷면</div>
          <div class="thumb-box">하자부위</div>
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
          <button type="button" class="primary">구매하기</button>
          <button type="button" class="secondary">출품하기</button>
          <button type="button" class="tertiary">관심 등록</button>
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <article class="detail-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Listings</p>
            <h2>출품 목록</h2>
          </div>
        </div>
        <div class="table-list">
          <div v-for="item in card.listings" :key="`${item.seller}-${item.price}`" class="table-row">
            <div>
              <strong>{{ item.seller }}</strong>
              <span>{{ item.condition }} · {{ item.grading }}</span>
            </div>
            <div>
              <strong>{{ item.price }}</strong>
              <span>{{ item.date }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="detail-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Trades</p>
            <h2>최근 거래 이력</h2>
          </div>
        </div>
        <div class="table-list">
          <div v-for="item in card.trades" :key="`${item.date}-${item.price}`" class="table-row">
            <div>
              <strong>{{ item.date }}</strong>
              <span>{{ item.spec }}</span>
            </div>
            <div>
              <strong>{{ item.price }}</strong>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="detail-grid lower">
      <article class="detail-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Price Chart</p>
            <h2>상태별 시세 그래프</h2>
          </div>
        </div>
        <div class="chart-box">
          <div class="chart-line"></div>
          <div class="chart-line secondary"></div>
        </div>
      </article>

      <article class="detail-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Trust</p>
            <h2>판매자 / 상점 신뢰 정보</h2>
          </div>
        </div>
        <div class="trust-box">
          <div><span>추천 상점</span><strong>도감카드샵</strong></div>
          <div><span>평점</span><strong>4.9 / 5.0</strong></div>
          <div><span>후기 수</span><strong>182개</strong></div>
          <div><span>판매 완료 수</span><strong>421건</strong></div>
        </div>
      </article>
    </section>

    <section class="detail-grid lower">
      <article class="detail-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Related Cards</p>
            <h2>같은 카드군의 다른 버전</h2>
          </div>
        </div>
        <div class="related-grid">
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
            <p class="eyebrow">Related Groups</p>
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
  </div>
</template>

<style scoped>
.detail-page {
  padding: 52px 0 88px;
}

.detail-hero,
.detail-card,
.related-card {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
  gap: 24px;
  padding: 28px;
}

.detail-hero.mobile-shell {
  max-width: 520px;
  margin: 0 auto;
  grid-template-columns: 1fr;
}

.visual-column,
.info-column {
  display: grid;
  gap: 14px;
}

.main-visual,
.thumb-box,
.chart-box {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent),
    var(--color-background-elevated);
}

.main-visual {
  min-height: 420px;
  border-radius: 24px;
  padding: 22px;
  color: var(--color-text-subtle);
  font-weight: 700;
}

.main-visual.artwork {
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-card {
  width: min(100%, 280px);
  aspect-ratio: 0.71;
  padding: 16px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.54), rgba(255,255,255,0.1) 16%, transparent 16%),
    linear-gradient(180deg, #d4ee7e 0%, #c7e56a 40%, #b6d857 100%);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.28);
}

.phone-card-head,
.phone-card-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #243312;
  font-weight: 700;
}

.phone-card-art {
  height: 56%;
  margin: 12px 0;
  border-radius: 14px;
  background:
    radial-gradient(circle at 40% 26%, rgba(255,255,255,0.6), transparent 20%),
    radial-gradient(circle at 70% 42%, rgba(255,170,170,0.32), transparent 18%),
    linear-gradient(135deg, rgba(76,116,44,0.78), rgba(192,229,110,0.14)),
    linear-gradient(180deg, #5a8f31, #b2dc69);
}

.thumb-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.thumb-box {
  min-height: 104px;
  border-radius: 18px;
  padding: 16px;
  color: var(--color-text-subtle);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.info-column h1,
.section-head h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.info-column h1 {
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.08;
}

.summary,
.table-row span,
.related-card span,
.related-card small,
.trust-box span {
  color: var(--color-text-muted);
}

.spec-grid,
.price-panel,
.detail-grid,
.related-grid {
  display: grid;
}

.spec-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.spec-grid div,
.price-panel div,
.trust-box div {
  padding: 16px;
  border-radius: 18px;
  background: var(--color-background-elevated);
}

.spec-grid span,
.price-panel span,
.trust-box span {
  display: block;
  margin-bottom: 4px;
}

.spec-grid strong,
.price-panel strong,
.trust-box strong,
.table-row strong,
.related-card strong {
  color: var(--color-text-strong);
}

.price-panel {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-row button {
  padding: 14px 18px;
  border-radius: 16px;
  font-weight: 700;
}

.action-row .primary {
  background: var(--color-primary);
  color: #20300c;
}

.action-row .secondary,
.action-row .tertiary {
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
}

.detail-card {
  padding: 22px;
}

.section-head {
  margin-bottom: 14px;
}

.table-list {
  display: grid;
  gap: 14px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.chart-box {
  position: relative;
  min-height: 240px;
  border-radius: 22px;
  overflow: hidden;
}

.chart-line {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 22%;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, var(--color-primary) 20%, var(--color-primary) 100%);
  transform: skewY(-12deg);
}

.chart-line.secondary {
  bottom: 44%;
  opacity: 0.35;
  transform: skewY(-4deg);
}

.trust-box {
  display: grid;
  gap: 12px;
}

.related-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.related-card {
  padding: 18px;
  text-align: left;
}

@media (max-width: 1100px) {
  .detail-hero,
  .detail-grid,
  .related-grid,
  .spec-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .price-panel,
  .thumb-row {
    grid-template-columns: 1fr;
  }
}
</style>
