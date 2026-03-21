<script setup>
import { ref } from 'vue'

const addresses = ref([
  {
    id: 'home',
    label: '집',
    name: '홍길동',
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123, 101동 1201호',
    isDefault: true,
  },
  {
    id: 'office',
    label: '회사',
    name: '홍길동',
    phone: '010-9876-5432',
    address: '서울특별시 서초구 서초대로 55, 8층',
    isDefault: false,
  },
])
</script>

<template>
  <div class="address-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Address</p>
        <h1>배송지 관리</h1>
        <p>기본 배송지와 최근 사용하는 배송지를 관리합니다.</p>
      </div>
      <button type="button" class="add-button">배송지 추가</button>
    </div>

    <section class="address-grid">
      <article v-for="address in addresses" :key="address.id" class="address-card">
        <div class="address-top">
          <strong>{{ address.label }}</strong>
          <span v-if="address.isDefault" class="default-chip">기본 배송지</span>
        </div>
        <p>{{ address.name }} · {{ address.phone }}</p>
        <small>{{ address.address }}</small>
        <div class="address-actions">
          <button type="button">수정</button>
          <button type="button">{{ address.isDefault ? '기본 적용중' : '기본으로 설정' }}</button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.address-page { padding: 40px 0 80px; }
.page-head {
  display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px;
}
.eyebrow {
  margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
.page-head h1, .address-card strong { color: var(--color-text-strong); margin: 0; }
.page-head p, .address-card p, .address-card small { color: var(--color-text-muted); }
.add-button, .address-actions button {
  border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong);
}
.add-button { padding: 12px 16px; border-radius: 999px; }
.address-grid { display: grid; gap: 16px; }
.address-card {
  border: 1px solid var(--color-border); border-radius: 24px; background: var(--color-panel); box-shadow: var(--shadow-soft); padding: 22px; display: grid; gap: 10px;
}
.address-top {
  display: flex; justify-content: space-between; gap: 12px; align-items: center;
}
.default-chip {
  padding: 7px 12px; border-radius: 999px; background: var(--color-primary); color: #2c2407; font-weight: 800;
}
.address-actions { display: flex; gap: 10px; margin-top: 6px; }
.address-actions button { padding: 10px 14px; border-radius: 12px; font-weight: 700; }
</style>
