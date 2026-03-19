<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import apiClient from '../services/api';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);

const email = ref('');
const password = ref('');
const nickname = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  successMessage.value = '';
  email.value = '';
  password.value = '';
  nickname.value = '';
};

const handleSubmit = async () => {
  if (!email.value || !password.value || (!isLogin.value && !nickname.value)) {
    errorMessage.value = 'Please fill in all required fields.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    if (isLogin.value) {
      // Login
      const response = await apiClient.post('/member/login', {
        email: email.value,
        password: password.value
      });
      const token = response.data;
      if (token) {
        authStore.setToken(token);
        router.push('/');
      } else {
        errorMessage.value = 'Login failed: Invalid token received.';
      }
    } else {
      // Register
      await apiClient.post('/member/join', {
        email: email.value,
        password: password.value,
        nickname: nickname.value
      });
      successMessage.value = 'Registration successful! Please sign in.';
      isLogin.value = true;
    }
  } catch (error) {
    console.error('Auth error:', error);
    errorMessage.value = error.response?.data?.message || 'Authentication failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">{{ isLogin ? 'LOGIN' : 'REGISTER' }}</h1>
      <p class="auth-subtitle">
        {{ isLogin ? 'Welcome back to Card Mall' : 'Create your account' }}
      </p>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="nickname">Nickname</label>
          <input 
            type="text" 
            id="nickname" 
            v-model="nickname" 
            placeholder="Enter your nickname"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <button type="submit" class="btn-primary auth-submit-btn" :disabled="isLoading">
          <span v-if="isLoading">{{ isLogin ? 'Logging in...' : 'Registering...' }}</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <span>{{ isLogin ? "Don't have an account?" : "Already have an account?" }}</span>
        <a href="#" @click.prevent="toggleMode" class="toggle-link">
          {{ isLogin ? 'Sign Up' : 'Sign In' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: calc(100vh - 200px);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.auth-title {
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.error-message {
  color: #e53e3e;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message {
  color: #2f855a;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.auth-submit-btn {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  font-size: 15px;
}

.auth-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-light);
}

.toggle-link {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: 6px;
  text-decoration: underline;
  cursor: pointer;
}
</style>
