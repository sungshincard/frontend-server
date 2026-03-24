<script setup>
import { ref, onMounted, watch } from 'vue';
import adminApi from '../../api/admin';
import productService from '../../services/productService';
import { toast } from 'vue3-toastify';

const isLoading = ref(false);
const isSearching = ref(false);
const pokemonList = ref([]);
const searchQuery = ref('');

// Metadata
const sets = ref([]);
const rarities = ref(['C', 'U', 'R', 'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR', 'HR', 'CHR', 'CSR', 'PROMO']);

const form = ref({
  pokemonId: null,
  name: '',
  cardNumber: '',
  rarity: '',
  imageUrl: '',
  cardSetId: null,
  gameType: 'POKEMON',
  language: 'KOREAN',
  attribute: '',
  hp: null,
  stage: '',
  illustrator: '',
  block: '',
  expansion: ''
});

const fetchMetadata = async () => {
  try {
    const res = await productService.getMetadata('POKEMON');
    sets.value = res.data.cardSets || [];
  } catch (error) {
    console.error('Failed to fetch metadata', error);
  }
};

const searchPokemon = async (query) => {
  if (!query) {
    pokemonList.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const res = await productService.getPokemons({ name: query });
    pokemonList.value = res.data;
  } catch (error) {
    console.error('Pokemon search failed', error);
  } finally {
    isSearching.value = false;
  }
};

const selectPokemon = (p) => {
  form.value.pokemonId = p.id;
  form.value.name = p.name + ' ';
  form.value.attribute = p.types?.[0] || '';
  pokemonList.value = [];
  searchQuery.value = p.name;
};

const handleSubmit = async () => {
  if (!form.value.pokemonId || !form.value.name || !form.value.cardSetId) {
    toast.warning('필수 정보를 모두 입력해주세요.');
    return;
  }

  isLoading.value = true;
  try {
    await adminApi.createCardMaster(form.value);
    toast.success('카드가 성공적으로 등록되었습니다.');
    resetForm();
  } catch (error) {
    console.error('Registration failed', error);
    toast.error(error.response?.data?.message || '카드 등록에 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    pokemonId: null,
    name: '',
    cardNumber: '',
    rarity: '',
    imageUrl: '',
    cardSetId: null,
    gameType: 'POKEMON',
    language: 'KOREAN',
    attribute: '',
    hp: null,
    stage: '',
    illustrator: '',
    block: '',
    expansion: ''
  };
  searchQuery.value = '';
};

onMounted(() => {
  fetchMetadata();
});

watch(searchQuery, (newVal) => {
  const handler = setTimeout(() => {
    if (newVal && newVal !== form.value.name.trim()) {
      searchPokemon(newVal);
    }
  }, 300);
  return () => clearTimeout(handler);
});
</script>

<template>
  <div class="admin-card-master-page">
    <header class="content-header">
      <div class="header-titles">
        <h1>카드 도감 마스터 등록</h1>
        <p>서비스 전체에서 공통으로 사용될 마스터 카드 데이터를 구축합니다.</p>
      </div>
      <div class="header-badges">
        <span class="badge secondary">Total Cards: 1,240</span>
      </div>
    </header>

    <div class="main-form-card">
      <form @submit.prevent="handleSubmit" class="registration-form">
        <div class="form-grid-layout">
          <!-- Left Column: Image Preview or Auxiliary -->
          <aside class="form-preview-area">
            <div class="image-preview-container">
              <div v-if="form.imageUrl" class="preview-img-wrapper">
                <img :src="form.imageUrl" alt="Preview" />
              </div>
              <div v-else class="preview-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>이미지 미리보기</span>
              </div>
            </div>
            <div class="preview-info">
              <div class="info-row">
                <span class="label">게임:</span>
                <span class="value">{{ form.gameType }}</span>
              </div>
              <div class="info-row">
                <span class="label">언어:</span>
                <span class="value">{{ form.language }}</span>
              </div>
            </div>
          </aside>

          <!-- Right Column: Form Fields -->
          <div class="form-fields-area">
            <section class="form-section">
              <h4 class="section-badge">Step 1. 기본 분류 정보</h4>
              <div class="row-3">
                <div class="input-group">
                  <label>게임 타입 <span class="req">*</span></label>
                  <select v-model="form.gameType">
                    <option value="POKEMON">포켓몬 카드 게임</option>
                    <option value="YUGIOH">유희왕</option>
                    <option value="ONEPIECE">원피스</option>
                  </select>
                </div>
                <div class="input-group">
                  <label>언어 <span class="req">*</span></label>
                  <select v-model="form.language">
                    <option value="KOREAN">한국어</option>
                    <option value="JAPANESE">일본어</option>
                    <option value="ENGLISH">영어</option>
                  </select>
                </div>
                <div class="input-group search-wrapper">
                  <label>포켓몬 검색 <span class="req">*</span></label>
                  <div class="search-input-box">
                    <input type="text" v-model="searchQuery" placeholder="이름 검색..." required />
                    <svg v-if="isSearching" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                  </div>
                  <ul v-if="pokemonList.length > 0" class="dropdown-list">
                    <li v-for="p in pokemonList" :key="p.id" @click="selectPokemon(p)">
                      {{ p.name }} <small>#{{ p.id }}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="form-section">
              <h4 class="section-badge">Step 2. 카드 상세 데이터</h4>
              <div class="row-2">
                <div class="input-group full">
                  <label>카드 정식 명칭 <span class="req">*</span></label>
                  <input type="text" v-model="form.name" placeholder="예: 리자몽 ex SAR" required />
                </div>
              </div>
              <div class="row-2">
                <div class="input-group">
                  <label>카드 세트 <span class="req">*</span></label>
                  <select v-model="form.cardSetId" required>
                    <option :value="null" disabled>세트를 선택하세요</option>
                    <option v-for="s in sets" :key="s.id" :value="s.id">{{ s.name }} ({{ s.code }})</option>
                  </select>
                </div>
                <div class="input-group">
                  <label>카드 번호</label>
                  <input type="text" v-model="form.cardNumber" placeholder="예: 201/190" />
                </div>
              </div>
              <div class="row-3">
                <div class="input-group">
                  <label>레어리티</label>
                  <select v-model="form.rarity">
                    <option value="">N/A</option>
                    <option v-for="r in rarities" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div class="input-group">
                  <label>속성/타입</label>
                  <input type="text" v-model="form.attribute" placeholder="예: 불꽃" />
                </div>
                <div class="input-group">
                  <label>HP</label>
                  <input type="number" v-model="form.hp" placeholder="330" />
                </div>
              </div>
              <div class="row-2">
                <div class="input-group">
                  <label>이미지 URL</label>
                  <input type="url" v-model="form.imageUrl" placeholder="https://..." />
                </div>
                <div class="input-group">
                  <label>일러스트레이터</label>
                  <input type="text" v-model="form.illustrator" placeholder="Amano Art" />
                </div>
              </div>
            </section>

            <div class="form-footer">
              <button type="button" class="btn-ghost" @click="resetForm">입력 초기화</button>
              <button type="submit" class="btn-primary-indigo" :disabled="isLoading">
                <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"></path></svg>
                {{ isLoading ? '등록 중...' : '마스터 카드 등록 완료' }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-card-master-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-titles h1 { font-size: 26px; font-weight: 900; color: var(--color-text-strong); margin-bottom: 4px; }
.header-titles p { font-size: 14px; color: var(--color-text-subtle); }

.badge.secondary {
  padding: 6px 12px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.main-form-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.form-grid-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
}

.form-preview-area {
  background-color: var(--color-panel-soft);
  padding: 40px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.image-preview-container {
  width: 220px;
  aspect-ratio: 2/3;
  background: var(--color-background-elevated);
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-subtle);
  font-size: 12px;
  font-weight: 600;
}

.preview-img-wrapper img { width: 100%; height: 100%; object-fit: contain; }

.preview-info { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-row .label { color: var(--color-text-subtle); }
.info-row .value { font-weight: 700; color: var(--color-text-strong); }

.form-fields-area {
  padding: 40px;
}

.form-section {
  margin-bottom: 40px;
}

.section-badge {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 24px;
  background: rgba(79, 70, 229, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
}

.row-2, .row-3 { display: grid; gap: 20px; margin-bottom: 20px; }
.row-2 { grid-template-columns: 1fr 1fr; }
.row-3 { grid-template-columns: 1fr 1fr 1fr; }

.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 13px; font-weight: 700; color: var(--color-text-muted); }
.req { color: #ef4444; }

input, select {
  padding: 12px 16px;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text-strong);
  transition: all 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-panel);
}

.search-wrapper { position: relative; }
.search-input-box { position: relative; display: flex; align-items: center; }
.search-input-box .spin { position: absolute; right: 12px; animation: spin 1s infinite linear; color: var(--color-text-subtle); }

@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.dropdown-list li {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-list li:hover { background-color: var(--color-panel-soft); color: var(--color-primary); }
.dropdown-list li small { color: var(--color-text-subtle); }

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
}

.btn-ghost {
  padding: 12px 24px;
  background: transparent;
  color: var(--color-text-subtle);
  font-weight: 700;
  border-radius: 10px;
}

.btn-ghost:hover { color: var(--color-text-strong); background: var(--color-panel-soft); }

.btn-primary-indigo {
  padding: 12px 32px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  font-weight: 800;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.btn-primary-indigo:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
.btn-primary-indigo:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

@media (max-width: 1024px) {
  .form-grid-layout { grid-template-columns: 1fr; }
  .form-preview-area { border-right: none; border-bottom: 1px solid var(--color-border); }
}
</style>
