<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link to="./" class="navbar-brand">ФМ</router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          id="btn-collapse"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <ul class="collapse navbar-collapse" id="navbarSupportedContent">
          <div class="navbar-nav me-auto mb-2 mb-lg-0">
            <!-- <li v-if="currentUser" class="nav-item"> -->
            
              <ul v-if="currentUser" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Mono
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li class="dropdown-item">
                  <router-link
                    :to="{ name: 'mono_user_token' }"
                    class="nav-link clsMenu"
                  >
                    <font-awesome-icon icon="card" /> Show tokens
                  </router-link>
                </li>
                <li class="dropdown-item">
                  <router-link :to="{ name: 'mono_payments' }" class="nav-link clsMenu">
                    <font-awesome-icon icon="card" /> Payments
                  </router-link>
                </li>
              </div>
            </ul>
            
              <router-link
              v-if="currentUser"
              :to="{ name: 'payments_add' }"
              class="nav-item nav-link clsMenu"
            >
              Add</router-link
            >

            <!-- </li> -->
            <li v-if="currentUser" class="nav-item">
              <router-link :to="{ name: 'payments_period' }" class="nav-link clsMenu"
                >Поточні</router-link
              >
            </li>
            <li v-if="currentUser" class="nav-item">
              <router-link :to="{ name: 'payments_last' }" class="nav-link clsMenu"
                >Останні</router-link
              >
            </li>
            <li v-if="currentUser" class="nav-item">
              <router-link :to="{ name: 'payments_years' }" class="nav-link clsMenu"
                >Роки</router-link
              >
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'about' }" class="nav-link clsMenu">
                <font-awesome-icon icon="home" />Про
              </router-link>
            </li>

            <ul v-if="!currentUser" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Usr
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li class="dropdown-item">
                  <router-link
                    :to="{ name: 'register' }"
                    class="nav-link clsMenu"
                  >
                    <font-awesome-icon icon="user-plus" /> Sign Up
                  </router-link>
                </li>
                <li class="dropdown-item">
                  <router-link :to="{ name: 'login' }" class="nav-link clsMenu">
                    <font-awesome-icon icon="sign-in-alt" /> Login
                  </router-link>
                </li>
              </div>
            </ul>
            <li v-if="currentUser" class="nav-item">
              <router-link :to="{ name: 'profile' }" class="nav-link clsMenu">
                <font-awesome-icon icon="user" />
                {{ currentUser.login }}
              </router-link>
            </li>
            <li v-if="currentUser" class="nav-item">
              <a class="nav-link clsMenu" @click.prevent="logOut">
                <font-awesome-icon icon="sign-out-alt" /> LogOut
              </a>
            </li>
          </div>

          <form class="d-flex" v-if="currentUser">
            <input
              type="text"
              class="form-control me-2"
              placeholder="Search"
              v-model="q"
            />
            <button
              class="btn btn-outline-success clsMenu"
              type="button"
              @click="AppFindCosts(q)"
              placeholder="Search"
              aria-label="Search"
            >
              Search
            </button>
          </form>
        </ul>
      </div>
    </nav>
  </div>
  <router-view :key="$router.fullPath" />
</template>

<script>
export default {
  // data() {
  //   return {
  //     toggle: true, //toggle variable
  //   };
  // },
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
    // showAdminBoard() {
    //   if (this.currentUser && this.currentUser["roles"]) {
    //     return this.currentUser["roles"].includes("ROLE_ADMIN");
    //   }

    //   return false;
    // },
    // showModeratorBoard() {
    //   if (this.currentUser && this.currentUser["roles"]) {
    //     return this.currentUser["roles"].includes("ROLE_MODERATOR");
    //   }

    //   return false;
    // },
  },
  watch: {
    // $route() {
    //   // $('#navbar-collapse').collapse('hide');
    //   document
    //     .querySelector("#navbarSupportedContent")
    //     .classList.toggle("show");
    //   // document.querySelector("#btn-collapse").click();
    // },
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push({ name: "login" });
    },
    AppFindCosts(q) {
      // this.$router.push({ name: "payments", params: { q: q } });
      this.$router.push({ name: "payments", query: { q: q } });
      // this.$router.go({ path: '/payments', query: { q: q } });
    },
  },
  mounted() {
    // import * as bootstrap from "bootstrap";
    // window.bootstrap = require("bootstrap")
    const navLinks = document.querySelectorAll(".clsMenu");
    // const menuToggle = document.getElementById("navbarSupportedContent");
    // const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
    // const bsCollapse = new bootstrap.Collapse(document.getElementById('navbarSupportedContent'), { toggle: false });
    // const bsCollapse = document.getElementById("btn-collapse");
    navLinks.forEach((l) => {
      l.addEventListener("click", () => {
        // bsCollapse.click();
        document
          .querySelector("#navbarSupportedContent")
          // .classList.toggle("show");
          .classList.remove("show");
        // document.querySelector("#btn-collapse").click();
      });
    });
  },

  //   watch(()=>route.params, (previous, current) => {
  //   console.log(`${previous} and ${current}`);
  // },{deep:true})
};
</script>

<style>
.profile-img-card {
  max-height: 192px;
  max-width: 192px;
  align-self: center;
}
</style>