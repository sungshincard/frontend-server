<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardById, getListingById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const listingId = computed(() => route.query.listingId || '')
const listing = computed(() => (listingId.value ? getListingById(listingId.value) : null))
const cardId = computed(() => listing.value?.cardId || route.query.cardId || 'charizard-ex-sar-151')
const card = computed(() => listing.value?.card || getCardById(cardId.value))

const tradeType = ref('DELIVERY')
const selectedAddress = ref('home')
const agreeEscrow = ref(false)
const agreePolicy = ref(false)
const paymentMethod = ref('CARD')

const deliveryOptions = [
  { value: 'DELIVERY', label: '택배 거래', note: '고정 배송비 3,500원 적용' },
  { value: 'FACE_TO_FACE', label: '대면 거래', note: '직접 만나서 거래 후 완료 처리' },
]

const addresses = [
  {
    id: 'home',
    label: '집',
    name: '홍길동',
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123, 101동 1201호',
  },
  {
    id: 'office',
    label: '회사',
    name: '홍길동',
    phone: '010-2222-3333',
    address: '서울특별시 서초구 서초대로 55, 8층',
  },
]

const numericPrice = computed(() => Number((listing.value?.price || card.value?.lowestPrice || '0').replace(/[^0-9]/g, '') || 0))
const shippingFee = computed(() => {
  if (tradeType.value !== 'DELIVERY') return 0
  return 3500
})
const serviceFee = computed(() => Math.round(numericPrice.value * 0.015))
const paymentAmount = computed(() => numericPrice.value + shippingFee.value + serviceFee.value)

const goBack = () => {
  if (card.value) {
    router.push(`/cards/${card.value.id}`)
  } else {
    router.push('/cards')
  }
}
</script>

<template>
  <div v-if="card" class="checkout-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Checkout</p>
        <h1>구매하기</h1>
        <p>{{ card.name }} 구매 전 마지막 확인 단계입니다.</p>
      </div>
      <button type="button" class="back-button" @click="goBack">카드 상세로 돌아가기</button>
    </div>

    <div class="checkout-layout">
      <section class="checkout-main-card">
        <div class="section-block product-summary">
          <div class="summary-card-visual">
            <div v-if="listing?.imageUrl" class="listing-photo">
              <img :src="listing.imageUrl" :alt="listing.title">
            </div>
            <div v-else class="mini-card-shell">
              <div class="mini-card-head">
                <span>{{ card.name }}</span>
                <small>{{ card.hp }}</small>
              </div>
              <div class="mini-card-art"></div>
              <div class="mini-card-foot">
                <span>{{ card.type }}</span>
                <span>{{ card.cardNumber }}</span>
              </div>
            </div>
          </div>

          <div class="summary-copy">
            <strong>{{ listing?.title || card.name }}</strong>
            <span>{{ card.setName }} · {{ card.rarity }}</span>
            <small v-if="listing">
              {{ listing.seller }} · {{ listing.conditionGrade }} · {{ listing.gradingCompany === 'NONE' ? '미감정' : listing.gradingCompany }}
            </small>
            <small v-else>현재 최저가 {{ card.lowestPrice }} / 최근 거래가 {{ card.recentPrice }}</small>
          </div>
        </div>

        <div class="section-block">
          <div class="block-head">
            <h2>거래 방식</h2>
            <span>번개장터 / 당근처럼 직관적인 선택형 UX</span>
          </div>
          <div class="trade-type-grid">
            <button
              v-for="option in deliveryOptions"
              :key="option.value"
              type="button"
              class="choice-card"
              :class="{ active: tradeType === option.value }"
              @click="tradeType = option.value"
            >
              <strong>{{ option.label }}</strong>
              <span>{{ option.note }}</span>
            </button>
          </div>
        </div>

        <div v-if="tradeType === 'DELIVERY'" class="section-block">
          <div class="block-head">
            <h2>배송지 선택</h2>
            <span>기본 배송지 또는 최근 사용 배송지 선택</span>
          </div>
          <div class="address-grid">
            <button
              v-for="address in addresses"
              :key="address.id"
              type="button"
              class="address-card"
              :class="{ active: selectedAddress === address.id }"
              @click="selectedAddress = address.id"
            >
              <div class="address-head">
                <strong>{{ address.label }}</strong>
                <span>{{ address.name }}</span>
              </div>
              <p>{{ address.phone }}</p>
              <small>{{ address.address }}</small>
            </button>
          </div>
        </div>

        <div class="section-block">
          <div class="block-head">
            <h2>결제 수단</h2>
            <span>payment.payment_method 기준으로 선택합니다.</span>
          </div>
          <div class="payment-grid">
            <button
              v-for="option in paymentOptions"
              :key="option.value"
              type="button"
              class="payment-chip"
              :class="{ active: paymentMethod === option.value }"
              @click="paymentMethod = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="section-block">
          <div class="block-head">
            <h2>약관 동의</h2>
            <span>결제 전 정책과 에스크로 안내 확인</span>
          </div>
          <label class="check-row">
            <input v-model="agreeEscrow" type="checkbox">
            <span>에스크로 결제 보관 및 구매 확정 후 정산 구조에 동의합니다.</span>
          </label>
          <label class="check-row">
            <input v-model="agreePolicy" type="checkbox">
            <span>자동 구매 확정, 발송 기한, 분쟁 정책 안내를 확인했습니다.</span>
          </label>
        </div>

        <div class="submit-row">
          <button type="button" class="ghost-button" @click="goBack">취소</button>
          <button type="button" class="submit-button">결제 진행</button>
        </div>
      </section>

      <aside class="checkout-side-card">
        <div class="sticky-panel">
          <div class="side-section">
            <p class="eyebrow">Order Summary</p>
            <h2>결제 금액</h2>
            <div class="metric-list">
              <div><span>상품 금액</span><strong>{{ numericPrice.toLocaleString() }}원</strong></div>
              <div><span>배송비</span><strong>{{ shippingFee.toLocaleString() }}원</strong></div>
              <div><span>서비스 수수료</span><strong>{{ serviceFee.toLocaleString() }}원</strong></div>
              <div v-if="listing?.status"><span>출품 상태</span><strong>{{ listing.status }}</strong></div>
            </div>
            <div class="total-box">
              <span>최종 결제금액</span>
              <strong>{{ paymentAmount.toLocaleString() }}원</strong>
            </div>
          </div>

          <div class="side-section">
            <p class="eyebrow">Policy</p>
            <h2>구매 정책</h2>
            <ul class="tip-list">
              <li>택배 거래는 수령 후 구매 확정 전까지 결제가 보관됩니다.</li>
              <li>판매자 미발송 시 자동 취소 및 환불 처리될 수 있습니다.</li>
              <li>상태 불일치 시 주문 상세에서 분쟁 신고가 가능합니다.</li>
            </ul>
          </div>

          <div class="side-section notice-box">
            <p class="eyebrow">Escrow</p>
            <h2>에스크로 안내</h2>
            <ul class="tip-list">
              <li>구매 확정 전까지 판매자에게 정산되지 않습니다.</li>
              <li>분쟁 발생 시 정산은 자동으로 홀딩될 수 있습니다.</li>
              <li>대면 거래도 완료 처리 전까지 동일한 정책을 적용합니다.</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
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
.block-head h2,
.side-section h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.page-head p,
.block-head span,
.summary-copy span,
.summary-copy small,
.tip-list li,
.address-card p,
.address-card small {
  color: var(--color-text-muted);
}

.back-button,
.choice-card,
.address-card,
.payment-chip,
.ghost-button,
.submit-button {
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.back-button {
  padding: 12px 18px;
  border-radius: 999px;
  color: var(--color-text-strong);
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 340px;
  gap: 20px;
  align-items: start;
}

.checkout-main-card,
.checkout-side-card {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.checkout-main-card {
  padding: 24px;
}

.section-block + .section-block {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid var(--color-border);
}

.product-summary {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.summary-card-visual {
  display: flex;
  justify-content: center;
}

.listing-photo {
  width: 160px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
}

.listing-photo img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
}

.mini-card-shell {
  width: 160px;
  aspect-ratio: 0.71;
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.54), rgba(255,255,255,0.1) 16%, transparent 16%),
    linear-gradient(180deg, #f0e37b 0%, #e7d04c 40%, #cbb239 100%);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.28);
}

.mini-card-head,
.mini-card-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #2c2407;
  font-weight: 700;
  font-size: 12px;
}

.mini-card-art {
  height: 56%;
  margin: 12px 0;
  border-radius: 14px;
  background:
    radial-gradient(circle at 40% 26%, rgba(255,255,255,0.6), transparent 20%),
    linear-gradient(135deg, rgba(122,104,30,0.65), rgba(240,217,117,0.2)),
    linear-gradient(180deg, #87722e, #e3d15f);
}

.summary-copy {
  display: grid;
  gap: 6px;
}

.summary-copy strong {
  color: var(--color-text-strong);
  font-size: 1.5rem;
}

.block-head {
  margin-bottom: 14px;
}

.trade-type-grid,
.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.choice-card,
.address-card,
.payment-chip {
  padding: 18px;
  border-radius: 20px;
  text-align: left;
}

.choice-card.active,
.address-card.active,
.payment-chip.active {
  background: var(--color-primary);
  border-color: transparent;
  color: #2c2407;
}

.choice-card strong,
.payment-chip {
  font-weight: 800;
}

.choice-card strong {
  display: block;
  margin-bottom: 6px;
  color: inherit;
}

.choice-card span {
  color: inherit;
  opacity: 0.9;
}

.address-grid {
  display: grid;
  gap: 12px;
}

.address-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.address-head strong,
.address-head span {
  color: inherit;
}

.payment-chip {
  text-align: center;
  color: var(--color-text-strong);
}

.check-row {
  display: flex;
  gap: 10px;
  align-items: start;
  padding: 12px 0;
  color: var(--color-text-muted);
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.ghost-button,
.submit-button {
  padding: 14px 20px;
  border-radius: 16px;
  font-weight: 800;
}

.submit-button {
  background: var(--color-primary);
  border-color: transparent;
  color: #2c2407;
}

.checkout-side-card {
  padding: 16px;
}

.sticky-panel {
  position: sticky;
  top: 92px;
  display: grid;
  gap: 14px;
}

.side-section {
  padding: 18px;
  border-radius: 20px;
  background: var(--color-background-elevated);
}

.metric-list,
.tip-list {
  display: grid;
  gap: 12px;
}

.metric-list div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.metric-list span,
.total-box span {
  color: var(--color-text-subtle);
}

.metric-list strong,
.total-box strong {
  color: var(--color-text-strong);
}

.total-box {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.tip-list {
  margin: 0;
  padding-left: 18px;
}

.notice-box {
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-elevated));
}

@media (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .sticky-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .page-head,
  .product-summary,
  .trade-type-grid,
  .payment-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .submit-row {
    justify-content: stretch;
  }
}
</style>
const paymentOptions = [
  { value: 'CARD', label: '카드' },
  { value: 'BANK_TRANSFER', label: '계좌이체' },
  { value: 'POINT', label: '포인트' },
]
