<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { cards } from '../data/catalog'
import { useWatchlistStore } from '../stores/watchlist'

const router = useRouter()
const watchlistStore = useWatchlistStore()

const watchedCards = computed(() => cards.filter((card) => watchlistStore.cardIds.includes(card.id)))
const goCard = (cardId) => router.push(`/cards/${cardId}`)
</script>

<template>
  <div class="watchlist-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Watchlist</p>
        <h1>관심 카드</h1>
        <p>하트로 저장한 카드만 모아서 최저가와 최근 거래가를 확인합니다.</p>
      </div>
    </div>

    <section v-if="watchedCards.length" class="watchlist-grid">
      <article
        v-for="card in watchedCards"
        :key="card.id"
        class="watch-card"
        role="button"
        tabindex="0"
        @click="goCard(card.id)"
      >
        <div class="watch-card-visual">
          <div class="watch-card-shell">
            <div class="watch-card-head">
              <span>{{ card.name }}</span>
              <small>{{ card.hp }}</small>
            </div>
            <div class="watch-card-art"></div>
            <div class="watch-card-foot">
              <span>{{ card.type }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>
        <div class="watch-card-copy">
          <strong>{{ card.name }}</strong>
          <span>{{ card.setName }} · {{ card.rarity }}</span>
          <div class="watch-card-prices">
            <div><small>최저가</small><strong>{{ card.lowestPrice }}</strong></div>
            <div><small>최근 거래가</small><strong>{{ card.recentPrice }}</strong></div>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="empty-box">
      <strong>관심 카드가 아직 없습니다.</strong>
      <p>카드 상세에서 하트를 눌러 관심 카드를 추가해 보세요.</p>
    </section>
  </div>
</template>

<style scoped>
.watchlist-page {
  padding: 40px 0 80px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-head h1,
.watch-card-copy strong,
.watch-card-prices strong,
.empty-box strong {
  color: var(--color-text-strong);
}

.page-head p,
.watch-card-copy span,
.watch-card-prices small,
.empty-box p {
  color: var(--color-text-muted);
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.watch-card,
.empty-box {
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.watch-card {
  padding: 20px;
  display: grid;
  gap: 16px;
  cursor: pointer;
}

.watch-card-visual {
  display: flex;
  justify-content: center;
}

.watch-card-shell {
  width: min(100%, 220px);
  aspect-ratio: 0.71;
  padding: 16px;
  border-radius: 26px;
  background: linear-gradient(180deg, #ecd96f 0%, #ddc341 100%);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.28);
  display: flex;
  flex-direction: column;
}

.watch-card-head,
.watch-card-foot {
  display: flex;
  justify-content: space-between;
  color: #2c2407;
  font-weight: 800;
}

.watch-card-art {
  flex: 1;
  margin: 12px 0;
  border-radius: 24px;
  background:
    radial-gradient(circle at 40% 26%, rgba(255,255,255,0.6), transparent 20%),
    linear-gradient(135deg, rgba(122,104,30,0.65), rgba(240,217,117,0.2)),
    linear-gradient(180deg, #87722e, #e3d15f);
}

.watch-card-copy {
  display: grid;
  gap: 8px;
}

.watch-card-prices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 4px;
}

.watch-card-prices div {
  padding: 14px;
  border-radius: 16px;
  background: var(--color-background-elevated);
  display: grid;
  gap: 4px;
}

.empty-box {
  padding: 44px 32px;
  text-align: center;
}

@media (max-width: 960px) {
  .watchlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
