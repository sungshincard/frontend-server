<template>
  <div class="policy-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Policy</p>
        <h1>운영 정책</h1>
        <p>거래 방식, 정산, 분쟁, 자동 구매 확정 등 플랫폼 운영 기준을 한 번에 확인합니다.</p>
      </div>
    </div>

    <section class="policy-grid">
      <article class="policy-card">
        <h2>거래 방식</h2>
        <ul>
          <li>거래는 판매자와 구매자가 직접 진행합니다.</li>
          <li>택배 거래와 대면 거래를 모두 지원합니다.</li>
          <li>플랫폼은 에스크로 결제 보관과 주문 상태 추적을 담당합니다.</li>
        </ul>
      </article>

      <article class="policy-card">
        <h2>배송 및 구매 확정</h2>
        <ul>
          <li>택배 거래는 배송 완료 후 일정 기간 내 구매 확정을 받습니다.</li>
          <li>기한 내 확정이 없고 분쟁이 없으면 자동 구매 확정됩니다.</li>
          <li>미발송 시 주문 취소 및 환불 처리될 수 있습니다.</li>
        </ul>
      </article>

      <article class="policy-card">
        <h2>정산 정책</h2>
        <ul>
          <li>구매 확정 전까지 결제금은 판매자에게 정산되지 않습니다.</li>
          <li>플랫폼 수수료를 차감한 뒤 판매자에게 정산됩니다.</li>
          <li>분쟁 접수 시 정산은 자동 홀드될 수 있습니다.</li>
        </ul>
      </article>

      <article class="policy-card">
        <h2>분쟁 접수</h2>
        <ul>
          <li>상태 불일치, 배송 중 파손, 가품 의심 등은 주문 단위로 접수합니다.</li>
          <li>사진, 포장 상태, 언박싱 자료 등 증빙 제출을 권장합니다.</li>
          <li>운영 정책 범위 내에서 환불/반품/제재 여부를 검토합니다.</li>
        </ul>
      </article>

      <article class="policy-card">
        <h2>출품 기준</h2>
        <ul>
          <li>출품은 카드 도감(CardMaster)에 연결된 상태로 등록합니다.</li>
          <li>상태 등급, 감정 여부, 설명, 사진을 정확히 입력해야 합니다.</li>
          <li>허위 사진이나 상태 허위 기재는 제재 대상입니다.</li>
        </ul>
      </article>

      <article class="policy-card">
        <h2>배송비 / 수수료</h2>
        <ul>
          <li>배송비는 주문 단계에서 정책 기준으로 계산됩니다.</li>
          <li>거래 완료 시 플랫폼 수수료가 반영됩니다.</li>
          <li>세부 요율과 이벤트 기준은 운영 시점에 따라 조정될 수 있습니다.</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped>
.policy-page {
  padding: 40px 0 80px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-head h1,
.policy-card h2 {
  color: var(--color-text-strong);
  margin: 0;
}

.page-head p,
.policy-card li {
  color: var(--color-text-muted);
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.policy-card {
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
  padding: 24px;
}

.policy-card h2 {
  margin-bottom: 14px;
}

.policy-card ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

@media (max-width: 900px) {
  .policy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
