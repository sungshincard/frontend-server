<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardGroups, cards } from '../data/catalog'

const router = useRouter()
const route = useRoute()

const categoryTabs = ['포켓몬', '트레이너스', '에너지']
const sortOptions = ['최신순', '인기순', '최저가순', '최근 거래순']
const typeFilters = ['불꽃', '물', '풀', '전기', '에스퍼', '악', '드래곤']
const stageFilters = ['기본', '1진화', '2진화', '포켓몬 ex', '아이템', '서포트']

const activeCategory = ref('포켓몬')
const activeSort = ref('최신순')
const selectedGroup = ref('')
const selectedPokemon = ref('')

watch(
  () => route.query,
  (query) => {
    activeCategory.value = query.category || '포켓몬'
    selectedGroup.value = query.group || ''
    selectedPokemon.value = query.pokemon || ''
  },
  { immediate: true }
)

const visibleGroups = computed(() =>
  cardGroups.filter((group) => {
    const categoryMatch = activeCategory.value === '포켓몬' ? group.category === '포켓몬' : group.category === activeCategory.value
    const groupMatch = !selectedGroup.value || group.id === selectedGroup.value
    return categoryMatch && groupMatch
  })
)

const visibleCards = computed(() =>
  cards.filter((card) => {
    const categoryMatch = activeCategory.value === '포켓몬' ? card.category === '포켓몬' : card.category === activeCategory.value
    const groupMatch = !selectedGroup.value || card.groupId === selectedGroup.value
    return categoryMatch && groupMatch
  })
)

const goGroup = (groupId) => router.push(`/cards/group/${groupId}`)
const goCard = (cardId) => router.push(`/cards/${cardId}`)
</script>

<template>
  <div class="cards-page container">
    <section class="cards-hero">
      <div>
        <p class="eyebrow">Card Search</p>
        <h1>카드 탐색</h1>
        <p>위 탭으로 범주를 바꾸고, 아래 그리드에서 카드 이미지를 나열해 선택하는 구조입니다.</p>
        <p v-if="selectedPokemon" class="filtered-copy">{{ selectedPokemon }} 기준으로 자동 필터링되었습니다.</p>
      </div>

      <div class="search-shell">
        <input type="text" placeholder="포켓몬 이름 또는 카드명을 검색하세요" aria-label="포켓몬 이름 또는 카드명 검색">
        <button type="button">검색</button>
      </div>
    </section>

    <section class="filter-panel">
      <div class="tab-row">
        <button
          v-for="tab in categoryTabs"
          :key="tab"
          type="button"
          class="tab-chip"
          :class="{ active: activeCategory === tab }"
          @click="activeCategory = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="filter-grid">
        <div class="field-block">
          <label>제품명</label>
          <input type="text" placeholder="피카츄, 리자몽, 뮤" aria-label="제품명">
        </div>
        <div class="field-block">
          <label>세트명</label>
          <input type="text" placeholder="151, 흑염의 지배자" aria-label="세트명">
        </div>
        <div class="field-block">
          <label>카드번호</label>
          <input type="text" placeholder="025/165" aria-label="카드번호">
        </div>
        <div class="field-block">
          <label>정렬 옵션</label>
          <select v-model="activeSort">
            <option v-for="option in sortOptions" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>

      <div class="chip-section">
        <h2>카드 타입</h2>
        <div class="chip-grid">
          <button v-for="item in typeFilters" :key="item" type="button" class="filter-chip">{{ item }}</button>
        </div>
      </div>

      <div class="chip-section">
        <h2>카드 종류</h2>
        <div class="chip-grid">
          <button v-for="item in stageFilters" :key="item" type="button" class="filter-chip">{{ item }}</button>
        </div>
      </div>
    </section>

    <section class="results-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Group Results</p>
          <h2>카드군 추천</h2>
        </div>
      </div>
      <div class="group-grid">
        <button
          v-for="group in visibleGroups"
          :key="group.id"
          type="button"
          class="group-card"
          @click="goGroup(group.id)"
        >
          <strong>{{ group.name }}</strong>
          <span>{{ group.subtitle }}</span>
          <small>{{ group.cardCount }}개의 개별 카드</small>
        </button>
      </div>
    </section>

    <section class="results-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Card Results</p>
          <h2>검색 결과 카드</h2>
        </div>
      </div>

      <div class="cards-grid visual">
        <article
          v-for="card in visibleCards"
          :key="card.id"
          class="card-tile"
          @click="goCard(card.id)"
        >
          <div class="card-thumb artwork">
            <div class="card-shell">
              <div class="card-shell-head">
                <span>{{ card.name }}</span>
                <small>{{ card.hp }}</small>
              </div>
              <div class="art-spot"></div>
              <div class="card-shell-footer">
                <span>{{ card.type }}</span>
                <span>{{ card.cardNumber }}</span>
              </div>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-top">
              <span class="type-badge">{{ card.type }}</span>
              <span class="trend">{{ card.trend }}</span>
            </div>
            <h3>{{ card.name }}</h3>
            <p class="set-name">{{ card.setName }} · {{ card.rarity }}</p>
            <div class="price-row">
              <strong>{{ card.lowestPrice }}</strong>
              <span>출품 {{ card.listingCount }}개</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cards-page {
  padding: 40px 0 80px;
}

.cards-hero {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 32px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.cards-hero h1 {
  margin: 0 0 16px;
  color: var(--color-text-strong);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.cards-hero p {
  color: var(--color-text-muted);
  font-size: 14px;
}

.filtered-copy {
  margin-top: 10px;
  color: var(--color-primary) !important;
  font-weight: 700;
}

.search-shell {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 600px;
}

.search-shell input,
.field-block input,
.field-block select {
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  border-radius: var(--radius-sm);
  outline: 0;
  width: 100%;
  font-size: 14px;
  transition: border-color var(--transition-fast);
}

.search-shell input:focus,
.field-block input:focus {
  border-color: var(--color-primary);
}

.search-shell button {
  padding: 14px 24px;
  background: var(--color-primary);
  color: var(--color-background-elevated);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 14px;
}

.filter-panel {
  padding: 24px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  margin-bottom: 40px;
}

.tab-row,
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-chip,
.filter-chip {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-chip.active {
  background: var(--color-primary);
  color: var(--color-background-elevated);
  border-color: var(--color-primary);
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.field-block label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-strong);
  font-size: 13px;
  font-weight: 700;
}

.chip-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.chip-section h2 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
}

.results-section {
  margin-top: 48px;
}

.section-head h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 12px;
  display: inline-block;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.group-card {
  padding: 20px;
  text-align: left;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition-fast);
}

.group-card:hover, .card-tile:hover {
  border-color: var(--color-primary);
}

.group-card strong {
  font-size: 15px;
  color: var(--color-text-strong);
  margin-bottom: 4px;
}

.group-card span {
  font-size: 13px;
  color: var(--color-text-muted);
}

.group-card small {
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-link);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.card-tile {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.card-thumb {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-panel-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.card-shell {
  width: min(100%, 180px);
  aspect-ratio: 0.71;
  background: #f0f0f0;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.card-shell-head,
.card-shell-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.art-spot {
  flex: 1;
  background: #ffffff;
  margin: 8px 0;
  border: 1px solid var(--color-border);
}

.card-meta {
  padding: 16px;
}

.meta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.type-badge {
  padding: 4px 8px;
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  font-size: 11px;
  font-weight: 700;
  border: 1px solid var(--color-border);
}

.trend {
  color: var(--color-accent);
  font-weight: 700;
  font-size: 12px;
}

.card-meta h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.3;
}

.set-name {
  font-size: 12px;
  color: var(--color-text-subtle);
  margin-bottom: 12px;
  margin-top: 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price-row strong {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.price-row span {
  font-size: 12px;
  color: var(--color-text-subtle);
}

@media (max-width: 1100px) {
  .filter-grid,
  .group-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filter-grid,
  .group-grid {
    grid-template-columns: 1fr;
  }
  .search-shell {
    flex-direction: column;
  }
}
</style>
