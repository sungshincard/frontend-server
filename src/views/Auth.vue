<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import apiClient from '../services/api';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);

// 공통
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

// 회원가입 전용
const nickname = ref('');
const name = ref('');
const phoneNumber = ref('');
const birthDate = ref('');
const gender = ref('NONE');
const agreeTerms = ref(false);
const agreePrivacy = ref(false);
const agreeAge = ref(false);

// 프로필 이미지 (선택사항)
const profileImagePreview = ref(null);
const profileImageInput = ref(null);

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '이미지 파일만 업로드 가능합니다.';
    return;
  }
  const reader = new FileReader();
  reader.onload = (evt) => {
    profileImagePreview.value = evt.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  profileImagePreview.value = null;
  if (profileImageInput.value) profileImageInput.value.value = '';
};

const mockLoginOptions = [
  {
    profileKey: 'USER',
    title: '일반 유저',
    description: '내 상점과 판매 상품 관리 화면을 바로 확인합니다.'
  },
  {
    profileKey: 'ADMIN',
    title: '관리자',
    description: '운영자 시점의 보호 화면 접근을 빠르게 확인합니다.'
  }
];

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  successMessage.value = '';
  email.value = '';
  password.value = '';
  passwordConfirm.value = '';
  nickname.value = '';
  name.value = '';
  phoneNumber.value = '';
  birthDate.value = '';
  gender.value = 'NONE';
  agreeTerms.value = false;
  agreePrivacy.value = false;
  agreeAge.value = false;
  profileImagePreview.value = null;
};

const handleMockLogin = (profileKey) => {
  errorMessage.value = '';
  successMessage.value = '';
  authStore.loginWithMock(profileKey);
  router.push('/');
};

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해 주세요.';
    return;
  }

  if (!isLogin.value) {
    if (!nickname.value || !name.value || !phoneNumber.value || !birthDate.value) {
      errorMessage.value = '모든 필수 항목을 입력해 주세요.';
      return;
    }
    if (password.value !== passwordConfirm.value) {
      errorMessage.value = '비밀번호가 일치하지 않습니다.';
      return;
    }
    if (!agreeTerms.value || !agreePrivacy.value || !agreeAge.value) {
      errorMessage.value = '필수 약관에 모두 동의해 주세요.';
      return;
    }
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    if (isLogin.value) {
      const response = await apiClient.post('/member/login', {
        email: email.value,
        password: password.value
      });
      const token = response.data;
      if (token) {
        authStore.setToken(token);
        router.push('/');
      } else {
        errorMessage.value = '토큰을 받지 못했습니다. 다시 시도해 주세요.';
      }
    } else {
      await apiClient.post('/member/join', {
        email: email.value,
        password: password.value,
        nickname: nickname.value,
        name: name.value,
        phoneNumber: phoneNumber.value,
        birthDate: birthDate.value,
        gender: gender.value,
        profileImageUrl: profileImagePreview.value || null
      });
      successMessage.value = '회원가입이 완료되었습니다! 로그인해 주세요.';
      isLogin.value = true;
    }
  } catch (error) {
    console.error('Auth error:', error);
    errorMessage.value = error.response?.data?.message || '처리 중 오류가 발생했습니다. 다시 시도해 주세요.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">{{ isLogin ? '로그인' : '회원가입' }}</h1>
      <p class="auth-subtitle">
        {{ isLogin ? 'Card Mall에 오신 것을 환영합니다.' : '계정을 만들어 카드 거래를 시작하세요.' }}
      </p>

      <section class="mock-login-panel">
        <div class="mock-login-copy">
          <strong>빠른 목 로그인</strong>
          <span>백엔드 연동 전 일반 유저의 내 상점 화면과 관리자 화면을 바로 확인할 수 있습니다.</span>
        </div>
        <div class="mock-login-grid">
          <button
            v-for="option in mockLoginOptions"
            :key="option.profileKey"
            type="button"
            class="mock-login-button"
            @click="handleMockLogin(option.profileKey)"
          >
            <strong>{{ option.title }}</strong>
            <span>{{ option.description }}</span>
          </button>
        </div>
      </section>

      <form @submit.prevent="handleSubmit" class="auth-form">

        <!-- 이메일 -->
        <div class="form-group">
          <label for="email">이메일 <span class="required">*</span></label>
          <input type="email" id="email" v-model="email" placeholder="example@email.com" required />
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label for="password">비밀번호 <span class="required">*</span></label>
          <input type="password" id="password" v-model="password" placeholder="비밀번호를 입력해 주세요" required />
        </div>

        <!-- 비밀번호 확인 (회원가입 시만) -->
        <div v-if="!isLogin" class="form-group">
          <label for="passwordConfirm">비밀번호 확인 <span class="required">*</span></label>
          <input
            type="password"
            id="passwordConfirm"
            v-model="passwordConfirm"
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            required
          />
          <span v-if="passwordConfirm && password !== passwordConfirm" class="form-hint error-hint">
            비밀번호가 일치하지 않습니다.
          </span>
          <span v-if="passwordConfirm && password === passwordConfirm" class="form-hint ok-hint">
            비밀번호가 일치합니다. ✓
          </span>
        </div>

        <!-- 회원가입 전용 필드 -->
        <template v-if="!isLogin">

          <div class="form-divider"><span>추가 정보 입력</span></div>

          <!-- 프로필 이미지 (선택) -->
          <div class="form-group image-upload-group">
            <label>프로필 사진 <span class="optional-tag">선택</span></label>
            <div class="avatar-upload-area" @click="profileImageInput.click()">
              <img v-if="profileImagePreview" :src="profileImagePreview" class="avatar-preview" alt="프로필 미리보기" />
              <div v-else class="avatar-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>사진 추가</span>
              </div>
            </div>
            <div v-if="profileImagePreview" class="image-actions">
              <button type="button" class="btn-remove-image" @click.stop="removeImage">× 이미지 제거</button>
            </div>
            <input
              ref="profileImageInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageChange"
            />
            <span class="form-hint">JPG, PNG, GIF 등. 미입력 시 기본 이미지가 사용됩니다.</span>
          </div>

          <!-- 닉네임 -->
          <div class="form-group">
            <label for="nickname">닉네임 <span class="required">*</span></label>
            <input type="text" id="nickname" v-model="nickname" placeholder="사용할 닉네임을 입력해 주세요" required />
            <span class="form-hint">다른 사용자에게 공개되는 이름입니다.</span>
          </div>

          <!-- 실명 -->
          <div class="form-group">
            <label for="name">이름 <span class="required">*</span></label>
            <input type="text" id="name" v-model="name" placeholder="실명을 입력해 주세요" required />
          </div>

          <!-- 휴대폰 번호 -->
          <div class="form-group">
            <label for="phoneNumber">휴대폰 번호 <span class="required">*</span></label>
            <input type="tel" id="phoneNumber" v-model="phoneNumber" placeholder="010-1234-5678" required />
          </div>

          <!-- 생년월일 -->
          <div class="form-group">
            <label for="birthDate">생년월일 <span class="required">*</span></label>
            <input type="date" id="birthDate" v-model="birthDate" required />
          </div>

          <!-- 성별 -->
          <div class="form-group">
            <label>성별</label>
            <div class="gender-group">
              <label class="gender-item" :class="{ active: gender === 'MALE' }">
                <input type="radio" v-model="gender" value="MALE" />
                남성
              </label>
              <label class="gender-item" :class="{ active: gender === 'FEMALE' }">
                <input type="radio" v-model="gender" value="FEMALE" />
                여성
              </label>
              <label class="gender-item" :class="{ active: gender === 'NONE' }">
                <input type="radio" v-model="gender" value="NONE" />
                선택 안 함
              </label>
            </div>
          </div>

          <!-- 약관 동의 -->
          <div class="form-divider"><span>약관 동의</span></div>
          <div class="terms-group">
            <label class="term-item required-term">
              <input type="checkbox" v-model="agreeTerms" /> [필수] 이용약관 동의
            </label>
            <label class="term-item required-term">
              <input type="checkbox" v-model="agreePrivacy" /> [필수] 개인정보 수집 및 이용 동의
            </label>
            <label class="term-item required-term">
              <input type="checkbox" v-model="agreeAge" /> [필수] 만 14세 이상입니다.
            </label>
          </div>

        </template>

        <!-- 에러/성공 메시지 -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

        <!-- 제출 버튼 -->
        <button type="submit" class="btn-primary auth-submit-btn" :disabled="isLoading">
          <span v-if="isLoading">{{ isLogin ? '로그인 중...' : '가입 처리 중...' }}</span>
          <span v-else>{{ isLogin ? '로그인' : '회원가입' }}</span>
        </button>

      </form>

      <div class="auth-footer">
        <span>{{ isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?" }}</span>
        <a href="#" @click.prevent="toggleMode" class="toggle-link">
          {{ isLogin ? '회원가입' : '로그인' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px 80px;
  min-height: calc(100vh - 200px);
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 44px 40px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.auth-title {
  font-size: 26px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-bottom: 32px;
}

.mock-login-panel {
  margin-bottom: 26px;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  border-radius: 10px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 90%),
    var(--color-panel-soft, #f8fafc);
}

.mock-login-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.mock-login-copy strong {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text);
}

.mock-login-copy span {
  font-size: 12px;
  color: var(--color-text-light);
}

.mock-login-grid {
  display: grid;
  gap: 10px;
}

.mock-login-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.mock-login-button:hover {
  transform: translateY(-1px);
  border-color: var(--color-primary);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.mock-login-button strong {
  font-size: 14px;
  font-weight: 700;
}

.mock-login-button span {
  font-size: 12px;
  color: var(--color-text-light);
  line-height: 1.45;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 7px;
  color: var(--color-text);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"],
.form-group input[type="date"] {
  width: 100%;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background-color: white;
  color: var(--color-text);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.form-hint {
  display: block;
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-light);
}

.error-hint { color: #e53e3e; font-weight: 500; }
.ok-hint    { color: #2f855a; font-weight: 600; }

.required { color: #e53e3e; }

.optional-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 1px 6px;
  vertical-align: middle;
}

/* ───── 프로필 이미지 업로드 ───── */
.image-upload-group {
  text-align: center;
}

.avatar-upload-area {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto 8px;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
  background: #f8fafc;
}

.avatar-upload-area:hover {
  border-color: var(--color-primary);
  background: #f0f4ff;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

.btn-remove-image {
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}
.btn-remove-image:hover { background: #fff5f5; }

.image-actions {
  text-align: center;
  margin-bottom: 4px;
}

/* ───── 성별 ───── */
.gender-group {
  display: flex;
  gap: 10px;
}

.gender-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.gender-item input[type="radio"] { display: none; }

.gender-item.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: white;
  font-weight: 700;
}

/* ───── 구분선 ───── */
.form-divider {
  position: relative;
  text-align: center;
  margin: 22px 0 18px;
}

.form-divider::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 1px;
  background-color: var(--color-border);
}

.form-divider span {
  position: relative;
  padding: 0 12px;
  background: var(--color-background);
  font-size: 12px;
  color: var(--color-text-light);
  font-weight: 600;
}

/* ───── 약관 ───── */
.terms-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.term-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  color: var(--color-text);
}

.required-term { font-weight: 500; }

/* ───── 메시지 ───── */
.error-message {
  color: #e53e3e;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  padding: 8px 12px;
}

.success-message {
  color: #2f855a;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 600;
}

/* ───── 버튼 ───── */
.auth-submit-btn {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  font-size: 15px;
}

.auth-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-light);
}

.toggle-link {
  color: var(--color-primary);
  font-weight: 700;
  margin-left: 6px;
  text-decoration: underline;
  cursor: pointer;
}
</style>
