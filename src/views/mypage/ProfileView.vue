<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import authService from '../../services/authService';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const profile = ref(null);
const isLoading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const saveMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();

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

const fetchProfile = async () => {
  try {
    const response = await authService.getMe();
    profile.value = response.data;
  } catch (error) {
    console.error('Failed to fetch profile', error);
    errorMessage.value = '프로필 정보를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const startEdit = () => {
  editForm.nickname = profile.value?.nickname || '';
  editForm.storeName = profile.value?.store?.storeName || '';
  editForm.intro = profile.value?.store?.intro || '';
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
  if (!editForm.nickname.trim()) {
    errorMessage.value = '닉네임을 입력해 주세요.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    await authService.updateProfile({ nickname: editForm.nickname });
    await authService.updateStore({
      storeName: editForm.storeName || profile.value?.nickname + '님의 상점',
      intro: editForm.intro,
    });
    if (newImagePreview.value) {
      await authService.updateProfileImage(newImagePreview.value);
    }
    await fetchProfile();
    saveMessage.value = '프로필이 성공적으로 수정되었습니다.';
    isEditing.value = false;
    setTimeout(() => { saveMessage.value = ''; }, 3000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '수정 중 오류가 발생했습니다.';
  } finally {
    isSaving.value = false;
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (evt) => { newImagePreview.value = evt.target.result; };
  reader.readAsDataURL(file);
};

onMounted(fetchProfile);
</script>

<template>
  <div class="profile-view">
    <div v-if="isLoading" class="loading">불러오는 중...</div>
    <div v-else-if="profile">
      <!-- Store Hero -->
      <section class="store-hero">
        <div class="avatar-wrapper">
          <div class="avatar" :class="{ editable: isEditing }" @click="isEditing && imageInput.click()">
            <img v-if="newImagePreview || profile.profileImageUrl" :src="newImagePreview || profile.profileImageUrl" class="avatar-img" />
            <span v-else class="avatar-initial">{{ profile.nickname?.charAt(0) }}</span>
            <div v-if="isEditing" class="avatar-overlay">변경</div>
          </div>
          <input ref="imageInput" type="file" style="display:none" @change="handleImageChange" />
        </div>
        
        <div class="store-info">
          <div class="info-header">
            <template v-if="isEditing">
              <input type="text" v-model="editForm.storeName" class="edit-input title" placeholder="상점 이름" />
              <input type="text" v-model="editForm.nickname" class="edit-input" placeholder="닉네임" />
            </template>
            <template v-else>
              <h2>{{ profile.store?.storeName || profile.nickname + '님의 상점' }}</h2>
              <p class="nickname">{{ profile.nickname }}</p>
            </template>
          </div>
          
          <div class="info-body">
            <textarea v-if="isEditing" v-model="editForm.intro" class="edit-textarea" placeholder="상점 소개"></textarea>
            <p v-else class="intro">{{ profile.store?.intro || '상점 소개가 없습니다.' }}</p>
          </div>

          <div class="actions">
            <button v-if="!isEditing" @click="startEdit" class="btn-edit">프로필 수정</button>
            <template v-else>
              <button @click="saveEdit" class="btn-save" :disabled="isSaving">저장</button>
              <button @click="cancelEdit" class="btn-cancel">취소</button>
            </template>
          </div>
        </div>
      </section>

      <!-- Account Details -->
      <section class="account-details">
        <h3>계정 정보</h3>
        <div class="details-grid">
          <div class="detail-item"><span>이메일</span><strong>{{ profile.email }}</strong></div>
          <div class="detail-item"><span>이름</span><strong>{{ profile.name }}</strong></div>
          <div class="detail-item"><span>휴대폰</span><strong>{{ profile.phoneNumber }}</strong></div>
          <div class="detail-item"><span>생년월일</span><strong>{{ profile.birthDate }}</strong></div>
          <div class="detail-item"><span>성별</span><strong>{{ genderLabel(profile.gender) }}</strong></div>
        </div>
      </section>
      
      <div v-if="saveMessage" class="toast-msg success">{{ saveMessage }}</div>
      <div v-if="errorMessage" class="toast-msg error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<style scoped>
.store-hero {
  display: flex; gap: 32px; padding: 40px; background: var(--color-panel); border-radius: 24px; border: 1px solid var(--color-border); margin-bottom: 32px;
}
.avatar { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; background: #f1f5f9; position: relative; cursor: default; }
.avatar.editable { cursor: pointer; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initial { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 40px; font-weight: 700; color: #64748b; }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; }
.avatar.editable:hover .avatar-overlay { opacity: 1; }

.store-info { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.info-header h2 { font-size: 28px; margin: 0; color: var(--color-text-strong); }
.nickname { color: var(--color-text-muted); font-weight: 600; }
.intro { color: var(--color-text-muted); line-height: 1.6; }

.edit-input { width: 100%; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px; }
.edit-input.title { font-size: 24px; font-weight: 700; }
.edit-textarea { width: 100%; padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; min-height: 100px; resize: none; }

.actions { display: flex; gap: 8px; margin-top: auto; }
.btn-edit, .btn-save, .btn-cancel { padding: 10px 24px; border-radius: 999px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-edit { background: var(--color-background-elevated); border: 1px solid var(--color-border); color: var(--color-text-strong); }
.btn-save { background: var(--color-primary); border: none; color: var(--color-primary-text); }
.btn-cancel { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-muted); }

.account-details { padding: 32px; background: var(--color-background-elevated); border-radius: 20px; border: 1px solid var(--color-border); }
.account-details h3 { margin: 0 0 24px; font-size: 18px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item span { font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; }
.detail-item strong { font-size: 16px; color: var(--color-text-strong); }

@media (max-width: 768px) {
  .store-hero { flex-direction: column; align-items: center; text-align: center; padding: 24px; }
  .actions { justify-content: center; }
}
</style>
