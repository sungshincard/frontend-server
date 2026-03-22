<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardById, getListingById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const listingId = computed(() => route.params.listingId || '')
const editingListing = computed(() => (listingId.value ? getListingById(listingId.value) : null))
const cardId = computed(() => editingListing.value?.cardId || route.query.cardId || 'charizard-ex-sar-151')
const card = computed(() => editingListing.value?.card || getCardById(cardId.value))

const condition = ref('A')
const grading = ref('NONE')
const gradingScore = ref(editingListing.value?.gradingScore || '')
const certificationNo = ref('')
const title = ref(editingListing.value?.title || card.value?.name || '')
const description = ref(editingListing.value?.description || '')
const price = ref(editingListing.value?.price?.replace(/[^0-9]/g, '') || card.value?.lowestPrice?.replace(/[^0-9]/g, '') || '189000')
const listingStatus = ref(editingListing.value?.status || 'ACTIVE')

if (editingListing.value) {
  condition.value = editingListing.value.conditionGrade
  grading.value = editingListing.value.gradingCompany
}

const conditionOptions = [
  { value: 'S', label: '새 상품(미사용)' },
  { value: 'A', label: '사용감 없음' },
  { value: 'B', label: '사용감 적음' },
  { value: 'C', label: '사용감 있음' },
  { value: 'D', label: '하자 있음' },
]

const gradingOptions = ['NONE', 'PSA', 'BGS', 'CGC']
const listingStatuses = ['ACTIVE', 'RESERVED', 'SOLD', 'HIDDEN']

const goBack = () => {
  if (card.value) {
    router.push(`/cards/${card.value.id}`)
  } else {
    router.push('/cards')
  }
}
</script>

<template>
  <div v-if="card" class="listing-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Listing Form</p>
        <h1>{{ editingListing ? '출품 수정' : '출품하기' }}</h1>
        <p>번개장터처럼 상품 등록 폼 중심으로 구성하고, 카드 정보는 상단에서만 요약합니다.</p>
      </div>
      <button type="button" class="back-button" @click="goBack">카드 상세로 돌아가기</button>
    </div>

    <section class="listing-form-card">
      <div class="form-section summary-section">
        <div class="summary-card">
          <div class="phone-card">
            <div class="phone-card-head">
              <span>{{ card.name }}</span>
              <small>{{ card.hp }}</small>
            </div>
            <div class="phone-card-art"></div>
            <div class="phone-card-foot">
              <span>{{ card.type }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>

        <div class="summary-copy">
          <strong>{{ card.name }}</strong>
          <span>{{ card.setName }} · {{ card.rarity }}</span>
          <small>카드 상세에서 보던 카드 기준으로 바로 출품을 등록합니다.</small>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>상품 정보</h2>
        </div>

        <div class="form-grid single">
          <label class="field">
            <span>상품 이미지</span>
            <button type="button" class="image-upload-box">
              <strong>이미지 등록</strong>
              <small>최소 1장부터 업로드 가능</small>
            </button>
          </label>
        </div>

        <div class="form-grid single">
          <label class="field">
            <span>상품명</span>
            <input v-model="title" type="text" placeholder="상품명을 입력해 주세요." maxlength="40">
          </label>
        </div>

        <div class="form-grid two">
          <div class="field static-field">
            <span>카드명</span>
            <strong>{{ card.name }}</strong>
          </div>
          <div class="field static-field">
            <span>세트 / 번호</span>
            <strong>{{ card.setName }} / {{ card.cardNumber }}</strong>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>카드 상태</h2>
        </div>
        <div class="condition-list">
          <label
            v-for="item in conditionOptions"
            :key="item.value"
            class="condition-row"
            :class="{ active: condition === item.value }"
          >
            <input v-model="condition" type="radio" :value="item.value">
            <span>{{ item.label }}</span>
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>감정 여부</h2>
        </div>
        <div class="chip-row">
          <button
            v-for="item in gradingOptions"
            :key="item"
            type="button"
            class="select-chip"
            :class="{ active: grading === item }"
            @click="grading = item"
          >
            {{ item === 'NONE' ? '미감정' : item }}
          </button>
        </div>
        <div class="form-grid two detail-grid">
          <label class="field">
            <span>감정 점수</span>
            <input v-model="gradingScore" type="text" placeholder="예: 10 / 9.5">
          </label>
          <label class="field">
            <span>인증번호</span>
            <input v-model="certificationNo" type="text" placeholder="예: PSA12345678">
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>설명</h2>
        </div>
        <label class="field">
          <textarea
            v-model="description"
            rows="7"
            placeholder="상태, 스크래치, 케이스 여부, 하자 유무 등을 설명해 주세요."
          />
        </label>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>가격</h2>
        </div>
        <div class="form-grid two">
          <label class="field">
            <span>판매 가격</span>
            <div class="price-input">
              <input v-model="price" type="text" inputmode="numeric" placeholder="가격 입력">
              <small>원</small>
            </div>
          </label>
          <div class="field static-field">
            <span>시세 참고</span>
            <strong>최저가 {{ card.lowestPrice }}</strong>
            <small>평균 거래가 {{ card.averagePrice }}</small>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>출품 상태</h2>
        </div>
        <div class="chip-row">
          <button
            v-for="status in listingStatuses"
            :key="status"
            type="button"
            class="select-chip"
            :class="{ active: listingStatus === status }"
            @click="listingStatus = status"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <div class="submit-row">
        <button type="button" class="ghost-button" @click="goBack">임시저장</button>
        <button type="button" class="submit-button">{{ editingListing ? '수정 완료' : '등록하기' }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.listing-page {
  padding: 42px 0 88px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-head h1,
.section-head h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.page-head p,
.summary-copy span,
.summary-copy small,
.field span,
.field small,
.check-row span {
  color: var(--color-text-muted);
}

.back-button,
.select-chip,
.ghost-button,
.submit-button,
.image-upload-box,
.condition-row {
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.back-button {
  padding: 12px 18px;
  border-radius: 999px;
  color: var(--color-text-strong);
}

.listing-form-card {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
  padding: 28px;
}

.form-section + .form-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid var(--color-border);
}

.summary-section {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.summary-card {
  display: flex;
  justify-content: center;
}

.phone-card {
  width: min(100%, 180px);
  aspect-ratio: 0.71;
  padding: 16px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ecd96f 0%, #ddc341 100%);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.28);
  display: flex;
  flex-direction: column;
}

.phone-card-head,
.phone-card-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #2c2407;
  font-weight: 800;
  font-size: 14px;
}

.phone-card-art {
  flex: 1;
  margin: 12px 0;
  border-radius: 24px;
  background:
    radial-gradient(circle at 40% 26%, rgba(255,255,255,0.6), transparent 20%),
    linear-gradient(135deg, rgba(122,104,30,0.65), rgba(240,217,117,0.2)),
    linear-gradient(180deg, #87722e, #e3d15f);
}

.summary-copy {
  display: grid;
  gap: 6px;
}

.summary-copy strong,
.static-field strong {
  color: var(--color-text-strong);
}

.summary-copy strong {
  font-size: 1.5rem;
}

.section-head {
  margin-bottom: 14px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid.single {
  grid-template-columns: 1fr;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-grid {
  margin-top: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field input,
.field textarea,
.price-input {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background-elevated);
}

.field input,
.field textarea {
  width: 100%;
  padding: 14px 16px;
  color: var(--color-text-strong);
  outline: 0;
}

.image-upload-box {
  min-height: 140px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  text-align: center;
}

.image-upload-box strong {
  display: block;
  color: var(--color-text-strong);
}

.static-field {
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background-elevated);
}

.condition-list {
  display: grid;
  gap: 10px;
}

.condition-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  color: var(--color-text-strong);
  font-weight: 600;
}

.condition-row.active {
  border-color: var(--color-primary);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.select-chip {
  padding: 10px 16px;
  border-radius: 999px;
  color: var(--color-text-strong);
  font-weight: 700;
}

.select-chip.active {
  background: var(--color-primary);
  border-color: transparent;
  color: #2c2407;
}

.price-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 0 14px;
}

.price-input input {
  border: 0;
  padding-left: 0;
  padding-right: 0;
  font-weight: 800;
  background: transparent;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.ghost-button,
.submit-button {
  padding: 14px 22px;
  border-radius: 16px;
  font-weight: 800;
}

.submit-button {
  background: #d93a2f;
  border-color: transparent;
  color: var(--color-primary-text);
}

@media (max-width: 720px) {
  .page-head,
  .summary-section,
  .form-grid.two {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .submit-row {
    justify-content: stretch;
  }
}
</style>
