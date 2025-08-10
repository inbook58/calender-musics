<template>
  <header>
    <RouterLink to="/">Home</RouterLink>
  </header>
  <router-view />
</template>

<style>
header {
  background-color: #f0f0f0;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
}

header a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}
</style>
