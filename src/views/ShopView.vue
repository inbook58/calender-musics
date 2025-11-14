<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
</script>

<template>
  <TheHeader />
  <div class="product-description">
    <h1 class="heading">SHOP</h1>
    <div class="product-specs">
    <p>サイズ：A5</p>
    <p>厚み　：2.5cm</p>
    </div>
  </div>
  <ProductCard :show-notes="true" />
  <div class="about-product">

  </div>
</template>

<style scoped>

.heading {
  font-family: 'Noto Serif JP', serif;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 10px 0px 16px 0px;
}

.product-description {
  text-align: center;
  padding: 0 40px;
}

.product-specs{
  margin-bottom: 16px;
}
</style>
