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
  padding: 52px 0 88px;
}

.cards-hero,
.filter-panel,
.group-card,
.card-tile {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.cards-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.8fr);
  gap: 24px;
  padding: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.cards-hero h1,
.section-head h2,
.chip-section h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.cards-hero h1 {
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  line-height: 1.08;
}

.cards-hero p,
.group-card span,
.set-name {
  color: var(--color-text-muted);
}

.filtered-copy {
  margin-top: 10px;
  color: var(--color-primary) !important;
  font-weight: 700;
}

.search-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-self: end;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.search-shell input,
.field-block input,
.field-block select {
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  outline: 0;
}

.search-shell button {
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--color-primary);
  color: #eff4ff;
  font-weight: 700;
}

.filter-panel {
  margin-top: 22px;
  padding: 24px;
}

.tab-row,
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-chip,
.filter-chip {
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-muted);
}

.tab-chip {
  padding: 12px 18px;
  font-weight: 700;
}

.tab-chip.active {
  background: var(--color-primary);
  border-color: transparent;
  color: #20300c;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.field-block label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-strong);
  font-weight: 700;
}

.chip-section {
  margin-top: 24px;
}

.chip-section h2 {
  margin-bottom: 12px;
  font-size: 1.08rem;
}

.filter-chip {
  padding: 10px 14px;
}

.results-section {
  margin-top: 28px;
}

.section-head {
  margin-bottom: 14px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.group-card {
  padding: 20px;
  text-align: left;
}

.group-card strong,
.group-card small,
.card-meta h3,
.price-row strong {
  color: var(--color-text-strong);
}

.group-card small {
  display: block;
  margin-top: 8px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.cards-grid.visual {
  align-items: start;
}

.card-tile {
  padding: 18px;
  cursor: pointer;
}

.card-thumb {
  min-height: 220px;
  padding: 18px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent),
    var(--color-background-elevated);
}

.card-thumb.artwork {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
}

.card-shell {
  width: min(100%, 220px);
  aspect-ratio: 0.71;
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.48), rgba(255,255,255,0.1) 16%, transparent 16%),
    linear-gradient(180deg, #d4ee7e 0%, #c7e56a 38%, #b5d854 100%);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.3);
}

.card-shell-head,
.card-shell-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #243312;
  font-weight: 700;
}

.art-spot {
  height: 54%;
  margin: 10px 0 12px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 35% 28%, rgba(255,255,255,0.7), transparent 18%),
    radial-gradient(circle at 68% 44%, rgba(255,182,193,0.35), transparent 22%),
    linear-gradient(135deg, rgba(41,84,18,0.5), rgba(158,212,83,0.1)),
    linear-gradient(180deg, #578b2c, #b4dd6e);
}

.card-thumb span {
  color: var(--color-text-subtle);
  font-weight: 700;
}

.card-meta {
  padding-top: 18px;
}

.meta-top,
.price-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.type-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--color-panel-soft);
  color: var(--color-primary);
  font-size: 0.86rem;
  font-weight: 700;
}

.trend {
  color: #7fce54;
  font-weight: 700;
}

.card-meta h3 {
  margin: 14px 0 6px;
  font-size: 1.32rem;
  line-height: 1.2;
}

.price-row span {
  color: var(--color-text-muted);
}

@media (max-width: 1100px) {
  .cards-hero,
  .filter-grid,
  .group-grid,
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cards-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .search-shell,
  .filter-grid,
  .group-grid,
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
