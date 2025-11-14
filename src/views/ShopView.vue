<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <div class="product-description">
    <h1 class="heading">SHOP</h1>
    <div class="product-specs">
    <p>サイズ：A5</p>
    <p>厚み　：2.5cm</p>
    </div>
    <p>
      "diadia"は<br>スペイン語の "día a día"（一日一日）<br>という言葉から名づけました。<br><br>
      「一日一日を大切に」<br>という意味をもつこの言葉に、<br>その日と向き合ってほしいという<br>思いを込めました。<br><br>
      365日すべてのページに<br>その日の1曲があります。<br><br>
      ページを破って<br>QRコードを読み取るだけで<br>その日の1曲が聴けます。<br><br>
      diadiaは<br>あなたの1年を<br>音楽とともに楽しむカレンダーです。</p><br>
      <p class="note">* 本商品の使用にはSpotifyもしくはApple Musicの有料サブスクリプションに入会している必要があります</p>
      <p class="note">* 配信サービスの都合により楽曲が再生できない場合があります</p>
    </div>
  <section class="product-section text-block">
  <a href="https://diadia2026.base.shop/items/122333158" target="_blank" rel="noopener noreferrer" class="product-link">
    <div class="product-image">
      <img src="/images/pics_product2.jpg" alt="diadia calendar">
    </div>
    <div class="product-info">
      <h2 class="product-name">diadia</h2>
      <h2 class="product-name">日めくりカレンダー2026</h2>
      <p class="product-price">¥3,500</p>
    </div>
  </a>
  </section>
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

.product-section {
  padding: 20px;
  text-align: center;;
}

.product-specs{
  margin-bottom: 16px;
}

.note{
  font-size: 0.8em;
  color: #B00020;
  text-align: center;
  margin-top: 10px;
}

.product-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-decoration: none;
  color: inherit;
  max-width: 460px;
  margin: 0 auto;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.product-link:hover {
  background-color: #f9f9f9;
}

@media screen and (min-width: 481px)  {
  .product-image img {
    width: 200px;
    height: auto;
    border-radius: 8px;
  }

  .product-info {
    margin-left: 30px;
    text-align: left;
  }

  .product-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
  }

  .product-price {
    font-size: 1.1rem;
    margin: 8px 0 0;
    color: #555;
  }

  .product-link {
    margin-left: 20px;
  }
}
@media screen and (max-width: 480px) {
  .product-image img{
    width: 140px;
    height: auto;
    border-radius: 8px;
  }
  .product-info {
    margin-left: 16px;
    text-align: left;
  }
  .product-name {
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
  }
  .product-price {
    font-size: 0.9rem;
    margin: 0px 0 0;
    color: #555;
  }
}
</style>
