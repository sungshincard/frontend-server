<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import apiClient from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const profile = ref(null);
const isLoading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const saveMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();

const mockListings = computed(() => profile.value?.listings || []);

// 편집 중인 폼 데이터
const editForm = reactive({
  nickname: '',
  storeName: '',
  intro: ''
});

// 프로필 이미지
const newImagePreview = ref(null);
const imageInput = ref(null);

const genderLabel = (g) => {
  if (g === 'MALE') return '남성';
  if (g === 'FEMALE') return '여성';
  return '선택 안 함';
};

const statusLabel = (s) => {
  if (s === 'ACTIVE') return '정상';
  if (s === 'SUSPENDED') return '정지';
  if (s === 'WITHDRAWN') return '탈퇴';
  return s;
};

const listingStatusLabel = (status) => {
  if (status === 'ACTIVE') return '판매중';
  if (status === 'SOLD') return '판매완료';
  if (status === 'HIDDEN') return '숨김';
  return status;
};

const formatPrice = (price) => `${price.toLocaleString('ko-KR')}원`;
const goListingEdit = (listingId) => {
  router.push(`/listings/${listingId}/edit`);
};
const goAddressBook = () => {
  router.push('/addresses');
};
const goOrders = () => {
  router.push('/orders');
};

const fetchProfile = async () => {
  if (authStore.isMockSession && authStore.user) {
    profile.value = authStore.user;
    isLoading.value = false;
    return;
  }

  try {
    const response = await apiClient.get('/member/me');
    profile.value = response.data;
  } catch (error) {
    console.error('Failed to fetch profile', error);
    errorMessage.value = '프로필 정보를 불러오지 못했습니다.';
    if (error.response?.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
  }
};

const startEdit = () => {
  editForm.nickname = profile.value.nickname || '';
  editForm.storeName = profile.value.store?.storeName || '';
  editForm.intro = profile.value.store?.intro || '';
  newImagePreview.value = null;
  errorMessage.value = '';
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  newImagePreview.value = null;
  errorMessage.value = '';
  if (imageInput.value) imageInput.value.value = '';
};

const saveEdit = async () => {
  // 닉네임은 필수 값이므로 비워두고 저장하는 것만 막습니다.
  // (수정하지 않고 그대로 두어도 editForm.nickname에 기존 이름이 들어있어 통과됩니다)
  if (!editForm.nickname.trim()) {
    errorMessage.value = '닉네임을 입력해 주세요.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    // 프로필 기본 정보 저장 (닉네임만)
    await apiClient.patch('/member/me', {
      nickname: editForm.nickname,
    });

    try {
      // 상점 정보 저장
      await apiClient.patch('/stores/me', {
        storeName: editForm.storeName || profile.value.store?.storeName || editForm.nickname + '님의 상점',
        intro: editForm.intro,
      });
    } catch(e) {
      console.warn('상점 정보가 아직 백엔드에 초기화되지 않았거나 서버 통신에 실패했습니다.', e);
    }

    // 이미지가 변경된 경우 별도 저장
    if (newImagePreview.value) {
      await apiClient.patch('/member/me/profile-image', {
        profileImageUrl: newImagePreview.value,
      });
      profile.value.profileImageUrl = newImagePreview.value;
    }

    // 로컬 profile 업데이트
    profile.value.nickname = editForm.nickname;
    if (profile.value.store) {
      profile.value.store.storeName = editForm.storeName || profile.value.store.storeName;
      profile.value.store.intro = editForm.intro;
    }

    saveMessage.value = '프로필이 성공적으로 수정되었습니다.';
    isEditing.value = false;
    newImagePreview.value = null;
    setTimeout(() => { saveMessage.value = ''; }, 3000);
  } catch (error) {
    console.error('Update failed', error);
    errorMessage.value = error.response?.data?.message || '수정 중 오류가 발생했습니다.';
  } finally {
    isSaving.value = false;
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '이미지 파일만 업로드 가능합니다.';
    return;
  }
  const reader = new FileReader();
  reader.onload = (evt) => {
    newImagePreview.value = evt.target.result;
  };
  reader.readAsDataURL(file);
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  fetchProfile();
});
</script>

<template>
  <div class="mypage-container container">
    <h1 class="page-title">내 상점 관리</h1>

    <div v-if="isLoading" class="loading">프로필 불러오는 중...</div>
    <div v-else-if="errorMessage && !profile" class="error">{{ errorMessage }}</div>

    <div v-else-if="profile" class="profile-layout">
      <section class="store-hero">
        <div class="avatar-wrapper">
          <div class="avatar" :class="{ editable: isEditing }" @click="isEditing && imageInput.click()">
            <img
              v-if="newImagePreview || profile.profileImageUrl"
              :src="newImagePreview || profile.profileImageUrl"
              class="avatar-img"
              alt="프로필 이미지"
            />
            <span v-else class="avatar-initial">
              {{ profile.nickname ? profile.nickname.charAt(0).toUpperCase() : 'U' }}
            </span>
            <div v-if="isEditing" class="avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageChange" />
          <span v-if="isEditing" class="avatar-hint">클릭하여 변경</span>
        </div>
        <div class="store-hero-body">
          <div class="store-hero-head">
            <div>
              <p class="store-label">MY STORE</p>
              <h2>{{ profile.store.storeName }}</h2>
              <p class="store-owner">{{ isEditing ? editForm.nickname || profile.nickname : profile.nickname }}</p>
            </div>
            <div class="badges">
              <span class="role-badge">{{ profile.role }}</span>
              <span class="status-badge" :class="profile.status?.toLowerCase()">
                {{ statusLabel(profile.status) }}
              </span>
            </div>
          </div>
          <p class="store-intro">{{ profile.store.intro }}</p>
          <div class="store-summary">
            <article>
              <span>평균 평점</span>
              <strong>{{ profile.store.ratingAvg }}</strong>
            </article>
            <article>
              <span>후기 수</span>
              <strong>{{ profile.store.reviewCount }}</strong>
            </article>
            <article>
              <span>판매 완료</span>
              <strong>{{ profile.store.completedSaleCount }}</strong>
            </article>
            <article>
              <span>등록 상품</span>
              <strong>{{ mockListings.length }}</strong>
            </article>
          </div>
        </div>
      </section>

      <div v-if="saveMessage" class="save-message">✓ {{ saveMessage }}</div>
      <div v-if="errorMessage && profile" class="inline-error">{{ errorMessage }}</div>

      <section class="management-section">
        <div class="section-header">
          <div>
            <strong>내 상점 관리</strong>
            <p>불필요한 지표 없이 현재 출품 상품과 상태만 빠르게 관리합니다.</p>
          </div>
          <button v-if="!isEditing" class="btn-edit" @click="startEdit">상점 정보 수정</button>
        </div>

        <div class="listing-table">
          <div class="listing-table-head">
            <span>사진</span>
            <span>판매상태</span>
            <span>상품명</span>
            <span>가격</span>
            <span>최근수정일</span>
            <span>기능</span>
          </div>
          <div
            v-for="listing in mockListings"
            :key="listing.id"
            class="listing-row"
          >
            <div class="listing-thumb">
              <img :src="listing.imageUrl" :alt="listing.title" />
            </div>
            <div>
              <span class="listing-state" :class="listing.status.toLowerCase()">
                {{ listingStatusLabel(listing.status) }}
              </span>
            </div>
            <div class="listing-name">{{ listing.title }}</div>
            <div class="listing-price">{{ formatPrice(listing.price) }}</div>
            <div class="listing-date">{{ listing.updatedAt }}</div>
            <div class="listing-actions">
              <button type="button" @click="goListingEdit(listing.id)">수정</button>
              <button type="button">{{ listing.status === 'ACTIVE' ? '숨김' : '재등록' }}</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!isEditing" class="profile-card">
        <div class="section-header compact">
          <div>
            <strong>계정 정보</strong>
            <p>내 상점 운영에 필요한 기본 계정 정보입니다.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-edit" @click="goOrders">내 거래 관리</button>
            <button type="button" class="btn-edit" @click="goAddressBook">배송지 관리</button>
          </div>
        </div>
        <div class="profile-details">
        <div class="detail-group">
          <span class="label">이메일</span>
          <span class="value">{{ profile.email }}</span>
        </div>
        <div class="detail-group">
          <span class="label">이름</span>
          <span class="value">{{ profile.name }}</span>
        </div>
        <div class="detail-group">
          <span class="label">휴대폰 번호</span>
          <span class="value">{{ profile.phoneNumber }}</span>
        </div>
        <div class="detail-group">
          <span class="label">생년월일</span>
          <span class="value">{{ profile.birthDate }}</span>
        </div>
        <div class="detail-group">
          <span class="label">성별</span>
          <span class="value">{{ genderLabel(profile.gender) }}</span>
        </div>
        </div>
      </section>

      <section v-else class="profile-card">
        <div class="section-header compact">
          <div>
            <strong>상점 정보 수정</strong>
            <p>닉네임과 프로필 이미지를 수정하면 내 상점 화면에 즉시 반영됩니다.</p>
          </div>
        </div>
        <div class="edit-form">

        <div class="edit-section-title">변경 가능 항목</div>
        <div class="form-group">
          <label>닉네임 <span class="required">*</span></label>
          <input type="text" v-model="editForm.nickname" placeholder="닉네임" />
          <span class="form-hint">다른 사용자에게 공개되는 이름입니다.</span>
        </div>
        <div class="form-group">
          <label>상점 이름</label>
          <input type="text" v-model="editForm.storeName" placeholder="상점 이름" />
          <span class="form-hint">비워두시면 기존 상점명이 유지됩니다.</span>
        </div>
        <div class="form-group">
          <label>상점 소개글</label>
          <textarea v-model="editForm.intro" placeholder="상점 소개를 짧게 입력해주세요." rows="3" class="form-textarea"></textarea>
        </div>

        <!-- 변경 불가 항목 -->
        <div class="edit-section-title locked-title">🔒 변경 불가 항목 <span class="locked-reason">(본인인증 연동 필요)</span></div>
        <div class="locked-fields">
          <div class="locked-item">
            <span class="locked-label">이메일</span>
            <span class="locked-value">{{ profile.email }}</span>
          </div>
          <div class="locked-item">
            <span class="locked-label">이름</span>
            <span class="locked-value">{{ profile.name }}</span>
          </div>
          <div class="locked-item">
            <span class="locked-label">휴대폰 번호</span>
            <span class="locked-value">{{ profile.phoneNumber }}</span>
          </div>
          <div class="locked-item">
            <span class="locked-label">생년월일</span>
            <span class="locked-value">{{ profile.birthDate }}</span>
          </div>
          <div class="locked-item">
            <span class="locked-label">성별</span>
            <span class="locked-value">{{ genderLabel(profile.gender) }}</span>
          </div>
        </div>
        </div>

        <div class="card-actions">
          <button class="btn-save" :disabled="isSaving" @click="saveEdit">
            {{ isSaving ? '저장 중...' : '✓ 저장' }}
          </button>
          <button class="btn-cancel" :disabled="isSaving" @click="cancelEdit">× 취소</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mypage-container {
  padding: 40px 20px 80px;
  max-width: 1160px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 28px;
  letter-spacing: -0.04em;
}

.profile-layout {
  display: grid;
  gap: 24px;
}

.store-hero,
.profile-card,
.management-section {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.store-hero {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 3px solid var(--color-border);
  transition: border-color 0.2s;
}

.avatar.editable { cursor: pointer; }
.avatar.editable:hover { border-color: var(--color-primary); }

.avatar-img {
  width: 100%; height: 100%;
  object-fit: cover;
  position: absolute; top: 0; left: 0;
}

.avatar-initial { font-size: 32px; font-weight: 700; }

.avatar-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar.editable:hover .avatar-overlay { opacity: 1; }

.avatar-hint { font-size: 11px; color: var(--color-text-light); }

.header-info h2 { font-size: 22px; margin-bottom: 8px; }

.store-hero-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.store-hero-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.store-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text-light);
}

.store-hero-head h2 {
  margin-bottom: 6px;
  font-size: 26px;
}

.store-owner,
.store-intro {
  color: var(--color-text-light);
}

.store-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.store-summary article {
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-summary span {
  font-size: 12px;
  color: var(--color-text-light);
}

.store-summary strong {
  font-size: 18px;
}

.badges { display: flex; gap: 8px; flex-wrap: wrap; }

.role-badge {
  background: #f1f5f9; color: #475569;
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
}

.status-badge {
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
}
.status-badge.active    { background: #d1fae5; color: #065f46; }
.status-badge.suspended { background: #fee2e2; color: #991b1b; }
.status-badge.withdrawn { background: #f3f4f6; color: #6b7280; }

/* ── 메시지 ── */
.save-message {
  background: #f0fff4; border: 1px solid #c6f6d5;
  color: #2f855a; font-size: 13px; font-weight: 600;
  padding: 8px 14px; border-radius: 6px; margin-bottom: 20px;
}

.inline-error {
  background: #fff5f5; border: 1px solid #fed7d7;
  color: #e53e3e; font-size: 13px;
  padding: 8px 14px; border-radius: 6px; margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.section-header.compact {
  margin-bottom: 20px;
}

.section-header strong {
  display: block;
  margin-bottom: 6px;
  font-size: 18px;
  color: var(--color-text);
}

.section-header p {
  font-size: 13px;
  color: var(--color-text-light);
}

.listing-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.listing-table-head,
.listing-row {
  display: grid;
  grid-template-columns: 108px 120px 1.8fr 120px 150px 160px;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
}

.listing-table-head {
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.listing-row {
  border-top: 1px solid #e2e8f0;
}

.listing-thumb img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.listing-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #e0f2fe;
  color: #0c4a6e;
}

.listing-state.sold {
  background: #e5e7eb;
  color: #374151;
}

.listing-name {
  font-weight: 600;
  color: var(--color-text);
}

.listing-price {
  font-weight: 700;
}

.listing-date {
  font-size: 13px;
  color: var(--color-text-light);
}

.listing-actions {
  display: flex;
  gap: 8px;
}

.listing-actions button {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.listing-actions button:hover {
  background: #f8fafc;
}

/* ── 조회 모드 ── */
.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 36px;
}

.detail-group { display: flex; flex-direction: column; gap: 6px; }

.label {
  font-size: 12px; font-weight: 600;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.value { font-size: 15px; color: var(--color-text); font-weight: 500; }

/* ── 편집 모드 ── */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 32px;
}

.form-group label {
  display: block; font-size: 13px;
  font-weight: 600; margin-bottom: 7px;
  color: var(--color-text);
}

.form-group input[type="text"],
.form-group input[type="tel"],
.form-group input[type="date"],
.form-textarea {
  width: 100%; padding: 11px 14px;
  font-family: inherit; font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px; outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: white; color: var(--color-text);
}
.form-textarea { resize: vertical; }
.form-group input:focus, .form-textarea:focus { border-color: var(--color-primary); }

.gender-group { display: flex; gap: 10px; }

.gender-item {
  flex: 1; display: flex;
  align-items: center; justify-content: center;
  gap: 6px; padding: 9px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px; cursor: pointer;
  font-size: 13px; font-weight: 500;
  transition: all 0.15s;
}
.gender-item input[type="radio"] { display: none; }
.gender-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white; font-weight: 700;
}

.readonly-group {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: #f8fafc; border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.readonly-group label { margin-bottom: 0; min-width: 60px; }

.readonly-value { font-size: 14px; color: #475569; flex: 1; }

.readonly-badge {
  font-size: 11px; background: #e2e8f0;
  color: #64748b; padding: 2px 8px;
  border-radius: 10px; font-weight: 600;
}

.required { color: #e53e3e; }

/* ── 편집 섹션 제목 ── */
.edit-section-title {
  font-size: 12px; font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.6px;
  margin-top: 4px; margin-bottom: -4px;
}

.locked-title { color: #94a3b8; }
.locked-reason { font-weight: 400; font-size: 11px; text-transform: none; letter-spacing: 0; }

/* ── 변경 불가 필드 그룹 ── */
.locked-fields {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 0;
  margin-bottom: 4px;
}

.locked-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.locked-item:last-child { border-bottom: none; }

.locked-label {
  font-size: 12px; font-weight: 600;
  color: #94a3b8;
  min-width: 90px;
}

.locked-value {
  font-size: 14px; color: #475569;
  font-weight: 500;
}

.form-hint {
  display: block; font-size: 12px;
  margin-top: 5px; color: var(--color-text-light);
}

/* ── 하단 버튼 ── */
.card-actions {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-edit {
  padding: 10px 18px;
  background: var(--color-primary);
  color: white; border: none;
  border-radius: 8px; font-size: 14px;
  font-weight: 600; cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
}
.btn-edit:hover { opacity: 0.85; }

.btn-save {
  padding: 10px 24px;
  background: var(--color-primary);
  color: white; border: none;
  border-radius: 7px; font-size: 14px;
  font-weight: 600; cursor: pointer;
  transition: opacity 0.15s; font-family: inherit;
}
.btn-save:hover:not(:disabled) { opacity: 0.85; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel {
  padding: 10px 20px;
  background: white; color: #475569;
  border: 1px solid var(--color-border);
  border-radius: 7px; font-size: 14px;
  font-weight: 600; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.btn-cancel:hover:not(:disabled) { background: #f1f5f9; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

.loading, .error {
  text-align: center; padding: 40px;
  font-size: 16px; color: var(--color-text-light);
}
.error { color: #ef4444; }

@media (max-width: 960px) {
  .store-hero,
  .store-hero-head {
    flex-direction: column;
  }

  .store-summary,
  .listing-table-head,
  .listing-row {
    grid-template-columns: 1fr;
  }

  .listing-table-head {
    display: none;
  }

  .listing-row {
    gap: 10px;
  }

  .listing-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .profile-details { grid-template-columns: 1fr; }
  .badges { justify-content: center; }
  .card-actions { justify-content: stretch; }
  .btn-edit, .btn-save, .btn-cancel { flex: 1; }
}
</style>
