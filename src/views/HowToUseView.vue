<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <div class="about-product">
    <div class="heading">
    <h1 class="heading-jp">カレンダーの使い方</h1>
    <h1 class="heading-en">How to use</h1>
    </div>
    <div class="how-to-use-container">
      <p>
        スマホで
        <a href="https://dia-a-dia.com" target="_blank" rel="noopener noreferrer">
          dia-a-dia.com
        </a>
        を開き<br>ブラウザのメニューボタンを押す
      </p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use1.jpg" alt="Ibuki">
    </div>
    <div class="how-to-use-container">
      <p>「ホーム画面に追加」を選択</p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use2.jpg" alt="Ibuki">
    </div>
    <div class="how-to-use-container">
      <p>アプリをインストール</p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use3.jpg" alt="Ibuki">
    </div>
    <div class="how-to-use-container">
      <p>インストールしたアプリを開くと<br>QRリーダーが表示される</p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use4.jpg" alt="Ibuki">
    </div>
    <div class="how-to-use-container">
      <p>カメラの使用許可を聞かれた場合は<br>これを許可する</p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use5.jpg" alt="Ibuki">
    </div>
    <div class="how-to-use-container">
      <p>QRリーダーを使って<br>その日のQRコードをカレンダーから読みとる</p>
      <img class="how-to-use-img" src="/images/how-to-use/how-to-use6.jpg" alt="Ibuki">
    </div>
  </div>

</template>

<style scoped>
.heading {
  text-align: center;
  margin-bottom: 20px;
}
.heading-jp {
  font-size: 1.6rem;
  margin: 0;
}
.heading-en {
  font-size: 1.2rem;
  margin: 0;
  color: #666;
  font-family: 'noto serif jp', serif;
}

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
  .how-to-use-container {
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
  .how-to-use-container {
    flex: 0 0 50%; /* Take up 50% of the width */
    margin-top: 50px;
  }
}
</style>
