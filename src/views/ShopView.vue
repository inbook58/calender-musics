<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <div class="about-image">
    <img src="/images/about.png" alt="About" />
  </div>
  <div class="about-product">
    <div class="product-image-container">
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use1.jpg" alt="Ibuki">
    </div>
    <div class="product-description">
      <p>このアプリはホゲららら。</p>
    </div>
  </div>
  <div class="about-members">
    <div class="about-ibuki">
      <h2>いぶき</h2>
      <p></p>
    </div>
    <div class="about-migeru">
      <h2>ミゲル</h2>
      <p></p>
    </div>
    <div class="about-miumi">
      <h2>みうみ</h2>
      <p></p>
    </div>
    <div class="about-ishii">
      <h2>石井さん</h2>
      <p></p>
    </div>
    <div class="about-konboi">
      <h2>コンボーイ</h2>
      <p></p>
    </div>
  </div>
</template>

<style scoped>
.about-image,
.about-product {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.about-image img,
.how-to-use-img {
  width: 100%;
  height: auto;
  display: block;
}

.about-product {
  align-items: center;
}

.product-description {
  padding: 0 20px;
}

@media (min-width: 1024px) {
  .about-product {
    display: flex;
    gap: 20px;
  }
  .product-image-container {
    flex: 0 0 50%; /* Take up 50% of the width */
  }
  .product-description {
    flex: 1;
  }
}

@media (max-width: 1023px) {
  .about-image {
    text-align: center;
  }
  .about-product {
    text-align: center;
  }
}
</style>
