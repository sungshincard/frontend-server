# 프론트엔드 서버(Frontend Server) 구현 계획

SNKRDUNK와 같은 프리미엄 카드 거래 중계 플랫폼을 구축하기 위한 프론트엔드 기획 및 아키텍처 설계입니다.

## 핵심 목표 및 디자인 방향

1. **프리미엄 & 클린 UI**: 화이트/블랙 중심의 미니멀한 컬러 팔레트와 넉넉한 여백(Negative Space)을 사용하여 상품 자체가 돋보이는 고급스러운 룩 앤 필(Look & Feel)을 제공합니다.
2. **모바일 최우선(Mobile-First) 디자인**: 모바일 기기간 일관된 사용자 경험을 위해 반응형 그리드 시스템을 철저히 적용합니다.
3. **가독성 높은 타이포그래피**: 굵고 명확한 섹션 제목과 상품/가격 정보의 시각적 대비를 주어 사용자가 핵심 정보를 쉽게 파악하도록 합니다.

## 기술 스택 (Technology Stack)

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite (빠른 HMR 및 빌드 속도)
- **Language**: JavaScript (유연하고 빠른 개발)
- **State Management**: Pinia (가볍고 직관적인 상태 관리)
- **Routing**: Vue Router
- **Styling**: Vanilla CSS (TailwindCSS는 배제하고 세밀한 CSS 제어 방식 채택)
- **HTTP Client**: Axios

## 디렉토리 구조 및 컴포넌트 설계

`src/` 하위에 다음과 같은 구조로 시스템을 분리합니다.

```
src/
├── assets/         # 전역 CSS, 이미지, 폰트 자원
├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── common/     # 버튼, 인풋, 모달 등 공통 요소
│   ├── layout/     # 헤더, 푸터, 네비게이션
│   └── product/    # 상품 카드(Snkrdunk 스타일의 1:1 이미지 + 깔끔한 텍스트)
├── views/          # 라우터 페이지 기준 뷰 컴포넌트
│   ├── Home.vue    # 메인 페이지 (풀 와이드 캠페인 배너 + 가로스크롤 상품 목록)
│   ├── Product.vue # 상품 상세 및 입찰 페이지
│   └── Auth.vue    # 로그인/회원가입
├── stores/         # Pinia 상태 관리
├── services/       # Axios API 호출 모듈 (Backend API 연동)
└── router/         # Vue 라우터 설정
```

## 주요 화면 구현 요소

### 1. 메인 홈 (Home)
- **Hero Section**: 상단에 고품질 이미지를 활용한 풀 와이드 캐러셀 배너 배치. 브랜드의 프리미엄 이미지 각인.
- **Section Headers**: `Bold`한 타이포그래피로 "New Arrivals", "Trending Now" 등 섹션 명확히 구분.
- **Product Grid/Carousel**: 스크롤이 길어지는 것을 방지하기 위해 가로 스크롤 가능한 컴포넌트 활용.

### 2. 상품 카드 (Product Card)
- **이미지 영역**: 1:1 정방형 비율, 옅은 회색 배경(`#F5F5F5`)에 신발/카드 이미지가 깔끔하게 들어간 누끼 이미지 형태.
- **텍스트 영역**: 브랜드 로고 혹은 이름(작게), 상품명(일반 두께), 가격(크고 굵은 글씨) 순으로 위계(Hierarchy) 있게 배치.

### 3. 네비게이션 (Header)
- 상단 고정(Sticky). 플로팅 혹은 미니멀한 화이트톤 배경에 로고 중앙 정렬.
- 좌측 햄버거 메뉴, 우측 검색/장바구니/내정보 아이콘 배치.

## 다음 진행 단계 (Next Steps)

1. 이 `implementation_plan.md`가 승인되면, Vite + Vue 3(JS) 기반의 프로젝트 스캐폴딩을 시작합니다.
2. `src/assets/index.css`에 글로벌 프리미엄 디자인 토큰(색상, 폰트, 여백)을 정의합니다.
3. 백엔드(Backend-server)와의 연동을 위한 기본적인 통합 테스트(Axios 인터셉터, CORS 설정)를 진행합니다.
