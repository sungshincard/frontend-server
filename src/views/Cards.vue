<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productService from '../services/productService'

const router = useRouter()
const route = useRoute()

const categoryTabs = ref(['전체', '포켓몬', '에너지', '트레이너스'])
const sortOptions = ref(['최신순', '인기순', '최저가순', '최근 거래순'])

const filterGroups = computed(() => {
  const groups = []

  if (activeCategory.value === '포켓몬') {
    groups.push({
      key: 'type',
      label: '타입',
      chips: metadata.value.elementalTypes.map(t => t.id)
    })
    groups.push({
      key: 'evolutionStage',
      label: '진화 단계',
      chips: ['기본', '1진화', '2진화', 'V', 'VMAX', 'VSTAR', 'ex', '메가 ex', '라디언트']
    })
  } else if (activeCategory.value === '에너지') {
    const energyCats = metadata.value.categories.filter(c => c.name.includes('ENERGY') && c.name !== 'ENERGY')
    groups.push({
      key: 'subType',
      label: '종류',
      chips: energyCats.map(c => c.id)
    })
    groups.push({
      key: 'type',
      label: '타입',
      chips: metadata.value.elementalTypes.map(t => t.id)
    })
  } else if (activeCategory.value === '트레이너스') {
    const trainerCats = metadata.value.categories.filter(c => !c.name.includes('ENERGY') && c.name !== 'POKEMON' && c.name !== 'ENERGY' && c.name !== 'TRAINER')
    groups.push({
      key: 'subType',
      label: '종류',
      chips: trainerCats.map(c => c.id)
    })
  }

  return groups
})

const getFilterLabel = (key, value) => {
  if (key === 'type') {
    return metadata.value.elementalTypes.find(t => t.id.toString() === value.toString())?.displayName || value
  }
  if (key === 'subType') {
    return metadata.value.categories.find(c => c.id.toString() === value.toString())?.displayName || value
  }
  return value
}

const activeCategory = ref('포켓몬')
const activeSort = ref('최신순')
const isFilterOpen = ref(false)

const activeFilters = ref({
  type: '',
  evolutionStage: '',
  subType: ''
})

const toggleFilter = (key, value) => {
  if (activeFilters.value[key] === value) {
    activeFilters.value[key] = ''
  } else {
    activeFilters.value[key] = value
  }
  fetchCards()
}

const metadata = ref({
  categories: [],
  elementalTypes: [],
  cardSets: []
})

const fetchMetadata = async () => {
  try {
    const response = await productService.getMetadata('POKEMON')
    metadata.value = response.data
  } catch (error) {
    console.error('Failed to fetch metadata:', error)
  }
}

const cards = ref([])
const isLoading = ref(false)

const searchParams = ref({
  cardSetId: null,
  cardName: '',
  cardNumber: '',
  pokemonId: null,
  pokemonName: '',
})

const activePage = ref(0)
const pageSize = 20
const hasMore = ref(true)
const observerTarget = ref(null)

const fetchCards = async (isLoadMore = false) => {
  const loadMore = isLoadMore === true
  if (!loadMore) {
    activePage.value = 0
    hasMore.value = true
    cards.value = []
  }

  try {
    isLoading.value = true
    const params = {
      gameType: 'POKEMON',
      categoryId: activeFilters.value.subType || (activeCategory.value === '트레이너스' ? 3 : (activeCategory.value === '에너지' ? 2 : null)),
      cardSetId: searchParams.value.cardSetId,
      cardName: searchParams.value.cardName,
      cardNumber: searchParams.value.cardNumber,
      elementalTypeId: activeFilters.value.type,
      evolutionStage: activeFilters.value.evolutionStage,
      pokemonId: searchParams.value.pokemonId,
      page: activePage.value,
      size: pageSize
    }
    const response = await productService.searchCards(params)
    const newItems = response.data || []
    
    if (loadMore) {
      cards.value = [...cards.value, ...newItems]
    } else {
      cards.value = newItems
    }

    hasMore.value = newItems.length === pageSize
    activePage.value++
  } catch (error) {
    console.error('Failed to fetch cards:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRouteQuery = () => {
  const { pokemonId, pokemonName, category } = route.query
  if (category) {
    activeCategory.value = category
  }
  if (pokemonId) {
    searchParams.value.pokemonId = parseInt(pokemonId)
    searchParams.value.pokemonName = pokemonName || ''
  } else {
    searchParams.value.pokemonId = null
    searchParams.value.pokemonName = ''
  }
}

onMounted(() => {
  fetchMetadata();
  handleRouteQuery();
  fetchCards();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
      fetchCards(true)
    }
  }, { threshold: 0.1 })

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
});

watch(() => route.query, () => {
  handleRouteQuery()
  fetchCards()
}, { deep: true })

watch([activeCategory], () => {
  // Reset filters when category changes
  activeFilters.value = { type: '', evolutionStage: '', subType: '' }
  fetchCards()
})

const handleCategoryChange = (tab) => {
  activeCategory.value = tab
  if (tab !== '전체') {
    isFilterOpen.value = true
  }
}

const visibleCards = computed(() => cards.value)

const goCard = (cardId) => router.push(`/cards/${cardId}`)
</script>

<template>
  <div class="cards-page container">
    <section class="cards-hero">
      <div>
        <h1>카드 탐색</h1>
      </div>

      <div class="search-shell">
        <input v-model="searchParams.cardName" type="text" placeholder="포켓몬 이름, 카드명, 카드번호를 검색하세요" aria-label="포켓몬 이름 또는 카드명 검색" @keyup.enter="fetchCards">
        <button type="button" class="search-button" @click="fetchCards">검색</button>
      </div>
      
      <div v-if="searchParams.pokemonId" class="filtered-badge-row">
        <div class="filtered-badge">
          <span>포켓몬: <strong>{{ searchParams.pokemonName }}</strong></span>
          <button type="button" @click="() => { searchParams.pokemonId = null; searchParams.pokemonName = ''; fetchCards(); }">
            &times;
          </button>
        </div>
      </div>
    </section>

    <section class="filter-panel">
      <div class="filter-top-row">
        <div class="tab-row">
          <button
            v-for="tab in categoryTabs"
            :key="tab"
            type="button"
            class="tab-chip"
            :class="{ active: activeCategory === tab }"
            @click="handleCategoryChange(tab)"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <div v-if="activeCategory !== '전체'" class="filter-dropdown">
        <div class="filter-grid">
          <div class="field-block">
            <label>카드명</label>
            <input v-model="searchParams.cardName" type="text" placeholder="피카츄, 리자몽, 뮤" aria-label="카드명">
          </div>
          <div class="field-block">
            <label>확장팩</label>
            <select v-model="searchParams.cardSetId" @change="fetchCards">
              <option :value="null">전체 확장팩</option>
              <option v-for="set in metadata.cardSets" :key="set.id" :value="set.id">{{ set.name }}</option>
            </select>
          </div>
          <div class="field-block">
            <label>카드번호</label>
            <input v-model="searchParams.cardNumber" type="text" placeholder="025/165" aria-label="카드번호">
          </div>
          <div class="field-block">
            <label>정렬 옵션</label>
            <select v-model="activeSort">
              <option v-for="option in sortOptions" :key="option">{{ option }}</option>
            </select>
          </div>
        </div>

        <div v-for="group in filterGroups" :key="group.label" class="chip-section">
          <h2>{{ group.label }}</h2>
          <div class="chip-grid">
            <button
              v-for="chip in group.chips"
              :key="chip"
              type="button"
              class="filter-chip"
              :class="{ active: activeFilters[group.key] === chip }"
              @click="toggleFilter(group.key, chip)"
            >
              {{ getFilterLabel(group.key, chip) }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="results-section">
      <div class="section-head">
        <div>
          <h2>카드 목록</h2>
          <p>{{ visibleCards.length }}개의 카드를 확인할 수 있습니다.</p>
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
            <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.cardName" class="card-image" />
            <div v-else class="card-shell">
              <div class="card-shell-head">
                <span>{{ card.cardName }}</span>
                <small>{{ card.hp }}</small>
              </div>
              <div class="art-spot"></div>
              <div class="card-shell-footer">
                <span>{{ card.elementalTypeName }}</span>
                <span>{{ card.cardNumber }}</span>
              </div>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-top">
              <span class="type-badge">{{ card.elementalTypeName || card.categoryName }}</span>
              <span class="trend">{{ card.trend }}</span>
            </div>
            <h3>{{ card.cardName }}</h3>
            <p class="set-name">{{ card.cardSetName }} · {{ card.rarity }}</p>
            <div class="price-row">
              <strong>{{ card.lowestPrice }}</strong>
              <span>출품 {{ card.saleCardCount }}개</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Intersection Observer Target -->
      <div ref="observerTarget" class="observer-trigger">
        <div v-if="isLoading" class="loading-more">
           <span>Loading more cards...</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* (Added Load More CSS) */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.load-more-btn {
  padding: 14px 32px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-strong);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.load-more-btn:hover {
  background: var(--color-panel-soft);
}
.cards-page {
  padding: 40px 0 80px;
}

.cards-hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
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
  margin: 0;
}

.filtered-copy {
  margin-top: 10px !important;
  color: var(--color-primary) !important;
  font-weight: 700;
}

.filtered-badge-row {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.filtered-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--color-primary-soft);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  color: var(--color-primary);
  font-size: 13px;
}

.filtered-badge button {
  background: transparent;
  border: none;
  font-size: 18px;
  line-height: 1;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.search-shell {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 860px;
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

.search-shell input {
  min-height: 56px;
  font-size: 15px;
}

.search-button {
  min-width: 112px;
  padding: 14px 24px;
  background: var(--color-primary);
  color: var(--color-background-elevated);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.filter-panel {
  padding: 20px 24px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  margin-bottom: 40px;
  border-radius: 14px;
}

.filter-top-row,
.tab-row,
.chip-grid,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tab-row,
.chip-grid {
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

.filter-chip.active {
  background: var(--color-primary);
  color: var(--color-background-elevated);
  border-color: var(--color-primary);
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.filter-toggle-button {
  padding: 11px 18px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 13px;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
}

.filter-toggle-button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-background-elevated);
}

.filter-dropdown {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
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
  margin-top: 36px;
}

.section-head {
  margin-bottom: 20px;
}

.section-head h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
}

.section-head p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.card-tile:hover {
  border-color: var(--color-primary);
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

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform var(--transition-fast);
}

.card-tile:hover .card-image {
  transform: scale(1.05);
}

.card-shell {
  width: min(100%, 180px);
  aspect-ratio: 0.71;
  background: var(--color-background-elevated);
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
  background: var(--color-panel);
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

.observer-trigger {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.loading-more {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 1100px) {
  .filter-grid {
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
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .search-shell {
    flex-direction: column;
  }
  .filter-top-row,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .search-button {
    width: 100%;
  }
}
</style>
