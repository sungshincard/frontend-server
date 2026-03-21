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
        <div class="dex-search-box logo-box">CD</div>
        <div class="dex-search-box search-box wide">
          <span>Name all Pokemon:</span>
          <input type="text" placeholder="포켓몬 이름 검색" aria-label="포켓몬 이름 검색">
          <button type="button">검색</button>
        </div>
        <div class="dex-search-box stat-box">0 / 1025</div>
        <div class="dex-search-box stat-box">Timer: 00:00:00</div>
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
  padding: 32px 0 72px;
}

.dex-board {
  border: 1px solid var(--color-border);
  border-radius: 30px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 16%),
    var(--color-panel);
  box-shadow: var(--shadow-soft);
  padding: 20px;
}

.dex-search-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1.3fr) 160px 220px;
  gap: 14px;
  margin-bottom: 16px;
}

.dex-search-box {
  min-height: 70px;
  border-radius: 22px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background-elevated) 84%, var(--color-primary) 16%);
  color: var(--color-text-strong);
}

.logo-box,
.stat-box {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.search-box {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}

.search-box span {
  font-weight: 700;
}

.search-box input {
  min-width: 0;
  height: 42px;
  border: 2px solid rgba(44, 61, 18, 0.45);
  border-radius: 8px;
  padding: 0 12px;
  background: rgba(255,255,255,0.72);
}

.search-box button {
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #20300c;
  font-weight: 800;
}

.dex-panel {
  border: 2px solid color-mix(in srgb, var(--color-primary) 42%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--color-background-elevated) 90%, var(--color-primary) 10%);
}

.dex-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 2px dotted color-mix(in srgb, var(--color-primary) 55%, transparent);
}

.dex-panel-head strong {
  color: var(--color-text-strong);
  font-size: 1.2rem;
}

.lang-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lang-tags span {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  background: var(--color-background-elevated);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 700;
}

.dex-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 18px;
  padding: 18px;
}

.dex-entry {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 12px;
  background: transparent;
  text-align: left;
}

.dex-entry:hover {
  background: var(--color-panel-soft);
}

.entry-no {
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.entry-name {
  color: var(--color-text-strong);
}

@media (max-width: 1100px) {
  .dex-search-row,
  .dex-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .logo-box {
    display: none;
  }
}

@media (max-width: 720px) {
  .dex-search-row,
  .dex-grid,
  .search-box {
    grid-template-columns: 1fr;
  }

  .dex-panel-head {
    flex-direction: column;
    align-items: start;
  }
}
</style>
