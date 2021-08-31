<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand">Фін мен</router-link>
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link to="/catcosts" class="nav-link">Поточні</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/years" class="nav-link">По роках</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/add" class="nav-link">Додати</router-link>
        </li>
      </div>
    </nav>

    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "app",
};
</script>