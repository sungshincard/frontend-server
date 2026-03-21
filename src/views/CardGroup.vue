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
  padding: 52px 0 88px;
}

.group-hero,
.version-card {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.group-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  padding: 30px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.group-hero h1 {
  margin: 0 0 12px;
  color: var(--color-text-strong);
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  line-height: 1.08;
}

.group-hero p,
.hero-summary small,
.version-copy p {
  color: var(--color-text-muted);
}

.hero-summary {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 22px;
  border-radius: 22px;
  background: var(--color-background-elevated);
}

.hero-summary span,
.hero-summary strong,
.version-head strong,
.version-meta span:first-child {
  color: var(--color-text-strong);
}

.filter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.strip-chip {
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-muted);
}

.group-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.version-card {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 18px;
  padding: 18px;
  cursor: pointer;
}

.version-thumb {
  min-height: 210px;
  padding: 18px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent),
    var(--color-background-elevated);
  color: var(--color-text-subtle);
  font-weight: 700;
}

.version-thumb.artwork {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.focus-card {
  width: min(100%, 250px);
  aspect-ratio: 0.71;
  padding: 16px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.54), rgba(255,255,255,0.12) 16%, transparent 16%),
    linear-gradient(180deg, #d8f182 0%, #c7e56a 42%, #b5d857 100%);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.28);
}

.focus-head,
.focus-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #243312;
  font-weight: 700;
}

.focus-art {
  height: 54%;
  margin: 12px 0;
  border-radius: 14px;
  background:
    radial-gradient(circle at 38% 30%, rgba(255,255,255,0.6), transparent 20%),
    linear-gradient(135deg, rgba(66,106,40,0.72), rgba(181,219,93,0.18)),
    linear-gradient(180deg, #5d9233, #b1dc68);
}

.version-copy {
  display: grid;
  gap: 12px;
  align-content: start;
}

.version-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.version-head span,
.version-meta span:last-child {
  color: var(--color-text-subtle);
}

.version-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
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
