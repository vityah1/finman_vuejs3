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
      this.$router.push({ name: "login" });
    },
    AppFindPayments(q) {
      this.$router.push({ name: "payments", query: { q: q } });
    },
  },
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

          <b-nav-item v-if="currentUser"><router-link class="nav-link" 
            :to="{ name: 'payments', query: {'action': 'add'} }">Add</router-link></b-nav-item>
          <b-nav-item v-if="currentUser"><router-link class="nav-link" 
            :to="{ name: 'payments_period' }">Current</router-link></b-nav-item>
          <b-nav-item v-if="currentUser"><router-link class="nav-link" 
            :to="{ name: 'payments_last' }">Last</router-link></b-nav-item>
          <b-nav-item v-if="currentUser"><router-link class="nav-link" 
            :to="{ name: 'payments_years' }">Years</router-link></b-nav-item>

          <b-nav-item-dropdown text="Banks" v-if="currentUser">
            <b-dropdown-item><router-link class="nav-link" :to="{ name: 'mono_user_token' }"> Show tokens
              </router-link></b-dropdown-item>
              <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_users' }">
                Mono users</router-link>
            </b-dropdown-item>              
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_payments' }">
                Mono payments</router-link>
            </b-dropdown-item>

            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'revolut' }">
                Revolut</router-link>
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
            <b-dropdown-item v-if="currentUser">
              <b-nav-item><router-link class="nav-link" :to="{ name: 'config' }">Settings
                </router-link></b-nav-item>
            </b-dropdown-item>
            <b-dropdown-item v-if="currentUser">
              <a class="nav-link" @click.prevent="logOut">
                <font-awesome-icon icon="sign-out-alt" />Logout
              </a>
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item><router-link class="nav-link" :to="{ name: 'about' }">About</router-link></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div><router-view :key="$router.fullPath" /></div>
  </div>
</template>
  