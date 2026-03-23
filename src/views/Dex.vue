<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '../services/productService'

const router = useRouter()
const dexEntries = ref([])
const isLoading = ref(true)
const isFirstLoad = ref(true)
const activeRegion = ref('전체')
const activeType = ref('전체')
const searchQuery = ref('')
const regions = ['전체', '관동', '성도', '호연', '신오', '하나', '칼로스', '알로라', '가라르', '히스이', '팔데아']
const pokemonTypes = ['전체', '풀', '불꽃', '물', '벌레', '무색', '독', '번개', '땅', '요정', '격투', '초', '바위', '강철', '얼음', '고스트', '드래곤', '악', '비행']

const fetchPokemons = async () => {
  try {
    isLoading.value = true
    const params = {}
    if (activeRegion.value !== '전체') params.region = activeRegion.value
    if (activeType.value !== '전체') params.type = activeType.value
    if (searchQuery.value) params.name = searchQuery.value

    const response = await productService.getPokemons(params)
    if (!response || !response.data) {
      dexEntries.value = []
      return
    }
    
    dexEntries.value = response.data.map(p => {
      const dexNo = p.dexNumber || 0
      return {
        no: dexNo.toString().padStart(3, '0'),
        name: p.name || 'Unknown',
        id: p.id,
        imageUrl: p.imageUrl,
        region: p.region || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Failed to fetch pokemons:', error)
  } finally {
    isLoading.value = false
    isFirstLoad.value = false
  }
}

const toggleRegion = (region) => {
  activeRegion.value = region
  fetchPokemons()
}

const toggleType = (type) => {
  activeType.value = type
  fetchPokemons()
}

onMounted(() => {
  fetchPokemons()
})


const goFilteredCards = (entry) => {
  router.push({
    path: '/cards',
    query: {
      category: '포켓몬',
      pokemon: entry.name,
    },
  })
}
</script>

<template>
  <div class="dex-page container">
    <section class="dex-board">
      <div class="dex-search-row">
        <div class="dex-search-box search-box wide">
          <span>Name all Pokemon:</span>
          <input v-model="searchQuery" type="text" placeholder="포켓몬 이름 검색" aria-label="포켓몬 이름 검색" @keyup.enter="fetchPokemons">
          <button type="button" @click="fetchPokemons">검색</button>
        </div>
      </div>

      <div class="dex-panel">
        <div class="dex-panel-head filters">
          <div class="filter-row">
            <strong>지방별</strong>
            <div class="lang-tags">
              <span 
                v-for="region in regions" 
                :key="region" 
                :class="{ active: activeRegion === region }"
                @click="toggleRegion(region)"
              >
                {{ region }}
              </span>
            </div>
          </div>
          <div class="filter-row">
            <strong>타입별</strong>
            <div class="lang-tags">
              <span 
                v-for="t in pokemonTypes" 
                :key="t" 
                :class="{ active: activeType === t }"
                @click="toggleType(t)"
              >
                {{ t }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="isLoading && isFirstLoad" key="loading" class="dex-grid">
           <div v-for="n in 20" :key="n" class="dex-entry skeleton">
             <div class="entry-img"></div>
             <div class="entry-info">
               <div class="skeleton-text no"></div>
               <div class="skeleton-text name"></div>
             </div>
           </div>
        </div>
        <div v-else-if="!isLoading && dexEntries && dexEntries.length === 0" key="empty" class="empty-state">
           <p>등록된 포켓몬이 없습니다.</p>
        </div>
        <div v-else-if="dexEntries" key="grid" class="dex-grid" :class="{ loading: isLoading }">
          <button
            v-for="entry in dexEntries"
            :key="entry.no"
            type="button"
            class="dex-entry"
            @click="goFilteredCards(entry)"
          >
            <div class="entry-img">
              <img :src="entry.imageUrl || '/placeholder-pokemon.png'" :alt="entry.name">
            </div>
            <div class="entry-info">
              <span class="entry-no">#{{ entry.no }}</span>
              <span class="entry-name">{{ entry.name }}</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dex-page {
  padding: 40px 0 80px;
}

.dex-board {
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  padding: 32px;
}

.dex-search-row {
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 32px;
}

.dex-search-box {
  min-height: 60px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
}

.search-box span {
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.search-box input {
  flex: 1;
  height: 40px;
  border: 1px solid var(--color-border);
  padding: 0 16px;
  background: var(--color-background-elevated);
  font-size: 14px;
  outline: none;
}

.search-box button {
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--color-background-elevated);
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.dex-panel {
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.dex-panel-head.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.filter-row strong {
  color: var(--color-text-strong);
  font-size: 14px;
  font-weight: 700;
  min-width: 60px;
  padding-top: 8px;
}

.lang-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.lang-tags span.active {
  background: var(--color-primary);
  color: var(--color-primary-text); /* 프라이머리 배경색 위에 최적화된 높은 대비의 텍스트 색상 사용 */
  border-color: var(--color-primary);
}

.lang-tags span {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.dex-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 24px;
}

.dex-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  text-align: left;
  transition: border-color var(--transition-fast);
  cursor: pointer;
}

.dex-entry:hover {
  border-color: var(--color-primary);
}

.entry-img {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.entry-img img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-no {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.entry-name {
  color: var(--color-text-strong);
  font-size: 14px;
  font-weight: 600;
}

/* Loading & Skeleton Styles */
.dex-grid.loading {
  opacity: 0.6;
  pointer-events: none;
}

.dex-entry.skeleton {
  pointer-events: none;
}

.skeleton-text {
  height: 12px;
  background: var(--color-panel-soft);
  border-radius: 4px;
}

.skeleton-text.no {
  width: 30px;
}

.skeleton-text.name {
  width: 70px;
  margin-top: 4px;
}

.dex-entry.skeleton .entry-img {
  background: var(--color-panel-soft);
}

.dex-entry.skeleton .entry-img,
.skeleton-text {
  animation: skeleton-blink 1.5s infinite linear;
}

@keyframes skeleton-blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

@media (max-width: 1100px) {
  .dex-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .dex-grid {
    grid-template-columns: 1fr;
  }
  .dex-panel-head {
    flex-direction: column;
    align-items: start;
    gap: 16px;
  }
}
</style>
