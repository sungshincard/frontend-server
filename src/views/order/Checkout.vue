<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'
import productService from '@/services/productService'
import addressService from '@/services/addressService'
import authService from '@/services/authService'
import { getImageUrl } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const saleCardId = computed(() => route.query.saleCardId || '')
const listing = ref(null)
const card = computed(() => listing.value?.cardMaster)
const isLoading = ref(true)

onMounted(async () => {
  try {
    isLoading.value = true
    
    // Fetch Sale Card
    if (saleCardId.value) {
      const resp = await productService.getSaleCardDetail(saleCardId.value)
      listing.value = resp.data
    }
    
    // Fetch Addresses
    const addrResp = await addressService.getAddresses()
    addresses.value = addrResp.data
    
    // Auto-select default address
    const defaultAddr = addresses.value.find(a => a.isDefault)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }

    // Fetch Profile (to get name/nickname for customerName)
    if (!authStore.user || !authStore.user.name) {
      const profileResp = await authService.getMe()
      authStore.setUser(profileResp.data)
    }
    
  } catch (error) {
    console.error('Failed to fetch checkout data:', error)
  } finally {
    isLoading.value = false
  }
})

const tradeType = ref('SHIPPING')
const selectedAddressId = ref(null)
const addresses = ref([])
const agreeEscrow = ref(false)
const agreePolicy = ref(false)
const paymentMethod = ref('CARD')

const agreeAll = computed({
  get: () => agreeEscrow.value && agreePolicy.value,
  set: (val) => {
    agreeEscrow.value = val
    agreePolicy.value = val
  }
})
 
const useNewAddress = ref(false) // false: 기본 배송지, true: 신규 배송지
const isAddressModalOpen = ref(false)
const addressSearchQuery = ref('')

const shippingMessageOption = ref('문 앞에 놓아주세요')
const customShippingMessage = ref('')

const newAddressForm = ref({
  recipientName: '',
  recipientPhone: '',
  zipCode: '',
  address1: '',
  address2: '',
  isDefault: false
})

const execDaumPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      let addr = ''
      if (data.userSelectedType === 'R') {
        addr = data.roadAddress
      } else {
        addr = data.jibunAddress
      }
      newAddressForm.value.address1 = addr
      newAddressForm.value.zipCode = data.zonecode
      // focus on detail address
      document.getElementById('address2')?.focus()
    }
  }).open()
}
 
const saveToAddressBook = async () => {
  if (!newAddressForm.value.recipientName || !newAddressForm.value.address1 || !newAddressForm.value.recipientPhone) {
    alert('수령인, 연락처, 주소를 모두 입력해 주세요.')
    return
  }
  try {
    const res = await addressService.createAddress({
      ...newAddressForm.value,
      isDefault: true // Always save as default when using this button
    })
    if (res.status === 200 || res.status === 201) {
      alert('주소록에 기본 배송지로 등록되었습니다.')
      // Refresh addresses list
      const addressesRes = await addressService.getAddresses()
      addresses.value = addressesRes.data
      // Switch back to saved address tab and select this one
      const newAddrId = res.data.id
      selectedAddressId.value = newAddrId
      useNewAddress.value = false
    }
  } catch (e) {
    console.error('Failed to save address:', e)
    alert('주소 저장에 실패했습니다.')
  }
}

const openAddressModal = () => { isAddressModalOpen.value = true }
const closeAddressModal = () => { isAddressModalOpen.value = false }
const selectAddress = (id) => {
  selectedAddressId.value = id
}

const confirmAddressSelection = () => {
  if (selectedAddressId.value) {
    isAddressModalOpen.value = false
  }
}

const paymentOptions = [
  { value: 'CARD', label: '일반 결제', sub: '(신용/체크카드, 계좌이체, 간편결제 등)' },
]
 
const deliveryOptions = [
  { value: 'SHIPPING', label: '택배 거래', note: '안전한 비대면 배송 거래' },
  { value: 'DIRECT', label: '대면 거래', note: '직접 만나서 상품 확인 후 거래' },
]

const activeAddress = computed(() => {
  return addresses.value.find(a => a.id === selectedAddressId.value) || null
})

const filteredAddresses = computed(() => {
  if (!addressSearchQuery.value) return addresses.value
  const q = addressSearchQuery.value.toLowerCase()
  return addresses.value.filter(a => 
    a.recipientName.toLowerCase().includes(q) || 
    a.address1.toLowerCase().includes(q) || 
    a.recipientPhone.includes(q)
  )
})

const numericPrice = computed(() => listing.value?.price || 0)
const shippingFee = computed(() => 0)
const serviceFee = computed(() => Math.round(numericPrice.value * 0.015))
const paymentAmount = computed(() => numericPrice.value + shippingFee.value + serviceFee.value)

const goBack = () => {
  if (card.value) {
    router.push(`/cards/${card.value.id}`)
  } else {
    router.push('/cards')
  }
}

const handlePayment = async () => {
  if (!agreeEscrow.value || !agreePolicy.value) {
    alert('모든 약관에 동의해 주세요.')
    return
  }

  try {
    // 1. 백엔드 주문 생성 요청
    const finalShippingMessage = shippingMessageOption.value === '직접 입력' 
      ? customShippingMessage.value 
      : shippingMessageOption.value

    let orderData = {
      saleCardId: saleCardId.value,
      tradeType: tradeType.value,
      shippingMessage: finalShippingMessage
    }

    if (useNewAddress.value) {
      orderData = {
        ...orderData,
        receiverName: newAddressForm.value.recipientName,
        receiverPhone: newAddressForm.value.recipientPhone,
        zipCode: newAddressForm.value.zipCode,
        address: newAddressForm.value.address1,
        detailAddress: newAddressForm.value.address2
      }
      
      // Basic validation
      if (!orderData.receiverName || !orderData.address || !orderData.receiverPhone) {
        alert('배송지 정보(이름, 연락처, 주소)를 모두 입력해 주세요.')
        return
      }
    } else {
      orderData = {
        ...orderData,
        receiverName: activeAddress.value?.recipientName || authStore.user?.name || '',
        receiverPhone: activeAddress.value?.recipientPhone || authStore.user?.phoneNumber || '',
        zipCode: activeAddress.value?.zipCode || '',
        address: activeAddress.value?.address1 || '',
        detailAddress: activeAddress.value?.address2 || ''
      }
    }

    const orderResponse = await orderService.createOrder(orderData)

    if (orderResponse.status !== 200 && orderResponse.status !== 201) {
      alert('주문 생성에 실패했습니다: ' + orderResponse.message)
      return
    }

    const order = orderResponse.data // OrderResponseDto
    const amount = paymentAmount.value
    const orderName = card.value.cardName + (listing.value ? ' (' + listing.value.conditionGrade + ')' : '')

    // 2. 토스 페이먼츠 결제창 호출
    const tossPayments = TossPayments('test_ck_kYG57Eba3G9JWkmzN1zErpWDOxmA')
    
    tossPayments.requestPayment(paymentMethod.value, {
      amount: amount,
      orderId: order.tossOrderId,
      orderName: orderName,
      customerName: authStore.user?.name || authStore.user?.nickname || '구매자',
      successUrl: window.location.origin + '/order/success',
      failUrl: window.location.origin + '/order/fail',
      useEscrow: agreeEscrow.value,
    })
  } catch (err) {
    console.error('Order/Payment Error:', err)
    alert('오류가 발생했습니다: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div v-if="isLoading" class="loading-state container">
    <p>데이터를 불러오는 중입니다...</p>
  </div>
  <div v-else-if="card" class="checkout-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Checkout</p>
        <h1>구매하기</h1>
        <p>{{ card.cardName }} 구매 전 마지막 확인 단계입니다.</p>
      </div>
      <button type="button" class="back-button" @click="goBack">카드 상세로 돌아가기</button>
    </div>

    <div class="checkout-layout">
      <section class="checkout-main-card">
        <div class="section-block product-summary">
          <div class="summary-card-visual">
            <div v-if="listing?.imageUrls && listing.imageUrls.length > 0" class="listing-photo">
              <img :src="getImageUrl(listing.imageUrls[0])" :alt="listing.title">
            </div>
            <div v-else class="mini-card-shell">
              <div class="mini-card-head">
                <span>{{ card.cardName }}</span>
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
            <strong>{{ listing?.title || card.cardName }}</strong>
            <span>{{ card.cardSetName }} · {{ card.rarity }}</span>
            <small v-if="listing">
              {{ listing.sellerNickname }} · {{ listing.conditionGrade }} 등급
            </small>
            <small v-else>상세 정보를 불러올 수 없습니다.</small>
          </div>
        </div>

        <div class="section-block">
          <div class="block-head">
            <h2>거래 방식</h2>
            <p class="section-subtitle">배송 또는 직접 대면 중 하나를 선택하세요.</p>
          </div>
          <div class="toss-choice-grid">
            <label
              v-for="option in deliveryOptions"
              :key="option.value"
              class="toss-choice-card"
              :class="{ 'is-active': tradeType === option.value }"
            >
              <input type="radio" v-model="tradeType" :value="option.value" class="sr-only">
              <div class="choice-body">
                <strong>{{ option.label }}</strong>
                <span>{{ option.note }}</span>
              </div>
              <div class="choice-radio-ui"></div>
            </label>
          </div>
        </div>

        <div v-if="tradeType === 'SHIPPING'" class="section-block address-section-musinsa">
          <div class="section-top-row">
            <h2>배송지 정보</h2>
          </div>

          <!-- Musinsa Style Segmented Control -->
          <div class="segmented-control">
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: !useNewAddress }"
              @click="useNewAddress = false"
            >
              기본 배송지
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: useNewAddress }"
              @click="useNewAddress = true"
            >
              신규 배송지
            </button>
          </div>

          <!-- Tab 1: Saved Address View -->
          <div v-if="!useNewAddress" class="tab-content-musinsa animate-fade-in">
            <div v-if="activeAddress" class="read-only-address-card">
              <div class="card-top">
                <strong>{{ activeAddress.recipientName }}</strong>
                <span v-if="activeAddress.isDefault" class="badge-musinsa">기본 배송지</span>
                <button type="button" class="mini-change-btn" @click="openAddressModal">배송지 변경</button>
              </div>
              <p class="addr-detail">{{ activeAddress.address1 }} {{ activeAddress.address2 }}</p>
              <p class="addr-phone">{{ activeAddress.recipientPhone }}</p>
            </div>
            <div v-else class="empty-placeholder" @click="useNewAddress = true">
              <p>저장된 배송지가 없습니다. 신규 배송지를 입력해 주세요.</p>
            </div>
          </div>

          <!-- Tab 2: New Address Form -->
          <div v-else class="tab-content-musinsa animate-fade-in">
            <div class="musinsa-form">
              <div class="form-row-musinsa">
                <div class="input-block">
                  <label>수령인</label>
                  <input v-model="newAddressForm.recipientName" type="text" placeholder="수령인 이름을 입력하세요">
                </div>
              </div>
              <div class="form-row-musinsa">
                <div class="input-block">
                  <label>휴대전화</label>
                  <input 
                    v-model="newAddressForm.recipientPhone" 
                    type="tel" 
                    placeholder="숫자만 입력해 주세요"
                    @input="newAddressForm.recipientPhone = newAddressForm.recipientPhone.replace(/[^0-9]/g, '')"
                  >
                </div>
              </div>
              <div class="form-row-musinsa">
                <div class="input-block">
                  <label>배송지 주소</label>
                  <div class="zip-group">
                    <input v-model="newAddressForm.zipCode" type="text" readonly placeholder="우편번호">
                    <button type="button" class="black-zip-btn" @click="execDaumPostcode">우편번호 찾기</button>
                  </div>
                  <input v-model="newAddressForm.address1" type="text" readonly placeholder="기본 주소" class="read-only-box">
                  <input id="address2" v-model="newAddressForm.address2" type="text" placeholder="상세 주소를 입력하세요">
                </div>
              </div>
              <div class="form-footer-musinsa">
                <button type="button" class="musinsa-secondary-btn" @click="saveToAddressBook">
                  이 주소를 기본 배송지로 추가
                </button>
              </div>
            </div>
          </div>

          <!-- Shipping Message Area -->
          <div class="shipping-request-area">
            <div class="input-block">
              <label>배송 요청사항</label>
              <select v-model="shippingMessageOption" class="minimal-select">
                <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                <option value="배송 전 연락 바랍니다">배송 전 연락 바랍니다</option>
                <option value="직접 입력">직접 입력</option>
              </select>
            </div>
            <div v-if="shippingMessageOption === '직접 입력'" class="direct-input-box animate-fade-in">
              <textarea 
                v-model="customShippingMessage" 
                placeholder="최대 50자까지 입력 가능합니다." 
                maxlength="50"
                class="minimal-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="isAddressModalOpen" class="musinsa-modal-overlay" @click.self="closeAddressModal">
            <div class="musinsa-address-modal animate-slide-up">
              <div class="modal-header">
                <h3>배송지 정보</h3>
                <button type="button" class="close-btn" @click="closeAddressModal">&times;</button>
              </div>
              <div class="modal-content scrollbar-hidden">
                <div class="modal-search">
                  <input v-model="addressSearchQuery" type="text" placeholder="배송지 정보로 검색하세요">
                  <span class="search-icon">🔍</span>
                </div>
                <div class="modal-list">
                  <div 
                    v-for="addr in filteredAddresses" 
                    :key="addr.id" 
                    class="modal-item"
                    :class="{ selected: selectedAddressId === addr.id }"
                    @click="selectAddress(addr.id)"
                  >
                    <div class="item-radio">
                      <span class="radio-circle"></span>
                    </div>
                    <div class="item-body">
                      <div class="item-top">
                        <strong>{{ addr.recipientName }}</strong>
                        <span v-if="addr.isDefault" class="badge-sm">기본</span>
                      </div>
                      <p class="item-addr">{{ addr.address1 }} {{ addr.address2 }}</p>
                      <p class="item-phone">{{ addr.recipientPhone }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="footer-cancel-btn" @click="closeAddressModal">취소</button>
                <button type="button" class="footer-confirm-btn" @click="confirmAddressSelection">선택 완료</button>
              </div>
            </div>
          </div>
        </Teleport>

        <div class="section-block">
          <div class="block-head">
            <h2>결제 수단</h2>
            <p class="section-subtitle">안전한 결제를 위해 일반 결제 서비스를 제공합니다.</p>
          </div>
          <div class="toss-choice-grid">
            <label
              v-for="option in paymentOptions"
              :key="option.value"
              class="toss-choice-card payment"
              :class="{ 'is-active': paymentMethod === option.value }"
            >
              <input type="radio" v-model="paymentMethod" :value="option.value" class="sr-only">
              <div class="choice-body">
                <strong>{{ option.label }}</strong>
                <span v-if="option.sub" class="option-sub">{{ option.sub }}</span>
              </div>
              <div class="choice-radio-ui"></div>
            </label>
          </div>
        </div>

        <div class="section-block">
          <div class="block-head">
            <h2>약관 동의</h2>
            <p class="section-subtitle">결제 진행을 위해 꼭 필요한 약관입니다.</p>
          </div>
          <div class="toss-agreement-box">
            <label class="agreement-row all">
              <div class="agreement-check-wrapper">
                <input type="checkbox" v-model="agreeAll" class="sr-only">
                <div class="round-checkbox">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <strong>모두 동의하기</strong>
              </div>
            </label>
            <div class="agreement-divider"></div>
            <label class="agreement-row">
              <div class="agreement-check-wrapper">
                <input type="checkbox" v-model="agreeEscrow" class="sr-only">
                <div class="round-checkbox">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>에스크로 결제 보관 및 정산 구조 동의</span>
              </div>
            </label>
            <label class="agreement-row">
              <div class="agreement-check-wrapper">
                <input type="checkbox" v-model="agreePolicy" class="sr-only">
                <div class="round-checkbox">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>자동 구매 확정 및 분쟁 정책 안내 확인</span>
              </div>
            </label>
          </div>
        </div>

        <div class="submit-row">
          <button type="button" class="ghost-button" @click="goBack">취소</button>
          <button type="button" class="submit-button" @click="handlePayment">결제 진행</button>
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

@media (min-width: 1101px) {
  .checkout-side-card {
    position: sticky;
    top: 94px; /* Header 74px + 20px gap */
    align-self: start;
  }
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
  width: 140px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
}

.listing-photo img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
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
  color: var(--color-primary-text);
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
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.block-head {
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-top: 6px;
  font-weight: 500;
}

/* Toss Style Choice Grid */
.toss-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

/* Toss Choice Card */
.toss-choice-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.toss-choice-card:hover {
  transform: translateY(-2px);
  border-color: #adb5bd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.toss-choice-card.is-active {
  background: #f2f7ff;
  border-color: #3182f6;
}

.choice-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.choice-body strong {
  font-size: 1.15rem;
  color: var(--color-text-strong);
  transition: color 0.2s;
  font-weight: 800;
}

.toss-choice-card.is-active .choice-body strong {
  color: #3182f6;
}

.choice-body span {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.option-sub {
  font-size: 0.82rem !important;
  color: #868e96 !important;
  font-weight: 500;
}

/* Choice Radio UI (Dot style) */
.choice-radio-ui {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  position: relative;
  transition: all 0.25s;
}

.toss-choice-card.is-active .choice-radio-ui {
  border-color: #3182f6;
  background: #3182f6;
}

.choice-radio-ui::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 9px;
  height: 9px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toss-choice-card.is-active .choice-radio-ui::after {
  transform: translate(-50%, -50%) scale(1);
}

/* sr-only Utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Musinsa Style Address Section Overhaul */
.address-section-musinsa {
  margin-bottom: 40px;
}

.section-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.segmented-control {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 32px;
}

.segment-btn {
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.segment-btn.active {
  color: #000;
  font-weight: 800;
}

.segment-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #000;
}

.tab-content-musinsa {
  margin-bottom: 32px;
}

/* Saved Address Card */
.read-only-address-card {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fff;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-top strong {
  font-size: 1.1rem;
  font-weight: 800;
}

.badge-musinsa {
  background: #f0f0f0;
  color: #666;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 2px;
  font-weight: 700;
}

.mini-change-btn {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.mini-change-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.addr-detail {
  font-size: 1rem;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.5;
}

.addr-phone {
  font-size: 0.95rem;
  color: #888;
}

/* Musinsa Form Styling */
.musinsa-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row-musinsa {
  display: flex;
  flex-direction: column;
}

.input-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-block label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
}

.input-block input,
.input-block select,
.input-block textarea {
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 0;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.input-block input:focus,
.input-block select:focus,
.input-block textarea:focus {
  outline: none;
  border-color: #000;
}

.zip-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.zip-group input { flex: 1; }

.black-zip-btn {
  padding: 0 16px;
  background: #000;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
}

.read-only-box {
  background: #f9f9f9;
  color: #777;
  margin-bottom: 8px;
}

.form-footer-musinsa {
  margin-top: 8px;
}

.check-label-minimal {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.custom-check-musinsa {
  width: 18px;
  height: 18px;
  accent-color: #000;
}

/* Shipping Request Area */
.shipping-request-area {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #eee;
}

.minimal-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  width: 100%;
}

.direct-input-box {
  margin-top: 12px;
}

.minimal-textarea {
  width: 100%;
  height: 80px;
  resize: none;
}

/* Modal Overlay & Base */
.musinsa-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.musinsa-address-modal {
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  background: var(--color-panel);
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 90px rgba(0,0,0,0.2);
  border-radius: 28px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--color-text-strong);
}

.close-btn {
  background: var(--color-panel-soft);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 28px 24px;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  background: var(--color-panel);
}

.footer-cancel-btn,
.footer-confirm-btn {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-cancel-btn {
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
}

.footer-confirm-btn {
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
}

.footer-cancel-btn:hover,
.footer-confirm-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.modal-search {
  position: relative;
  margin-bottom: 24px;
}

.modal-search input {
  width: 100%;
  padding: 16px 16px 16px 44px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  border-radius: 14px;
  font-size: 0.95rem;
  color: var(--color-text-strong);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
}

.modal-list {
  display: flex;
  flex-direction: column;
}

.modal-item {
  display: flex;
  gap: 16px;
  padding: 24px;
  border-radius: 18px;
  background: var(--color-panel-soft);
  margin-bottom: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.modal-item:hover {
  background: var(--color-background-elevated);
  transform: scale(0.985);
}

.modal-item.selected {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-panel));
}

.item-radio .radio-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  display: block;
}

.modal-item.selected .radio-circle {
  border: 6px solid var(--color-primary);
}

.item-body { flex: 1; }

.item-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.item-top strong {
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--color-text-strong);
}

.badge-sm {
  font-size: 11px;
  background: var(--color-primary);
  padding: 3px 8px;
  color: var(--color-primary-text);
  border-radius: 4px;
  font-weight: 800;
}

.item-addr {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin-bottom: 4px;
  line-height: 1.5;
}

.item-phone {
  font-size: 0.88rem;
  color: var(--color-text-subtle);
}

.musinsa-secondary-btn {
  width: 100%;
  padding: 14px;
  background: #fff;
  border: 1px solid #000;
  color: #000;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.musinsa-secondary-btn:hover {
  background: #f9f9f9;
}

.empty-placeholder {
  padding: 60px 20px;
  border: 1px dashed #ddd;
  text-align: center;
  cursor: pointer;
}

.empty-placeholder p {
  color: #999;
  font-weight: 600;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scrollbar-hidden::-webkit-scrollbar { display: none; }

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

.toss-agreement-box {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  margin-top: 12px;
}

.agreement-row {
  display: block;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.agreement-row:hover {
  background: rgba(0,0,0,0.02);
}

.agreement-check-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agreement-row.all {
  background: rgba(0,0,0,0.02);
}

.agreement-row.all strong {
  font-size: 1.1rem;
  color: var(--color-text-strong);
  font-weight: 800;
}

.agreement-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 24px;
}

/* Custom Round Checkbox UI */
.round-checkbox {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
  background: #fff;
  flex-shrink: 0;
}

input:checked + .round-checkbox {
  background: #3182f6;
  border-color: #3182f6;
}

.round-checkbox svg {
  width: 16px;
  height: 16px;
  transform: scale(0);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

input:checked + .round-checkbox svg {
  transform: scale(1);
}

.agreement-row span {
  font-size: 1rem;
  color: var(--color-text-muted);
  font-weight: 500;
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
  color: var(--color-primary-text);
}

.checkout-side-card {
  padding: 16px;
}

.sticky-panel {
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

.metric-list strong {
  color: var(--color-text-strong);
  font-weight: 600;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 24px 0 0;
  border-top: 1px solid var(--color-border);
}

.total-box span {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-strong);
}

.total-box strong {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.tip-list {
  margin: 0;
  padding-left: 18px;
}

.notice-box {
  background: var(--color-panel-soft);
  border: 1px dashed var(--color-primary);
}

/* Address Tabs Styling */
.address-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: var(--color-panel-soft);
  padding: 6px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
}

.address-tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 800;
  font-size: 0.95rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.address-tab-btn.active {
  background: var(--color-primary);
  color: var(--color-primary-text);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.empty-address {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-subtle);
  background: var(--color-panel-soft);
  border-radius: 24px;
  border: 1px dashed var(--color-border);
}

/* New Address Form Styling (Refined) */
.new-address-form {
  margin-top: 24px;
  padding: 32px;
  background: var(--color-background-elevated);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border: 1px solid var(--color-border);
}

.form-section {
  display: grid;
  gap: 18px;
}

.form-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text-strong);
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row.split {
  flex-direction: row;
}

.form-row.split .input-group {
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.input-group input {
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-strong);
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}

.zip-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.zip-row input {
  flex: 1;
}

.zip-btn {
  padding: 0 20px;
  background: var(--color-text-strong);
  color: var(--color-primary-text);
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
}

.full-addr {
  margin-bottom: 8px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.address-save-check {
  margin-top: 8px;
  padding: 16px;
  background: var(--color-background);
  border-radius: 16px;
  border: 1px dashed var(--color-border);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: 1fr;
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

  .form-row.split {
    flex-direction: column;
  }

  .submit-row {
    justify-content: stretch;
  }
}
</style>
