---
trigger: always_on
---

카드 쇼핑몰 프론트엔드 개발 규칙
0. 기본 원칙
무조건 한글로 대답하고, 코드 주석도 한글로 작성한다.

주어진 백엔드 API 명세와 공통 Response DTO 구조를 철저히 준수하여 연동한다.

1. 아키텍처 및 기술 스택
프레임워크: Vue.js 3 (반드시 Composition API 및 <script setup> 문법 사용)

빌드 도구: Vite

상태 관리: Pinia (기존 Vuex 방식은 지양할 것)

라우팅: Vue Router

스타일링: Tailwind CSS (또는 Scoped CSS) 및 UI 컴포넌트 프레임워크 (예: PrimeVue, Vuetify 등 프로젝트 환경에 맞춤)

언어: JavaScript를 사용하여 컴포넌트 간의 데이터 타입과 API 응답 인터페이스를 엄격하게 관리한다.

2. API 통신 및 데이터 처리 (핵심)
공통 DTO 처리: 백엔드에서 내려주는 공통 Response 형식(예: status, message, data)을 파싱하는 Axios 인터셉터(Interceptor)를 구성하여 사용한다.

에러 핸들링: 400, 401(인증 만료), 403, 500 에러 등에 대해 전역 에러 처리 로직을 구현하고 사용자에게 일관된 알림(Toast/Snackbar)을 노출한다.

로딩 상태: 체결가 조회, 입찰 등록 등 주요 트랜잭션 발생 시 버튼 비활성화 및 스켈레톤(Skeleton) UI를 적용해 중복 클릭과 UX 저하를 방지한다.

3. 핵심 도메인 UI/UX 원칙
입찰 시스템 (Bid): 구매 입찰(Red)과 판매 입찰(Green) 등 행동의 종류에 따라 테마 색상을 명확히 분리하여 사용자가 실수하지 않도록 UI를 구성한다.

거래 상태 (Trade Status): PAYMENT_PENDING -> WAITING_FOR_SELLER -> INSPECTION_PENDING -> SHIPPING -> COMPLETED 로 이어지는 복잡한 상태를 사용자가 한눈에 파악할 수 있도록 진행 단계(Stepper/Timeline) UI를 제공한다.

탐색 및 필터 (Search & Filter): 카드 등급, 상태, 세트 등 다중 조건 필터링 시 프론트엔드에서 쿼리 파라미터(Query String)를 조합하여 백엔드(JPA or MyBatis 쿼리)로 정확히 전달해야 한다.

4. 컴포넌트 설계 및 코드 컨벤션
관심사 분리: 비즈니스 로직(API 호출, 복잡한 데이터 가공)은 composables/ (커스텀 훅) 혹은 Pinia Store로 분리하고, .vue 파일은 UI 렌더링에 집중한다.

재사용성: 카드 아이템, 입찰 가격 표시, 등급 뱃지 등 반복되는 요소는 반드시 components/common/ 내에 원자(Atomic) 컴포넌트로 분리하여 재사용한다.

명명 규칙: 컴포넌트는 파스칼 케이스(PascalCase, 예: CardListItem.vue), 함수 및 변수는 카멜 케이스(camelCase)를 사용한다.