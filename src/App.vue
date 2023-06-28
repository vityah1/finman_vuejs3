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
    currentYear() {
      return new Date().getFullYear();
    },
    currentMonth() {
      const monthIndex = new Date().getMonth();
      const month = monthIndex + 1;
      return month;
    }, 
    category_id() {
      if (this.$route.params.category_id){return this.$route.params.category_id;}
      return '_'
    }   
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push({ name: "login" });
    },
    AppFindPayments(q) {
      this.$router.push({ name: "payments", query: { q: q } });
    },
    GoToAddPayment() {
      // let category_id = '_';
      // if (this.$router.params.category_id){category_id = this.$router.params.category_id;}
      this.$router.push({ name: "payments", 
      params: { action: 'add' , year: this.currentYear, month: this.currentMonth, category_id: this.category_id} });
    },
  },
}
</script>

<template>
  <link rel="stylesheet" 
        href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" 
        integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" 
        crossorigin="anonymous">
  <div class="container">
    <b-navbar toggleable="lg">
      <b-navbar-brand>
        <div v-if="currentUser">         
            <a class="nav-link" @click.prevent="GoToAddPayment()"> 
              <i class="fas fa-plus" style="color: #15e52d;"></i> Add
            </a>
        </div>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item><router-link class="nav-link" :to="{ path: '/' }">
            <i class="fas fa-home"></i> Home</router-link></b-nav-item>
          <b-nav-item v-if="currentUser"><router-link class="nav-link" 
            :to="{ name: 'payments_year_month', params: { year: currentYear, month: currentMonth }}">
            Current</router-link></b-nav-item>
          <b-nav-item v-if="currentUser">
            <router-link class="nav-link" 
            :to="{ name: 'payments', 
            params: {action: 'last', year: currentYear, month: currentMonth, category_id: '_'} }">
            Last</router-link></b-nav-item>
          <b-nav-item v-if="currentUser">
            <router-link class="nav-link" 
            :to="{ name: 'payments_years' }">
            Years</router-link></b-nav-item>

          <b-nav-item-dropdown text="Banks" v-if="currentUser">
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_user_token' }"> 
                <i class="fas fa-paw"></i> Show tokens
              </router-link></b-dropdown-item>
              <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_users' }">
                <i class="fas fa-paw"></i> Mono users</router-link>
            </b-dropdown-item>              
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'mono_payments' }">
                <i class="fas fa-paw"></i> Mono payments</router-link>
            </b-dropdown-item>

            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'revolut' }">
                <i class="fas fa-euro-sign"></i> Revolut</router-link>
            </b-dropdown-item>            
          </b-nav-item-dropdown>

          <b-nav-item-dropdown text="User">
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'login' }">
                <i class="fas fa-sign-in-alt"></i> Login
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item>
              <router-link class="nav-link" :to="{ name: 'register' }">
                <i class="fas fa-user-plus"></i> SignUp
              </router-link>
            </b-dropdown-item>
            <b-dropdown-item v-if="currentUser">
              <b-nav-item><router-link class="nav-link" :to="{ name: 'config' }">
                <i class="fas fa-cog"></i> Settings
                </router-link></b-nav-item>
            </b-dropdown-item>
            <b-dropdown-item v-if="currentUser">
              <a class="nav-link" @click.prevent="logOut">
                <i class="fas fa-sign-out-alt"></i> Logout
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
  