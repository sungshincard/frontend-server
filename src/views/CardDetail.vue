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
  background: #f0f0f0;
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

.section-head h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 12px;
  display: inline-block;
}

.table-list {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.table-row div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-row div:last-child {
  text-align: right;
}

.table-row strong {
  color: var(--color-text-strong);
  font-weight: 700;
}

.table-row span {
  color: var(--color-text-subtle);
  font-size: 12px;
}

.chart-box {
  width: 100%;
  height: 240px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  position: relative;
}

.trust-box {
  display: flex;
  flex-direction: column;
}

.trust-box div {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.related-card {
  padding: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

@media (max-width: 900px) {
  .detail-hero,
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
