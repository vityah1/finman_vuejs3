<template>
  <div class="container">
    <!-- Modal -->
    <b-modal v-model="showModal" title="Modal form">
          <div class="modal-header">
            <h5 class="modal-title text-danger" id="ModalLabel">
              Edit MonoUser [{{this.currentMonoUser.id}}]
            </h5>
            <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
            <button type="button" class="btn-close" @click="showModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form v-if="currentMonoUser">
              <div class="form-group">
                <label>{{currentMonoUser.name}}</label>
              </div>             


              <div class="form-group">
                <label><strong>Name:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentMonoUser.name" />
              </div>

              <div class="form-group">
                <label><strong>Token:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentMonoUser.token" />
              </div>

            </form>
            <p></p>
           
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger mr-2" @click="deleteMonoUser" data-bs-dismiss="modal">
              Delete
            </button>
            &nbsp;&nbsp;
            <button v-if="currentMonoUser.action=='edit'" class="btn btn-success" @click="updateMonoUser" data-bs-dismiss="modal">
              Update
            </button>
            <button v-else type="submit" class="btn btn-success" @click="add_mono_user_action" data-bs-dismiss="modal">
              Add
            </button> 
          </div>
      </b-modal>
    <div class="row">
      <div class="col-4"><button class="btn btn-primary" @click="add_mono_user_form()"> Add Mono user </button></div>
      <!-- <div class="col"></div> -->
    </div>
    <div class="row">
      <div class="col-2 h4 text-success"><p>{{ message }}</p></div>
    </div>
    <table class="table-sm table-hover">
      <thead>
        <th>Name</th>
        <th>Token</th>
      </thead>

      <tbody>
        <tr v-for="(mono_user, index) in mono_users" :key="index" data-bs-toggle="modal" data-bs-target="#editModal"
          @click="get_mono_user(mono_user.id)">
          <td>{{ mono_user.name }}</td>
          <td>{{ mono_user.token }}</td>

        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// import { Modal } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue'
import MonoUsersService from "../services/MonoUsersService";
// _ = Modal;
export default {
  components: {
    BModal
  },  
  name: "mono_users",
  data() {
    return {
      showModal: false,
      mono_users: [],
      currentMonoUser: {},
      message: "",
      user: this.$route.query.user,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    async add_mono_user_form() {
      this.currentMonoUser.token = '';
      this.currentMonoUser.name = name;
      this.currentMonoUser.action = 'add';
      this.showModal = true;
    },
    async add_mono_user_action() {
      MonoUsersService.addMonoUser(this.currentMonoUser)
        .then((response) => {
          this.currentMonoUser = response.data;
          this.mono_users.push(this.currentMonoUser.name);
          this.showModal = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },       
    async get_mono_user(id) {
      MonoUsersService.getMonoUser(id)
        .then((response) => {          
          this.currentMonoUser = response.data;          
          console.log(response.data);
          this.showModal = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updateMonoUser() {
      MonoUsersService.updateMonoUser(this.currentMonoUser.id, this.currentMonoUser)
        .then((response) => {
          this.currentMonoUser = response.data;
          this.mono_users.map((c, index) => {
            if (c.id == this.currentMonoUser.id) {
              this.mono_users[index] = {
                id: this.currentMonoUser.id,
                token: this.currentMonoUser.token,
                name: this.currentMonoUser.name,
              };
            }
          });
          this.showModal = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async deleteMonoUser() {
      MonoUsersService.deleteMonoUser(this.currentMonoUser.id)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;
          const index = this.mono_users
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentMonoUser.id);

          this.mono_users.splice(index, 1);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getMonoUsers() {
      MonoUsersService.getMonoUsers()
        .then((response) => {
          this.mono_users = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    this.getMonoUsers();
  },
};
</script>
