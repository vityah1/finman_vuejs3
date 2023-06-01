<script>

export default {
  name: "app",
  computed: {
    currentUser() {
      try {
        return this.$store.state.auth.user;
      } catch {
        this.logOut();
        return "";
      }
    },
  },
  methods: {  
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push({ name: "Login" });
    },
    AppFindPayments(q) {
      this.$router.push({ name: "payments", query: { q: q } });
    },   
  }
}
</script>

<template>
  <div class="container">
    <b-navbar toggleable="lg">
      <b-navbar-brand href="#">FM</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item><router-link class="nav-link" :to="{ path: '/' }">Home</router-link></b-nav-item>

          <b-nav-item><router-link class="nav-link" :to="{ name: 'payments_add' }">Add</router-link></b-nav-item>
          <b-nav-item><router-link class="nav-link" :to="{ name: 'payments_period' }">Current</router-link></b-nav-item>
          <b-nav-item><router-link class="nav-link" :to="{ name: 'payments_last' }">Last</router-link></b-nav-item>
          <b-nav-item><router-link class="nav-link" :to="{ name: 'payments_years' }">Years</router-link></b-nav-item>

          <b-nav-item-dropdown text="Mono">
            <b-dropdown-item><router-link class="nav-link" :to="{ name: 'mono_user_token' }"> Show tokens
              </router-link></b-dropdown-item>
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_payments' }">
                Payments</router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_users' }">
                Mono users</router-link>
            </b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown text="User">
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'login' }">Login
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'register' }">SignUp
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <b-nav-item><router-link class="nav-link" :to="{ name: 'config' }">Settings</router-link></b-nav-item>
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item><router-link class="nav-link" :to="{ name: 'about' }">About</router-link></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>  
    <div><router-view :key="$router.fullPath" /></div>
  </div>
</template>
  