<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const dexTabs = ['전국도감', '관동', '성도', '호연', '신오', '하나', '칼로스', '팔데아']

const dexEntries = [
  { no: '001', name: '이상해씨', groupId: 'pikachu' },
  { no: '004', name: '파이리', groupId: 'charizard' },
  { no: '007', name: '꼬부기', groupId: 'pikachu' },
  { no: '025', name: '피카츄', groupId: 'pikachu' },
  { no: '037', name: '식스테일', groupId: 'charizard' },
  { no: '052', name: '나옹', groupId: 'pikachu' },
  { no: '133', name: '이브이', groupId: 'pikachu' },
  { no: '150', name: '뮤츠', groupId: 'mew' },
  { no: '151', name: '뮤', groupId: 'mew' },
  { no: '152', name: '치코리타', groupId: 'pikachu' },
  { no: '155', name: '브케인', groupId: 'charizard' },
  { no: '158', name: '리아코', groupId: 'pikachu' },
  { no: '172', name: '피츄', groupId: 'pikachu' },
  { no: '196', name: '에브이', groupId: 'mew' },
  { no: '197', name: '블래키', groupId: 'mew' },
  { no: '252', name: '나무지기', groupId: 'pikachu' },
  { no: '255', name: '아차모', groupId: 'charizard' },
  { no: '258', name: '물짱이', groupId: 'pikachu' },
  { no: '387', name: '모부기', groupId: 'pikachu' },
  { no: '390', name: '불꽃숭이', groupId: 'charizard' },
  { no: '393', name: '팽도리', groupId: 'pikachu' },
]

const goFilteredCards = (entry) => {
  router.push({
    path: '/cards',
    query: {
      category: '포켓몬',
      group: entry.groupId,
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
            <span v-for="tab in dexTabs" :key="tab">{{ tab }}</span>
          </div>
        </div>

        <div class="dex-grid">
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
