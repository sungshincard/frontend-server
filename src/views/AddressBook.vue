<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../services/api' 

const addresses = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  recipientName: '',
  recipientPhone: '',
  zipCode: '',
  address1: '',
  address2: '',
  isDefault: false
})

const fetchAddresses = async () => {
  try {
    const res = await apiClient.get('/member/addresses')
    addresses.value = res.data
  } catch (error) {
    alert('배송지 목록을 불러오지 못했습니다.')
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    recipientName: '',
    recipientPhone: '',
    zipCode: '',
    address1: '',
    address2: '',
    isDefault: false
  }
  showModal.value = true
}

const openEditModal = (address) => {
  isEditing.value = true
  editingId.value = address.id
  form.value = {
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    zipCode: address.zipCode,
    address1: address.address1,
    address2: address.address2,
    isDefault: address.isDefault
  }
  showModal.value = true
}

const saveAddress = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/member/addresses/${editingId.value}`, form.value)
      alert('배송지가 수정되었습니다.')
    } else {
      await apiClient.post('/member/addresses', form.value)
      alert('배송지가 추가되었습니다.')
    }
    showModal.value = false
    fetchAddresses()
  } catch (error) {
    alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.')
  }
}

const deleteAddress = async (id) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await apiClient.delete(`/member/addresses/${id}`)
    alert('배송지가 삭제되었습니다.')
    fetchAddresses()
  } catch (error) {
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const setDefault = async (id) => {
  try {
    await apiClient.patch(`/member/addresses/${id}/default`)
    fetchAddresses()
  } catch (error) {
    alert('기본 배송지 설정 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<template>
  <div class="address-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Address</p>
        <h1>배송지 관리</h1>
        <p>기본 배송지와 최근 사용하는 배송지를 관리합니다.</p>
      </div>
      <button type="button" class="add-button" @click="openAddModal">배송지 추가</button>
    </div>

    <section class="address-grid">
      <div v-if="addresses.length === 0" class="empty-state">
        등록된 배송지가 없습니다.
      </div>
      <article v-for="addr in addresses" :key="addr.id" class="address-card">
        <div class="address-top">
          <strong>{{ addr.recipientName }}</strong>
          <span v-if="addr.isDefault" class="default-chip">기본 배송지</span>
        </div>
        <p>{{ addr.recipientPhone }}</p>
        <small>[{{ addr.zipCode }}] {{ addr.address1 }} {{ addr.address2 }}</small>
        <div class="address-actions">
          <button type="button" @click="openEditModal(addr)">수정</button>
          <button type="button" @click="deleteAddress(addr.id)">삭제</button>
          <button type="button" @click="setDefault(addr.id)" :disabled="addr.isDefault">
            {{ addr.isDefault ? '기본 적용중' : '기본으로 설정' }}
          </button>
        </div>
      </article>
    </section>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditing ? '배송지 수정' : '새 배송지 추가' }}</h2>
        <form @submit.prevent="saveAddress" class="address-form">
          <label>수령인
            <input v-model="form.recipientName" type="text" required />
          </label>
          <label>연락처
            <input v-model="form.recipientPhone" type="text" placeholder="010-1234-5678" required />
          </label>
          <label>우편번호
            <input v-model="form.zipCode" type="text" required />
          </label>
          <label>기본 주소
            <input v-model="form.address1" type="text" required />
          </label>
          <label>상세 주소
            <input v-model="form.address2" type="text" />
          </label>
          <label class="checkbox-label">
            <input v-model="form.isDefault" type="checkbox" />
            기본 배송지로 설정
          </label>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showModal = false">취소</button>
            <button type="submit" class="submit-btn">저장</button>
          </div>
        </form>
      </div>
    </div>
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
.add-button { padding: 12px 16px; border-radius: 999px; cursor: pointer; }
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
.address-actions button { padding: 10px 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.address-actions button:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state { text-align: center; color: var(--color-text-muted); padding: 40px; }

/* Modal Styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background: var(--color-panel); padding: 32px; border-radius: 24px; width: 100%; max-width: 480px; box-shadow: var(--shadow-float); color: var(--color-text-strong); border: 1px solid var(--color-border);
}
.modal-content h2 { margin-top: 0; margin-bottom: 24px; }
.address-form { display: grid; gap: 16px; }
.address-form label { display: grid; gap: 6px; font-size: 0.9rem; color: var(--color-text-muted); }
.address-form input[type="text"] {
  padding: 12px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text-strong);
}
.checkbox-label { display: flex !important; flex-direction: row !important; align-items: center; gap: 8px; font-size: 1rem !important; color: var(--color-text-strong) !important; cursor: pointer; }
.modal-actions { display: flex; justify-content:flex-end; gap: 12px; margin-top: 16px; }
.cancel-btn { padding: 12px 20px; border-radius: 12px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-strong); cursor: pointer; }
.submit-btn { padding: 12px 20px; border-radius: 12px; border: none; background: var(--color-primary); color: #000; font-weight: bold; cursor: pointer; }
</style>
