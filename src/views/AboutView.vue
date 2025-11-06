<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <div class="about-image">
    <img src="/images/about.png" alt="About" width="250" height=auto />
  </div>
  <div class="about-product">
    <p>このアプリはホゲららら。</p>
    <p>例えばそれはホゲららら。</p>
    <p>らららららららら。</p>
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
.about-product {
  padding: 20px;
  align-items: center;
}
@media (min-width: 1024px) {
  .about-product {
    display: flex;
  }
  .about-members {

  }
  .ibuki-img {
    width: 300px;
    height:auto;
  }
  .about-ibuki {
    display: flex;
    align-items: left;
  }
  .migeru-img {
    width: 300px;
    height: auto;
  }
  .about-migeru {
    display: flex;
    align-items: center;
    gap: 20px;
    top: 20px;
    left: 20px;
  }
  .miumi-img {
    width: 300px;
    height: auto;
  }
  .about-miumi {
    display: flex;
    align-items: center;
    gap: 20px;
    top: 20px;
    left: 20px;
  }
  .ishii-img {
    width: 300px;
    height: auto;
  }
  .about-ishii {
    display: flex;
    align-items: center;
    gap: 20px;
    top: 20px;
    left: 20px;
  }
  .konboi-img {
    width: 300px;
    height: auto;
  }
  .about-konboi {
    display: flex;
    align-items: center;
    gap: 20px;
    top: 20px;
    left: 20px;
  }
}

@media (max-width: 1023px) {
  .about-image {
    text-align: center;
    margin-top: 20px;
  }
  .about-product {
    text-align: center;
  }
  .ibuki-img {
    width: 200px;
    height:auto;
  }
  .about-ibuki {
    text-align: center;
    margin: 40px 0;
  }
  .migeru-img {
    width: 200px;
    height: auto;
  }
  .about-migeru {
    width: "200";
    height: auto;
    text-align: center;
    margin: 40px 0;
  }
  .miumi-img {
    width: 200px;
    height: auto;
  }
  .about-miumi {
    width: "200";
    height: auto;
    text-align: center;
    margin: 40px 0;
  }
  .about-ishii {
    width: "200";
    height: auto;
    text-align: center;
    margin: 40px 0;
  }
  .konboi-img {
    width: 200px;
    height: auto;
  }
  .about-konboi {
    width: "200";
    height: auto;
    text-align: center;
    margin: 40px 0;
  }
}
</style>
