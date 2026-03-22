<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);

const submitVerify = () => {
  if (!password.value.trim()) {
    errorMessage.value = '비밀번호를 입력해 주세요.';
    return;
  }

  if (password.value !== '1234') {
    errorMessage.value = '비밀번호가 올바르지 않습니다.';
    return;
  }

  isSubmitting.value = true;
  sessionStorage.setItem('account-edit-verified', 'true');
  router.push('/mypage/account/edit');
};
</script>

<template>
  <div class="account-flow container">
    <section class="account-panel">
      <p class="account-kicker">ACCOUNT SECURITY</p>
      <h1>비밀번호 재입력</h1>
      <p class="account-description">
        계정 정보 수정 전 본인 확인이 필요합니다. 비밀번호를 다시 입력해 주세요.
      </p>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input id="password" v-model="password" type="password" placeholder="비밀번호 입력" @keyup.enter="submitVerify" />
        <span class="helper-text">데모 비밀번호는 <strong>1234</strong> 입니다.</span>
      </div>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="actions">
        <button type="button" class="secondary-button" @click="router.push('/mypage')">취소</button>
        <button type="button" class="primary-button" :disabled="isSubmitting" @click="submitVerify">확인</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.account-flow {
  max-width: 640px;
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

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font: inherit;
  box-sizing: border-box;
}

.helper-text {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-light);
}

.error-text {
  margin-top: 14px;
  color: #dc2626;
  font-size: 14px;
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
</style>
