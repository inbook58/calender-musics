<template>
  <section class="product-section">
    <a href="https://diadia2026.base.shop/items/122333158" target="_blank" rel="noopener noreferrer" class="product-link">
      <div class="product-image">
        <img src="/images/pics_product2.jpg" alt="diadia calendar">
      </div>
      <div class="product-info">
        <h2 class="product-name">diadia</h2>
        <h2 class="product-name">日めくりカレンダー2026</h2>
        <p class="product-price">¥3,500</p>
        <p class="product-note">※ 外部販売サイトへ遷移します</p>
      </div>
    </a>
  </section>
</template>

<style scoped>
.product-section {
  padding: 20px;
  text-align: center;
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

.product-note {
  font-size: 0.75em;
  color: #888;
  margin-top: 5px;
  text-align: left; /* product-info内の他のテキストと揃える */
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
