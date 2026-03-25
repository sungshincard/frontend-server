<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productService from '../services/productService'
import ImageUpload from '../components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()

const cardId = computed(() => route.query.cardId)
const saleCardId = computed(() => route.params.saleCardId)
const isEditing = computed(() => !!saleCardId.value)

const card = ref(null)
const isLoading = ref(true)
const imageUploadRef = ref(null)

const form = ref({
  title: '',
  description: '',
  price: '',
  conditionGrade: 'A',
  status: 'ACTIVE',
  imageUrls: []
})

const formattedPrice = computed({
  get: () => {
    if (!form.value.price) return ''
    return Number(form.value.price).toLocaleString()
  },
  set: (val) => {
    const numericValue = val.replace(/[^0-9]/g, '')
    form.value.price = numericValue
  }
})

const conditionOptions = [
  { value: 'S', label: '새 상품(미사용)' },
  { value: 'A', label: '사용감 없음' },
  { value: 'B', label: '사용감 적음' },
  { value: 'C', label: '사용감 있음' },
  { value: 'D', label: '하자 있음' },
]

const listingStatuses = ['ACTIVE', 'RESERVED', 'SOLD', 'HIDDEN']

const fetchInitialData = async () => {
  try {
    isLoading.value = true
    if (cardId.value) {
      const response = await productService.getCardDetail(cardId.value)
      card.value = response.data
      form.value.title = card.value.cardName
    }

    if (isEditing.value) {
      const response = await productService.getSaleCardDetail(saleCardId.value)
      const data = response.data
      form.value = {
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        conditionGrade: data.conditionGrade,
        status: data.status,
        imageUrls: data.imageUrls
      }
      // Set previews in ImageUpload.vue if needed (logic handled by v-model or direct ref)
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
    alert('데이터를 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchInitialData)

const handleSubmit = async () => {
  if (!form.value.title || !form.value.price) {
    alert('상품명과 가격을 입력해주세요.')
    return
  }

  try {
    // 1. Upload images first
    await imageUploadRef.value.uploadAll()
    
    // 2. Create or Update SaleCard
    const payload = {
      cardMasterId: card.value.id,
      title: form.value.title,
      description: form.value.description,
      price: parseInt(form.value.price),
      conditionGrade: form.value.conditionGrade,
      status: form.value.status,
      imageUrls: form.value.imageUrls
    }

    if (isEditing.value) {
      await productService.updateSaleCard(saleCardId.value, payload)
      alert('수정이 완료되었습니다.')
    } else {
      await productService.createSaleCard(payload)
      alert('등록이 완료되었습니다.')
    }
    
    goBack()
  } catch (error) {
    console.error('Submit failed:', error)
  }
}

const goBack = () => {
  if (card.value) {
    router.push(`/cards/${card.value.id}`)
  } else {
    router.push('/cards')
  }
}
</script>

<template>
  <div v-if="isLoading" class="loading-state container">
    <p>데이터를 불러오는 중입니다...</p>
  </div>
  <div v-else-if="card" class="listing-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Listing Form</p>
        <h1>{{ isEditing ? '출품 수정' : '출품하기' }}</h1>
        <p>실제 카드 정보를 기반으로 상품을 등록합니다.</p>
      </div>
      <button type="button" class="back-button" @click="goBack">카드 상세로 돌아가기</button>
    </div>

    <section class="listing-form-card">
      <div class="form-section summary-section">
        <div class="summary-card">
          <div class="phone-card" :class="card.pokemonCardType?.toLowerCase()">
            <div class="phone-card-head">
              <span>{{ card.cardName }}</span>
              <small v-if="card.hp">{{ card.hp }} HP</small>
            </div>
            <img v-if="card.imageUrl" :src="card.imageUrl" class="phone-card-img" />
            <div v-else class="phone-card-art"></div>
            <div class="phone-card-foot">
              <span>{{ card.evolutionStage || '기본' }}</span>
              <span>{{ card.cardNumber }}</span>
            </div>
          </div>
        </div>

        <div class="summary-copy">
          <strong>{{ card.cardName }}</strong>
          <span>{{ card.cardSetName }} · {{ card.rarity }}</span>
          <small>카드 상세에서 보던 카드 기준으로 바로 출품을 등록합니다.</small>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>상품 정보</h2>
        </div>

        <div class="form-grid single">
          <div class="field">
            <span>상품 이미지</span>
            <ImageUpload 
              ref="imageUploadRef"
              v-model="form.imageUrls"
              :max-files="5"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>상품명</h2>
        </div>
        <div class="form-grid single">
          <label class="field">
            <input v-model="form.title" type="text" placeholder="상품명을 입력해 주세요." maxlength="40">
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>카드 상세 정보</h2>
        </div>
        <div class="form-grid two">
          <div class="field static-field">
            <span>카드명</span>
            <strong>{{ card.cardName }}</strong>
          </div>
          <div class="field static-field">
            <span>세트 / 번호</span>
            <strong>{{ card.cardSetName }} / {{ card.cardNumber }}</strong>
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
            :class="{ active: form.conditionGrade === item.value }"
          >
            <input v-model="form.conditionGrade" type="radio" :value="item.value">
            <span>{{ item.label }}</span>
          </label>
        </div>
      </div>


      <div class="form-section">
        <div class="section-head">
          <h2>설명</h2>
        </div>
        <label class="field">
          <textarea
            v-model="form.description"
            rows="7"
            placeholder="상태, 스크래치, 케이스 여부, 하자 유무 등을 설명해 주세요."
          />
        </label>
      </div>

      <div class="form-section">
        <div class="section-head">
          <h2>가격</h2>
        </div>
        <div class="price-layout">
          <div class="price-input-area">
            <label class="field">
              <div class="price-input-wrapper">
                <input v-model="formattedPrice" type="text" inputmode="numeric" placeholder="가격을 입력해 주세요.">
                <span class="unit">원</span>
              </div>
            </label>
          </div>
          
          <div class="price-reference-area">
            <div class="reference-title">실시간 시세 참고</div>
            <div class="reference-grid">
              <div class="reference-item">
                <span class="label">최저가</span>
                <strong class="value">{{ card.lowestPrice ? card.lowestPrice.toLocaleString() + '원' : '-' }}</strong>
              </div>
              <div class="reference-item">
                <span class="label">최고가</span>
                <strong class="value">{{ card.highestPrice ? card.highestPrice.toLocaleString() + '원' : '-' }}</strong>
              </div>
              <div class="reference-item">
                <span class="label">최근 거래가</span>
                <strong class="value">{{ card.recentTradePrice ? card.recentTradePrice.toLocaleString() + '원' : '-' }}</strong>
              </div>
              <div class="reference-item">
                <span class="label">평균 거래가</span>
                <strong class="value">{{ card.averagePrice ? Math.round(card.averagePrice).toLocaleString() + '원' : '-' }}</strong>
              </div>
              <div class="reference-item">
                <span class="label">현재 출품 수</span>
                <strong class="value">{{ card.activeListingCount || 0 }}건</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="form-section">
        <div class="section-head">
          <h2>출품 상태</h2>
        </div>
        <div class="chip-row">
          <button
            v-for="status in listingStatuses"
            :key="status"
            type="button"
            class="select-chip"
            :class="{ active: form.status === status }"
            @click="form.status = status"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <div class="submit-row">
        <button type="button" class="ghost-button" @click="goBack">취소</button>
        <button type="button" class="submit-button" @click="handleSubmit">
          {{ isEditing ? '수정 완료' : '등록하기' }}
        </button>
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

.phone-card-art, .phone-card-img {
  flex: 1;
  margin: 12px 0;
  border-radius: 20px;
  background:
    radial-gradient(circle at 40% 26%, rgba(255,255,255,0.6), transparent 20%),
    linear-gradient(135deg, rgba(122,104,30,0.65), rgba(240,217,117,0.2)),
    linear-gradient(180deg, #87722e, #e3d15f);
}

.phone-card-img {
  width: 100%;
  object-fit: cover;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.condition-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  border-radius: 16px;
  color: var(--color-text-strong);
  font-weight: 600;
  cursor: pointer;
  text-align: center;
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

.price-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0 24px;
  height: 110px;
  transition: border-color 0.2s;
}

.price-input-wrapper:focus-within {
  border-color: var(--color-primary);
}

.price-input-wrapper input {
  border: 0;
  padding: 14px 0;
  font-size: 1.1rem;
  font-weight: 800;
  background: transparent;
}

.price-input-wrapper .unit {
  font-weight: 700;
  color: var(--color-text-muted);
  margin-left: 8px;
}

.price-reference-area {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 16px 20px;
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.reference-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.reference-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.reference-item .label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reference-item .value {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.stat-item.highlight .value {
  color: var(--color-primary);
  font-size: 1.15rem;
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
