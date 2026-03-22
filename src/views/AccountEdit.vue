<script setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

if (sessionStorage.getItem('account-edit-verified') !== 'true') {
  router.replace('/mypage/account/verify');
}

const profile = computed(() => authStore.user);

const form = reactive({
  nickname: profile.value?.nickname || '',
  name: profile.value?.name || '',
  phoneNumber: profile.value?.phoneNumber || '',
  birthDate: profile.value?.birthDate || '',
  gender: profile.value?.gender || 'NONE',
});

const saveAccount = () => {
  authStore.setUser({
    ...authStore.user,
    nickname: form.nickname,
    name: form.name,
    phoneNumber: form.phoneNumber,
    birthDate: form.birthDate,
    gender: form.gender,
    store: {
      ...authStore.user.store,
      storeName: authStore.user.store?.storeName || form.nickname,
    },
  });

  sessionStorage.removeItem('account-edit-verified');
  router.push('/mypage');
};
</script>

<template>
  <div class="account-flow container">
    <section class="account-panel">
      <p class="account-kicker">ACCOUNT EDIT</p>
      <h1>계정 정보 수정</h1>
      <p class="account-description">
        수정한 계정 정보는 마이페이지와 상점 정보에 즉시 반영됩니다.
      </p>

      <div class="form-grid">
        <div class="form-group">
          <label>닉네임</label>
          <input v-model="form.nickname" type="text" />
        </div>
        <div class="form-group">
          <label>이름</label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="form-group">
          <label>휴대폰 번호</label>
          <input v-model="form.phoneNumber" type="tel" />
        </div>
        <div class="form-group">
          <label>생년월일</label>
          <input v-model="form.birthDate" type="date" />
        </div>
        <div class="form-group">
          <label>성별</label>
          <select v-model="form.gender">
            <option value="NONE">선택 안 함</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </select>
        </div>
        <div class="form-group readonly">
          <label>이메일</label>
          <div class="readonly-box">{{ profile?.email }}</div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="secondary-button" @click="router.push('/mypage')">취소</button>
        <button type="button" class="primary-button" @click="saveAccount">저장</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.account-flow {
  max-width: 860px;
  padding: 48px 20px 80px;
}

.account-panel {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

.account-kicker {
  margin-bottom: 10px;
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: var(--color-text-light);
}

.account-panel h1 {
  margin-bottom: 12px;
  font-size: 30px;
  letter-spacing: -0.04em;
}

.account-description {
  margin-bottom: 24px;
  color: var(--color-text-light);
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font: inherit;
  box-sizing: border-box;
  background: white;
}

.readonly-box {
  min-height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #f8fafc;
  color: var(--color-text-light);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
}

.primary-button,
.secondary-button {
  min-width: 112px;
  padding: 11px 18px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.primary-button {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.secondary-button {
  background: white;
  color: var(--color-text);
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
