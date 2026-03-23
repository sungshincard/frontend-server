<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '../services/productService'

const router = useRouter()
const dexEntries = ref([])
const isLoading = ref(true)

const fetchPokemons = async () => {
  try {
    isLoading.value = true
    const response = await productService.getPokemons()
    dexEntries.value = response.data.map(p => ({
      no: p.dexNumber.toString().padStart(3, '0'),
      name: p.name,
      id: p.id
    }))
  } catch (error) {
    console.error('Failed to fetch pokemons:', error)
  } finally {
    isLoading.value = false
  }
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
          <input type="text" placeholder="포켓몬 이름 검색" aria-label="포켓몬 이름 검색">
          <button type="button">검색</button>
        </div>
      </div>

      <div class="dex-panel">
        <div class="dex-panel-head">
          <strong>도감 탐색</strong>
          <div class="lang-tags">
            <span v-for="tab in ['전국도감']" :key="tab">{{ tab }}</span>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">
           <p>포켓몬 도감을 불러오는 중입니다...</p>
        </div>
        <div v-else-if="dexEntries.length === 0" class="empty-state">
           <p>등록된 포켓몬이 없습니다.</p>
        </div>
        <div v-else class="dex-grid">
          <button
            v-for="entry in dexEntries"
            :key="entry.no"
            type="button"
            class="dex-entry"
            @click="goFilteredCards(entry)"
          >
            <span class="entry-no">#{{ entry.no }}</span>
            <span class="entry-name">{{ entry.name }}</span>
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

.dex-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.dex-panel-head strong {
  color: var(--color-text-strong);
  font-size: 18px;
  font-weight: 700;
}

.lang-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
