<script setup>
import { ref } from 'vue';

const stats = [
  { label: '신규 주문', count: 1, color: '#4f46e5', icon: 'M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z' },
  { label: '취소 관리', count: 0, color: '#ef4444', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6' },
  { label: '반품 관리', count: 0, color: '#f59e0b', icon: 'M9 14l-4-4 4-4 M5 10h11a4 4 0 1 1 0 8h-1' },
  { label: '교환 관리', count: 0, color: '#10b981', icon: 'M17 1l4 4-4 4 M3 23l-4-4 4-4 M11 5h10 M1 19h10' },
  { label: '미답변 문의', count: 0, color: '#6366f1', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
];

const checklistCards = [
  {
    title: '기본 설정',
    progress: '1/4',
    items: [
      { text: '사이트 정보 설정하기', done: true },
      { text: '디자인 편집하기', done: false },
      { text: '약관 설정하기', done: false },
      { text: '도메인 연결하기', done: false },
    ]
  },
  {
    title: '판매 준비',
    progress: '2/8',
    items: [
      { text: '카드 도감 추가하기', done: true },
      { text: '배송 정책 설정하기', done: true },
      { text: '전자결제 신청하기', done: false },
      { text: '네이버페이 신청하기', done: false },
    ]
  },
  {
    title: '성장 가이드',
    progress: '0/7',
    items: [
      { text: '검색엔진 등록하기', done: false },
      { text: '소셜 로그인 설정하기', done: false },
      { text: '메일발송 설정하기', done: false },
      { text: '방문자 분석하기', done: false },
    ]
  },
  {
    title: '추천 작업',
    progress: '0/5',
    items: [
      { text: '운영진 권한 설정하기', done: false },
      { text: '자동입금확인 설정하기', done: false },
      { text: '채팅상담 도구 연결', done: false },
      { text: '모바일 앱 설정하기', done: false },
    ]
  }
];

const activeItem = ref(null);

const selectItem = (cardTitle, itemText) => {
  activeItem.value = `${cardTitle}-${itemText}`;
};
</script>

<template>
  <div class="admin-home">
    <div class="welcome-section">
      <h1>Dashboard Overview</h1>
      <p>오늘의 주요 지표와 진행 상황을 한눈에 확인하세요.</p>
    </div>

    <!-- Header Stats -->
    <div class="dashboard-stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon-box" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="stat.icon"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <strong class="stat-count">{{ stat.count }}</strong>
        </div>
        <div class="stat-trend positive">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          <span>0%</span>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-main-grid">
      <!-- Setup Checklists -->
      <div class="checklist-container">
        <div class="section-header">
          <h3>상점 준비 체크리스트</h3>
          <div class="header-actions">
            <button class="btn-text">모두 보기</button>
          </div>
        </div>
        <div class="checklist-grid">
          <div v-for="card in checklistCards" :key="card.title" class="checklist-card">
            <div class="card-header">
              <div class="header-title-group">
                <h4>{{ card.title }}</h4>
                <span class="progress-text">{{ card.progress }} 완료</span>
              </div>
              <div class="progress-ring-mini"></div>
            </div>
            <ul class="item-list">
              <li 
                v-for="item in card.items" 
                :key="item.text" 
                :class="{ 
                  done: item.done, 
                  active: activeItem === `${card.title}-${item.text}` 
                }"
                @click="selectItem(card.title, item.text)"
              >
                <div class="check-box">
                  <svg v-if="item.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span class="item-text">{{ item.text }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Side Stats/Summary -->
      <div class="summary-container">
        <div class="visitor-summary-card glass-card">
          <div class="card-header-simple">
            <h4>실시간 방문자</h4>
            <span class="live-indicator">LIVE</span>
          </div>
          <div class="visitor-count-large">
            <span class="number">245</span>
            <span class="label">현재 접속 중</span>
          </div>
          <div class="mini-chart-placeholder">
            <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 35 Q 20 10, 40 25 T 80 5 T 100 20" fill="none" stroke="var(--color-primary)" stroke-width="2" />
            </svg>
          </div>
        </div>

        <div class="daily-table-card card">
          <div class="card-header-simple">
            <h4>최근 매출 내역</h4>
          </div>
          <table class="premium-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>주문</th>
                <th>매출액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>03.24</td>
                <td>1</td>
                <td>150,000</td>
              </tr>
              <tr>
                <td>03.23</td>
                <td>4</td>
                <td>580,000</td>
              </tr>
              <tr>
                <td>03.22</td>
                <td>2</td>
                <td>290,000</td>
              </tr>
            </tbody>
          </table>
          <button class="btn-view-more">상세 리포트 보기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 8px;
  color: var(--color-text-strong);
}

.welcome-section p {
  color: var(--color-text-subtle);
  font-size: 15px;
}

/* Stats Styling */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--color-panel);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-soft);
}

.stat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label { font-size: 13px; color: var(--color-text-subtle); font-weight: 600; }
.stat-count { font-size: 22px; font-weight: 800; color: var(--color-text-strong); }

.stat-trend {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.stat-trend.positive { color: #10b981; }

/* Main Grid Layout */
.dashboard-main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 { font-size: 18px; font-weight: 800; }
.btn-text { background: none; color: var(--color-primary); font-weight: 700; font-size: 14px; padding: 0; }

.checklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checklist-card {
  background: var(--color-panel);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  padding: 20px;
  transition: border-color 0.2s;
}

.checklist-card:hover {
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-title-group h4 { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.progress-text { font-size: 12px; color: var(--color-text-subtle); }

.item-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.item-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.check-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  transition: all 0.2s;
}

.item-list li.done .check-box {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.item-list li.done .item-text { opacity: 0.5; text-decoration: line-through; }

.item-list li:hover .item-text { color: var(--color-primary); }

.item-list li.active {
  font-weight: 700;
  color: var(--color-primary);
}

/* Summary Column */
.summary-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.glass-card {
  background: rgba(var(--color-panel), 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
}

.card-header-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header-simple h4 { font-size: 14px; font-weight: 800; color: var(--color-text-strong); }
.live-indicator {
  font-size: 10px;
  font-weight: 900;
  color: #ef4444;
  padding: 2px 6px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.visitor-count-large {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.visitor-count-large .number { font-size: 40px; font-weight: 900; letter-spacing: -1px; }
.visitor-count-large .label { font-size: 13px; color: var(--color-text-subtle); }

.daily-table-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.premium-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.premium-table td {
  padding: 12px 0;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
}

.btn-view-more {
  width: 100%;
  padding: 10px;
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

@media (max-width: 1400px) {
  .dashboard-stats-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .dashboard-main-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .checklist-grid { grid-template-columns: 1fr; }
}
</style>
