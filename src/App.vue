<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand">ФМ</router-link>
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

        <div class="col-md-6">
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Search"
              v-model="q"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="AppFindCosts(q)"
              >
                Search
              </button>
            </div>
          </div>
        </div>
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
  methods: {
    AppFindCosts(q) {
      // this.$router.push({ name: "costs", params: { q: q } });
      this.$router.push({ path: "/costs", query: { q: q } });
      // this.$router.go({ path: '/costs', query: { q: q } });
    },
  },

  //   watch(()=>route.params, (previous, current) => {
  //   console.log(`${previous} and ${current}`);
  // },{deep:true})
};
</script>