<script setup>
import { ref, onMounted } from 'vue'
import requestService from '@/services/requestService'
import productService from '@/services/productService'
import { toast } from 'vue3-toastify'

const showModal = ref(false)
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

const form = ref({
  gameType: 'POKEMON',
  categoryId: null,
  elementalTypeId: null,
  cardSetId: null,
  cardName: '',
  cardNumber: '',
  rarity: '',
  hp: '',
  evolutionStage: '',
  illustrator: '',
  expansionCode: '',
  block: '',
  requestNote: '',
})

const myRequests = ref([])
const isLoading = ref(false)

const fetchMyRequests = async () => {
  try {
    const response = await requestService.getMyRequests()
    myRequests.value = response.data
  } catch (error) {
    console.error('Failed to fetch requests:', error)
  }
}

onMounted(() => {
  fetchMyRequests()
  fetchMetadata()
})

const submitRequest = async () => {
  if (!form.value.cardName || !form.value.cardSetId) {
    toast.warning('카드명과 세트명은 필수 입력 항목입니다.')
    return
  }

  try {
    isLoading.value = true
    await requestService.createRequest({
      gameType: form.value.gameType,
      categoryId: form.value.categoryId,
      elementalTypeId: form.value.elementalTypeId,
      cardSetId: form.value.cardSetId,
      cardName: form.value.cardName,
      cardNumber: form.value.cardNumber,
      rarity: form.value.rarity,
      hp: form.value.hp ? parseInt(form.value.hp) : null,
      evolutionStage: form.value.evolutionStage,
      illustrator: form.value.illustrator,
      expansionCode: form.value.expansionCode,
      block: form.value.block,
      referenceImageUrl: '', 
      requestNote: form.value.requestNote,
    })

    toast.success('카드 추가 요청이 성공적으로 접수되었습니다.')
    showModal.value = false
    fetchMyRequests() // Refresh list
    // Reset form
    form.value = {
      gameType: 'POKEMON',
      categoryId: null,
      elementalTypeId: null,
      cardSetId: null,
      cardName: '',
      cardNumber: '',
      rarity: '',
      hp: '',
      evolutionStage: '',
      illustrator: '',
      expansionCode: '',
      block: '',
      requestNote: '',
    }
  } catch (error) {
    console.error('Failed to submit request:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="card-request-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Card Request</p>
        <h1>카드 추가 요청</h1>
        <p>도감에 없는 카드를 운영팀에 등록 요청하고 내역을 확인할 수 있습니다.</p>
      </div>
      <button class="primary-btn" @click="showModal = true">새 카드 요청하기</button>
    </div>

    <section class="requests-list">
      <h2>내 요청 내역</h2>
      <div v-if="myRequests.length === 0" class="empty-state">
        요청한 내역이 없습니다.
      </div>
      <div class="list-container" v-else>
        <div v-for="req in myRequests" :key="req.id" class="request-item">
          <div class="req-info">
            <span class="game-type">{{ req.gameType }}</span>
            <h3>{{ req.cardName }}</h3>
            <p v-if="req.rejectReason" class="reject-reason">반려 사유: {{ req.rejectReason }}</p>
          </div>
          <div class="req-status">
            <span :class="['status-badge', req.status.toLowerCase()]">{{ req.status }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h2>새 카드 등록 요청</h2>
        <div class="form-grid three">
          <label class="field">
            <span>게임</span>
            <select v-model="form.gameType">
              <option value="POKEMON">포켓몬</option>
              <option value="YUGIOH">유희왕</option>
              <option value="ONE_PIECE">원피스 카드게임</option>
            </select>
          </label>
          <label class="field">
            <span>세부 분류</span>
            <select v-model="form.categoryId">
              <option :value="null">선택 안함</option>
              <option v-for="cat in metadata.categories" :key="cat.id" :value="cat.id">{{ cat.displayName }}</option>
            </select>
          </label>
          <label class="field">
            <span>타입(속성)</span>
            <select v-model="form.elementalTypeId">
              <option :value="null">선택 안함</option>
              <option v-for="t in metadata.elementalTypes" :key="t.id" :value="t.id">{{ t.displayName }}</option>
            </select>
          </label>
        </div>
        <div class="form-grid three">
          <label class="field">
            <span>세트명</span>
            <select v-model="form.cardSetId">
              <option :value="null">세트 선택</option>
              <option v-for="set in metadata.cardSets" :key="set.id" :value="set.id">{{ set.name }}</option>
            </select>
          </label>
          <label class="field">
            <span>카드명</span>
            <input v-model="form.cardName" type="text" placeholder="예: 피카츄 마스터볼 미러">
          </label>
          <label class="field">
            <span>카드번호</span>
            <input v-model="form.cardNumber" type="text" placeholder="예: 025/165">
          </label>
        </div>
        <div class="form-grid three">
          <label class="field">
            <span>레어리티(등급)</span>
            <input v-model="form.rarity" type="text" placeholder="예: C, U, R, RR">
          </label>
          <template v-if="form.gameType === 'POKEMON'">
            <label class="field">
              <span>체력 (HP)</span>
              <input v-model="form.hp" type="number" placeholder="예: 60">
            </label>
            <label class="field">
              <span>진화 단계</span>
              <input v-model="form.evolutionStage" type="text" placeholder="예: 기본, 1진화">
            </label>
          </template>
        </div>
        <div class="form-grid three">
          <label class="field">
            <span>일러스트레이터</span>
            <input v-model="form.illustrator" type="text" placeholder="예: chibi">
          </label>
          <label class="field">
            <span>확장팩 넘버</span>
            <input v-model="form.expansionCode" type="text" placeholder="예: s6a">
          </label>
          <label class="field">
            <span>블록</span>
            <input v-model="form.block" type="text" placeholder="예: E">
          </label>
        </div>
        <label class="field">
          <span>요청 메모</span>
          <textarea v-model="form.requestNote" rows="4" placeholder="참고 이미지 설명, 요청 이유 등을 적어 주세요." />
        </label>
        <div class="submit-row">
          <button type="button" class="cancel-button" :disabled="isLoading" @click="showModal = false">취소</button>
          <button type="button" class="submit-button" :disabled="isLoading" @click="submitRequest">
             {{ isLoading ? '처리 중...' : '요청 등록' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-request-page { padding: 40px 0 80px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.eyebrow {
  margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
.page-head h1 { margin: 0; color: var(--color-text-strong); }
.page-head p { color: var(--color-text-muted); margin-top: 8px;}
.primary-btn {
  padding: 12px 20px; background: var(--color-primary); color: var(--color-primary-text); font-weight: 700; border-radius: 8px; border: none; cursor: pointer;
}

.requests-list h2 { font-size: 18px; margin-bottom: 16px; }
.list-container { display: flex; flex-direction: column; gap: 12px; }
.request-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-background-elevated);
}
.req-info h3 { margin: 4px 0 0; font-size: 16px; }
.game-type { font-size: 12px; color: var(--color-text-muted); }
.reject-reason { font-size: 13px; color: var(--color-danger); margin-top: 4px; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.status-badge.pending { background: #333; color: #ccc; }
.status-badge.approved { background: rgba(0, 200, 83, 0.2); color: #00c853; }
.status-badge.rejected { background: rgba(255, 61, 0, 0.2); color: #ff3d00; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-content {
  background: var(--color-panel); padding: 30px; border-radius: 20px; width: 100%; max-width: 500px;
  border: 1px solid var(--color-border);
}
.modal-content h2 { margin-top: 0; margin-bottom: 20px; }

.form-grid { display: grid; gap: 16px; margin-bottom: 16px; }
.form-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.form-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.field { display: grid; gap: 8px; margin-bottom: 16px; }
.field span { font-size: 14px; font-weight: 600; }
.field input, .field textarea, .field select {
  width: 100%; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-background); padding: 12px 14px; color: var(--color-text-strong);
}
.submit-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.cancel-button { padding: 12px 20px; border: none; background: transparent; color: var(--color-text-strong); cursor: pointer;}
.submit-button {
  padding: 12px 20px; border: 0; border-radius: 8px; background: var(--color-primary); color: var(--color-primary-text); font-weight: 700; cursor: pointer;
}
@media (max-width: 720px) {
  .form-grid.two, .form-grid.three { grid-template-columns: 1fr; }
  .page-head { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
