<script setup>
import { ref } from 'vue'

const form = ref({
  gameType: '포켓몬',
  setName: '',
  cardName: '',
  cardNumber: '',
  note: '',
})
</script>

<template>
  <div class="card-request-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Card Request</p>
        <h1>카드 추가 요청</h1>
        <p>도감에 없는 카드를 운영팀에 등록 요청할 수 있습니다.</p>
      </div>
    </div>

    <section class="request-card">
      <div class="form-grid two">
        <label class="field">
          <span>게임</span>
          <select v-model="form.gameType">
            <option>포켓몬</option>
            <option>유희왕</option>
            <option>원피스 카드게임</option>
          </select>
        </label>
        <label class="field">
          <span>세트명</span>
          <input v-model="form.setName" type="text" placeholder="예: 포켓몬 카드 151">
        </label>
      </div>
      <div class="form-grid two">
        <label class="field">
          <span>카드명</span>
          <input v-model="form.cardName" type="text" placeholder="예: 피카츄 마스터볼 미러">
        </label>
        <label class="field">
          <span>카드번호</span>
          <input v-model="form.cardNumber" type="text" placeholder="예: 025/165">
        </label>
      </div>
      <label class="field">
        <span>요청 메모</span>
        <textarea v-model="form.note" rows="6" placeholder="희망 언어, 참고 이미지 설명, 요청 이유 등을 적어 주세요." />
      </label>
      <div class="submit-row">
        <button type="button" class="submit-button">요청 등록</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.card-request-page { padding: 40px 0 80px; }
.eyebrow {
  margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
.page-head h1 { margin: 0; color: var(--color-text-strong); }
.page-head p, .field span { color: var(--color-text-muted); }
.request-card {
  margin-top: 24px; border: 1px solid var(--color-border); border-radius: 28px; background: var(--color-panel); box-shadow: var(--shadow-soft); padding: 28px;
}
.form-grid { display: grid; gap: 16px; margin-bottom: 16px; }
.form-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field { display: grid; gap: 8px; }
.field input, .field textarea, .field select {
  width: 100%; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-background-elevated); padding: 14px 16px; color: var(--color-text-strong);
}
.submit-row { display: flex; justify-content: flex-end; margin-top: 24px; }
.submit-button {
  padding: 14px 22px; border: 0; border-radius: 16px; background: var(--color-primary); color: #2c2407; font-weight: 800;
}
@media (max-width: 720px) {
  .form-grid.two { grid-template-columns: 1fr; }
}
</style>
