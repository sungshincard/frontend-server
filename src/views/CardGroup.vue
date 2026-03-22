<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardsByGroupId, getGroupById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const group = computed(() => getGroupById(route.params.groupId))
const groupCards = computed(() => getCardsByGroupId(route.params.groupId))

const goCard = (cardId) => router.push(`/cards/${cardId}`)
</script>

<template>
  <div v-if="group" class="group-page container">
    <section class="group-hero">
      <div>
        <p class="eyebrow">{{ group.category }}</p>
        <h1>{{ group.name }} 카드군</h1>
        <p>{{ group.description }}</p>
      </div>
      <div class="hero-summary">
        <span>{{ group.type }}</span>
        <strong>{{ group.cardCount }}개의 개별 카드</strong>
        <small>세트 / 카드번호 / 레어리티가 다른 개별 카드를 먼저 선택합니다.</small>
      </div>
    </section>

    <section class="filter-strip">
      <button type="button" class="strip-chip">세트별</button>
      <button type="button" class="strip-chip">레어리티</button>
      <button type="button" class="strip-chip">카드번호</button>
      <button type="button" class="strip-chip">감정 여부</button>
      <button type="button" class="strip-chip">출품 있음</button>
    </section>

    <section class="group-card-grid visual-grid">
      <article
        v-for="card in groupCards"
        :key="card.id"
        class="version-card"
        @click="goCard(card.id)"
      >
        <div class="version-thumb artwork">
          <div class="focus-card">
            <div class="focus-head">
              <span>{{ card.name }}</span>
              <small>{{ card.hp }}</small>
            </div>
            <div class="focus-art"></div>
            <div class="focus-foot">
              <span>{{ card.type }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>
        <div class="version-copy">
          <div class="version-head">
            <strong>{{ card.name }}</strong>
            <span>{{ card.rarity }}</span>
          </div>
          <p>{{ card.setName }}</p>
          <div class="version-meta">
            <span>최저가 {{ card.lowestPrice }}</span>
            <span>출품 {{ card.listingCount }}개</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.group-page {
  padding: 40px 0 80px;
}

.group-hero {
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 32px;
  padding: 40px;
  margin-bottom: 32px;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.group-hero h1 {
  margin: 0 0 16px;
  color: var(--color-text-strong);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.group-hero p,
.hero-summary small,
.version-copy p {
  color: var(--color-text-muted);
  font-size: 14px;
}

.hero-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
}

.hero-summary span,
.hero-summary strong,
.version-head strong,
.version-meta span:first-child {
  color: var(--color-text-strong);
  font-weight: 700;
}

.filter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.strip-chip {
  padding: 12px 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.strip-chip:hover {
  border-color: var(--color-primary);
}

.group-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.version-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.version-card:hover {
  border-color: var(--color-primary);
}

.version-thumb {
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  aspect-ratio: 0.8;
}

.focus-card {
  width: 100%;
  aspect-ratio: 0.71;
  padding: 12px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-soft);
}

.focus-head,
.focus-foot {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.focus-art {
  flex: 1;
  margin: 10px 0;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
}

.version-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.version-head strong {
  font-size: 18px;
}

.version-head span,
.version-meta span:last-child {
  color: var(--color-text-subtle);
  font-size: 13px;
}

.version-meta {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 900px) {
  .group-hero,
  .version-card {
    grid-template-columns: 1fr;
  }
  .group-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
