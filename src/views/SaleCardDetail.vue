<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSaleCardById, getStoreByName } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const listing = computed(() => getSaleCardById(route.params.saleCardId))
const card = computed(() => listing.value?.card)

const goCard = () => {
  if (card.value) {
    router.push(`/cards/${card.value.id}`)
  } else {
    router.push('/cards')
  }
}

const goCheckout = () => {
  if (listing.value) {
    router.push({ path: '/orders/checkout', query: { saleCardId: listing.value.id } })
  }
}

const goStore = () => {
  const store = getStoreByName(listing.value?.seller)
  if (store) {
    router.push(`/stores/${store.id}`)
  }
}

const inquiryText = ref('')
const comments = ref([
  { id: 1, writer: '카드수집러', content: '빛반사 제외하고 뒷면 코너 사진도 추가 가능할까요?', time: '2시간 전' },
  { id: 2, writer: '판매자', content: '네 가능합니다. 오늘 저녁에 추가 업로드하겠습니다.', time: '1시간 전' },
])

const addComment = () => {
  if (!inquiryText.value.trim()) return
  comments.value.unshift({
    id: Date.now(),
    writer: '내 문의',
    content: inquiryText.value.trim(),
    time: '방금 전',
  })
  inquiryText.value = ''
}
</script>

<template>
  <div v-if="listing && card" class="listing-detail-page container">
    <section class="listing-shell">
      <div class="visual-block">
        <button type="button" class="back-link" @click="goCard">카드 상세로 돌아가기</button>
        <div class="listing-photo">
          <img :src="listing.imageUrl" :alt="listing.title">
        </div>
      </div>

      <div class="info-block">
        <p class="eyebrow">{{ card.setName }}</p>
        <h1>{{ listing.title }}</h1>
        <p class="subcopy">{{ card.name }} · {{ card.cardNumber }} · {{ card.rarity }}</p>

        <div class="price-line">
          <strong>{{ listing.price }}</strong>
          <span class="grade-chip">{{ listing.conditionGrade }}</span>
        </div>

        <div class="seller-strip">
          <button type="button" class="seller-link" @click="goStore">{{ listing.seller }}</button>
          <small>{{ listing.date }} 등록</small>
        </div>

        <div class="trust-row">
          <div><strong>실물 사진</strong><span>판매자 등록 이미지 기준</span></div>
          <div><strong>에스크로</strong><span>구매 확정 전 결제 보관</span></div>
          <div><strong>안심거래</strong><span>분쟁 정책 적용</span></div>
        </div>

        <div class="meta-table">
          <div><span>상태 등급</span><strong>{{ listing.conditionGrade }}</strong></div>
          <div><span>감정사</span><strong>{{ listing.gradingCompany === 'NONE' ? '미감정' : listing.gradingCompany }}</strong></div>
          <div><span>감정 점수</span><strong>{{ listing.gradingScore || '-' }}</strong></div>
          <div><span>출품 상태</span><strong>{{ listing.status }}</strong></div>
          <div><span>조회수</span><strong>{{ listing.viewCount }}</strong></div>
          <div><span>관심 수</span><strong>{{ listing.favoriteCount }}</strong></div>
          <div><span>판매자</span><strong>{{ listing.seller }}</strong></div>
        </div>

        <section class="description-box">
          <h2>상품 설명</h2>
          <p>{{ listing.description }}</p>
        </section>

        <section class="comment-box">
          <div class="comment-head">
            <h2>상품 문의</h2>
            <span>{{ comments.length }}개</span>
          </div>
          <div class="comment-form">
            <textarea v-model="inquiryText" rows="4" placeholder="판매자에게 궁금한 점을 남겨 보세요." />
            <button type="button" class="comment-submit" @click="addComment">문의 등록</button>
          </div>
          <div class="comment-list">
            <article v-for="comment in comments" :key="comment.id" class="comment-row">
              <div class="comment-meta">
                <strong>{{ comment.writer }}</strong>
                <small>{{ comment.time }}</small>
              </div>
              <p>{{ comment.content }}</p>
            </article>
          </div>
        </section>

        <div class="action-bar">
          <button type="button" class="ghost-button" @click="goCard">다른 출품 보기</button>
          <button type="button" class="primary-button" @click="goCheckout">구매 절차로</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.listing-detail-page {
  padding: 36px 0 80px;
}

.listing-shell {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 460px);
  gap: 28px;
}

.visual-block,
.info-block {
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.visual-block {
  padding: 18px;
}

.info-block {
  padding: 28px;
}

.back-link {
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  border-radius: 999px;
  padding: 10px 16px;
}

.listing-photo {
  overflow: hidden;
  border-radius: 24px;
  background: var(--color-panel-soft);
}

.listing-photo img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.info-block h1,
.description-box h2 {
  margin: 0;
  color: var(--color-text-strong);
}

.subcopy,
.seller-strip small,
.trust-row span,
.description-box p,
.meta-table span {
  color: var(--color-text-muted);
}

.subcopy {
  margin: 8px 0 18px;
}

.price-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.price-line strong {
  font-size: 2rem;
  color: #d93a2f;
}

.grade-chip {
  padding: 6px 10px;
  border-radius: 12px;
  background: #222;
  color: var(--color-primary-text);
  font-weight: 800;
}

.seller-strip {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.seller-strip span,
.meta-table strong,
.trust-row strong {
  color: var(--color-text-strong);
  font-weight: 700;
}

.seller-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-weight: 700;
}

.trust-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 22px 0;
}

.trust-row div {
  padding: 14px;
  border-radius: 16px;
  background: var(--color-background-elevated);
  display: grid;
  gap: 6px;
  text-align: center;
}

.meta-table {
  border-top: 1px solid var(--color-border);
}

.meta-table div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.description-box {
  margin-top: 22px;
  padding: 20px;
  border-radius: 20px;
  background: var(--color-background-elevated);
}

.description-box h2,
.comment-head h2 {
  font-size: 1rem;
  margin-bottom: 12px;
  color: var(--color-text-strong);
}

.description-box p {
  margin: 0;
  line-height: 1.7;
}

.comment-box {
  margin-top: 18px;
  padding: 20px;
  border-radius: 20px;
  background: var(--color-background-elevated);
}

.comment-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.comment-head span,
.comment-meta small,
.comment-row p {
  color: var(--color-text-muted);
}

.comment-form {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-form textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-panel);
  padding: 14px 16px;
  color: var(--color-text-strong);
}

.comment-submit {
  width: fit-content;
  justify-self: end;
  padding: 12px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: #2c2407;
  font-weight: 800;
}

.comment-list {
  display: grid;
  gap: 12px;
}

.comment-row {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-meta strong {
  color: var(--color-text-strong);
}

.comment-row p {
  margin: 0;
  line-height: 1.6;
}

.action-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}

.ghost-button,
.primary-button {
  padding: 16px 18px;
  border-radius: 16px;
  font-weight: 800;
}

.ghost-button {
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
}

.primary-button {
  border: 0;
  background: #19b6b8;
  color: var(--color-primary-text);
}

@media (max-width: 960px) {
  .listing-shell,
  .trust-row,
  .action-bar {
    grid-template-columns: 1fr;
  }
}
</style>
