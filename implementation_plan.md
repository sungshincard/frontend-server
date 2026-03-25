> [!IMPORTANT]
> **개발 워크플로우 3원칙 (필독)**
> 본 프로젝트에 참여하는 모든 개발자는 다음 3가지 원칙을 엄격하게 준수해야 합니다.
> 1. **브랜치 전략**: 각 Phase 및 기능 단위 시작 시 `feature/phase~` 형식의 브랜치를 생성하고, 작업 완료 후 적절한 커밋 메시지와 함께 커밋합니다.
> 2. **기능 구현 순서**: 백엔드 API 선행 구현(Controller, Service, Repository) -> 프론트엔드 화면 구현 및 연동 서비스(Axios 등) 작성 -> API 통신 연결 확인 순으로 작업합니다.
> 3. **완료 보고서 작성**: 한 기능의 구현이 완료될 때마다 새롭게 작성·수정한 프론트엔드 컴포넌트(Views)와 백엔드 클래스(Controller, Service, Repository) 패키지를 명확히 리포팅해야 합니다. task.md에 구현이 완성된 항목을 x -> o로 표시해야 합니다.

---

# 프론트엔드 서버(Frontend Server) 구현 계획

SNKRDUNK와 같은 프리미엄 카드 거래 중계 플랫폼을 구축하기 위한 프론트엔드 상세 기획 및 아키텍처 설계입니다.
백엔드의 8단계 개발 페이즈(Phase)에 맞추어 프론트엔드 역시 체계적으로 연동 및 UI 개발을 진행합니다.

## 핵심 목표 및 테마 방향 (다크 모드 & 글래스모피즘 기반)
1. **프리미엄 다크 테마 & 클린 UI**: 기본 배경을 다크 모드(`121212` 등)나 매우 깊은 톤으로 설정하여 프리미엄 느낌 강조. 활력있는 브랜드 컬러 포인트 활용.
2. **글래스모피즘(Glassmorphism) 및 마이크로 인터랙션**: 포켓몬/카드 그리드에서 Hover 시 부드러운 Scale Up(1.05배) 효과와 Drop-shadow를 통해 역동적인 뷰 제공. (Duration: 150-300ms)
3. **모바일 최우선(Mobile-First) 및 액션 바**: 텍스트보다 고해상도 카드 리스트를 전면에 배치하고, 구매/판매 등의 주요 버튼(Action Bar)은 화면 하단에 Sticky하게 고정.
4. **데이터(신뢰) 중심 레이아웃**: 카드 상세 정보 페이지에서 좌측엔 고화질 이미지(Sticky), 우측엔 시세 차트(Chart.js)와 정렬된 매물 리스트 분리.
5. **가독성 높은 타이포그래피**: 가격과 주요 정보는 Pretendard 또는 Inter 폰트를 사용하여 시각적 대비 극대화.

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
- [o] Vue 3 + Vite 기본 설정 및 디렉토리 구조 뼈대 완성
- [o] Axios 인스턴스 기본 설정 (CORS `withCredentials`)
- [o] 라우팅 및 Pinia 상태 관리 뼈대 구축 완료
- [o] 글로벌 CSS 및 프리미엄 디자인 토큰 (`index.css`) 설정 완료

### Phase 1: 기반 인프라 (회원/상점/공통) (완료)
- [o] `Auth.vue`: 회원가입/로그인 UI 연결 및 검증
- [o] `MyPage.vue`: 내 프로필 및 권한/상태 정보 연동
- [o] `Address.vue`: 배송지 관리 UI 및 모달 구현
- [o] `StoreProfile.vue`: 내 상점(Store) 설정 및 프로필 편집 UI 구현

### Phase 2: 카드 도감 및 추가 요청 시스템 (완료)
- [o] `Dex.vue`: 메인 포켓몬 도감 그리드 및 상세 필터(지방/타입/이름) 구현
- [o] `Cards.vue`: 하드코딩된 필터 옵션을 백엔드 메타데이터 API와 연동
- [o] PokéAPI 연동 이미지 및 한국어 데이터 최적화
- [o] 로딩 시 Skeleton UI 적용으로 UX 완성도 향상

### Phase 3: 상품 출품(SaleCard) 및 관심(Watchlist) 연동 (완료)
- [o] **Phase 3-C**: 다중 이미지 업로드 및 미리보기 구현
- [o] **Phase 3-D**: 카드 도감 기반 출품 폼 및 상세 페이지 필터링 연동
- [o] **Phase 3-E**: 관심 상품(Watchlist) 찜하기 토글 및 목록 페이지 구현

### Phase 4: 주문/결제/배송 인프라 구축 (**진행 예정**)
- [x] **주문서 작성 (`Checkout.vue`)**: 배송지 선택, 거래 방식(택배/직거래) 토글, 결제 금액 명세서.
- [x] **포트원(PortOne) 결제 연동**: SDK 연동, 결제창 실행, 서버 사이드 검증 연동 (`/payments/verify`).
- [x] **결제 결과 처리**: 결제 성공(`OrderSuccess.vue`) 및 실패(`OrderFailure.vue`) 전용 안내 페이지.
- [x] **실시간 상태 업데이트**: SSE 알림 연동을 통한 결제/배송 상태 실시간 UI 반영.

### Phase 5: 정산 및 거래 관리
- `OrderHistory.vue`: 구매/판매 내역 탭 분리 및 상태별 필터링.
- 거래 진행 액션: [판매자] 송장 번호 입력 모달, [구매자] 구매 확정 버튼.

### Phase 6: 시세 / 소통 / 신뢰도 / 알림
- `TradeHistory.vue`: 최근 거래 이력 테이블 및 시세 차트(Chart.js) 연동.
- `CommentsSection.vue`: 상품 문의 댓글 패널 및 비밀글 처리.
- `ReviewForm.vue`: 거래 완료 후 평점 및 후기 작성.

### Phase 7: 관리자 / 분쟁(Dispute) / 알림
- `DisputeForm.vue`: 상품 이상 시 분쟁 신고(이미지 업로드 포함) UI.
- Admin 백오피스: 주문/출품/회원 관리 전용 어드민 뷰 연동.

### Phase 8: 최적화 및 통합 검증
- Skeleton UI 및 전역 Loading/Error 핸들링 강화.
- E2E 시나리오 기반 전체 거래 프로세스 통합 테스트.
