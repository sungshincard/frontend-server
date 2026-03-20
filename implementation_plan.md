# 프론트엔드 서버(Frontend Server) 구현 계획

SNKRDUNK와 같은 프리미엄 카드 거래 중계 플랫폼을 구축하기 위한 프론트엔드 상세 기획 및 아키텍처 설계입니다.
백엔드의 8단계 개발 페이즈(Phase)에 맞추어 프론트엔드 역시 체계적으로 연동 및 UI 개발을 진행합니다.

## 핵심 목표 및 디자인 방향
1. **프리미엄 & 클린 UI**: 화이트/블랙 중심의 미니멀한 컬러 팔레트와 넉넉한 여백(Negative Space).
2. **모바일 최우선(Mobile-First)**: 모바일 및 데스크톱 모두에서 유려하게 동작하는 반응형 그리드.
3. **가독성 높은 타이포그래피**: 굵고 명확한 섹션 제목과 상품/가격 정보의 시각적 대비.
4. **Interactive 경험 향상**: Micro-interactions 및 Hover 트랜지션을 적극 활용.

## 기술 스택
- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite
- **Language**: JavaScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Vanilla CSS (CSS 변수를 활용한 전역 디자인 토큰 설계)
- **HTTP Client**: Axios

## 백엔드 연동 기반 단계별 실행 계획 (Phase 0 ~ Phase 8)

### Phase 0: 프로젝트 초기 설정 및 뼈대 구축 (완료)
- Vue 3 + Vite 기본 설정 및 디렉토리 구조 뼈대 완성
- Axios 인스턴스 기본 설정 (CORS `withCredentials`)
- 라우팅 및 Pinia 상태 관리 뼈대 구축 완료
- 글로벌 CSS 및 프리미엄 디자인 토큰 (`index.css`) 설정 완료

### Phase 1: 기반 인프라 (회원/상점/공통)
- `Auth.vue`: 회원가입/로그인 UI (이메일/비밀번호/닉네임 간소화 폼) 연결 및 검증 (완료)
- `MyPage.vue`: 내 프로필 및 권한/상태 정보 연동 (완료)
- `Address.vue`: 배송지 관리 UI 및 모달 구현 (추가/수정/삭제/기본 배송지 설정)
- `StoreProfile.vue`: 내 상점(Store) 설정 및 프로필 편집 UI 구현

### Phase 2: 카드 도감 및 추가 요청 시스템
- `CardCatalog.vue`: 카드명, 세트명, 상태별 등 상세 동적 검색 UI (가로형 캐러셀 및 그리드 레이아웃)
- `CardDetail.vue` (도감 정보 페이지): 도감별 1:1 정방형 누끼 이미지 표시 및 상세 정보 제공
- `CardRequestForm.vue`: 회원이 미등록 카드를 추가 요청하는 폼 모달 (이미지 및 데이터 입력)

### Phase 3: 상품 출품(Listing) 및 관심(Watchlist)
- `ProductListingForm.vue`: 실물 카드 상태등급(`S~D`), 감정상태, 가격, 다중 슬라이더 이미지 업로드(정면/후면/하자) 폼
- `ListingDetail.vue`: 선택한 유저의 판매 아이템 상세 페이지 (판매자 설명, 상태 등급표, 현재 관심 수)
- **관심 버튼 (Like/Watch)**: 도감 리스트 및 상세화면에서의 즐겨찾기 토글 애니메이션 구현
- 관심 목록 모아보기 화면 (`MyWatchlist.vue`) 구현

### Phase 4: 거래 체결 (결제 도메인 연동)
- `Checkout.vue`: 주문 생성 및 결제 플로우 화면 구현. 배송지 선택 기능 포함
- 결제 PG 연동: 포트원(PortOne) 등 모의 결제창 띄우기 및 결과 콜백 처리 로직 화면
- 거래 방식(택배 / 직거래) 선택 UI 제공

### Phase 5: 정산 및 배송/진행 상황 리포팅
- `OrderHistory.vue`: 구매/판매에 따른 탭 분리(구매 내역, 판매 내역)
- 진행 상태 뱃지 (`결제완료`, `운송장 대기`, `배송중`, `배송완료`, `구매확정`, `정산완료`) UI 설계
- 송장 번호 입력 모달 및 배송 조회 팝업 UI 구현

### Phase 6: 시세/신뢰도 커뮤니케이션
- `TradeHistory.vue`: 최근 성사 거래들의 테이블 및 차트 UI 시각화 (`Chart.js` 연동 고민)
- `CommentsSection.vue`: 출품 게시물 내부 질문/답변(비밀글 토글 포함) 디자인
- 구매 확정 후 `ReviewForm.vue` 연동 (별점 1~5점 및 후기)
- 상점 프로필에 신뢰도(평점, 판매건수 등) 그래픽 수치로 표시

### Phase 7: 관리자 / 분쟁(Dispute) / 알림
- `DisputeForm.vue`: 상품 이상 시 분쟁 신고(이미지 및 영상 링크 접수 폼)
- 시스템 Notification Dropdown (신규 출품, 결제완료 등) 헤더 아이콘 및 리스트 구현
- 관리자(Admin) 전용 숨김/처리/승인 대시보드 화면 연동

### Phase 8: 최적화 및 E2E 시나리오 통합 테스트
- 화면 간 Loading Spinner 및 Skeleton UI 일괄 적용
- Axios 인터셉터 글로벌 에러 알림(Toast/Snackbar) 적용
- 프론트엔드 Vue Flow 기반 E2E 시나리오 테스트
