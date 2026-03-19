<script setup>
// Home Component
</script>

<template>
  <div class="home">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="hero-content">
        <h1>PREMIUM CARDS<br>AUTHENTICATED TRADING</h1>
        <p>Buy and sell the rarest cards with confidence.</p>
        <button class="btn-primary shop-now-btn">Shop Now</button>
      </div>
    </section>

    <!-- Product Grid Example -->
    <section class="container products-section">
      <h2 class="title-section">New Arrivals</h2>
      <div class="products-grid">
        <!-- Sample Product 1 -->
        <div class="product-card">
          <div class="product-image">
            <!-- Placeholder for card image -->
            <div class="placeholder">Card Image</div>
          </div>
          <div class="product-info">
            <span class="brand">POKEMON</span>
            <h3 class="name">Pikachu Illustrator</h3>
            <p class="price">₩ 500,000</p>
          </div>
        </div>
        
        <!-- Sample Product 2 -->
        <div class="product-card">
          <div class="product-image">
            <div class="placeholder">Card Image</div>
          </div>
          <div class="product-info">
            <span class="brand">YUGIOH</span>
            <h3 class="name">Blue-Eyes White Dragon</h3>
            <p class="price">₩ 120,000</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background-color: #111;
  color: #fff;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 60px;
}

.hero-content h1 {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 2px;
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 16px;
  color: #ccc;
  margin-bottom: 30px;
}

.shop-now-btn {
  background-color: #fff;
  color: #000;
}

.shop-now-btn:hover {
  background-color: #f0f0f0;
  opacity: 1;
}

.products-section {
  margin-bottom: 80px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.product-card {
  cursor: pointer;
}

.product-image {
  background-color: var(--color-secondary);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.product-card:hover .product-image {
  transform: translateY(-4px);
}

.placeholder {
  color: var(--color-text-light);
  font-size: 14px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-light);
}

.name {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 4px;
}
</style>
