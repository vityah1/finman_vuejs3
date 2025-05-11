<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal
    v-if="currentMonoUser"
    v-model="showModal"
    @ok="doFormAction()"
    :title="okTitle"
    :okTitle="okTitle"
    >
      <template #modal-header>
        <h5 class="modal-title text-danger">
          {{okTitle}} MonoUser [{{ this.currentMonoUser.id }}]
        </h5>
      </template>
      <template #default>
        <b-form >
          <div class="form-group">
            <label>{{ currentMonoUser.name }}</label>
          </div>


          <div class="form-group">
            <label><strong>Name:</strong></label>
            <input type="text" class="form-control" id="amount" v-model="currentMonoUser.name" />
          </div>

          <div class="form-group">
            <label><strong>Token:</strong></label>
            <input type="text" class="form-control" id="amount" v-model="currentMonoUser.token" />
          </div>

        </b-form>
        <div>
          <p></p>
          <b-button v-if="currentMonoUser.action == 'edit'" variant="danger" @click="delMonoUser">
            Delete
          </b-button>
        </div>
      </template>
    </b-modal>

    <div class="row">
      <div class="col-4">
        <b-button variant="primary" @click="openFormAddMonoUser()"> Add Mono user</b-button>
      </div>
    </div>

    <div v-if="mono_users" class="row">
      <div class="col-12">
        <b-table-simple hover small caption-top responsive>
          <caption>Mono users</caption>
          <b-thead>
            <b-th>Name</b-th>
            <b-th>Token</b-th>
          </b-thead>

          <b-tbody>
            <b-tr v-for="(mono_user, index) in mono_users" :key="index" @click="openFormEditMonoUser(mono_user.id)">
              <b-td>{{ mono_user.name }}</b-td>
              <b-td>{{ mono_user.token }}</b-td>

            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MonoUsersService from "../../../services/MonoUsersService";
import { defineComponent } from 'vue';

interface MonoUser {
  id: number;
  name: string;
  token: string;
  [key: string]: any;
}

interface CurrentMonoUser {
  id?: number;
  name?: string;
  token?: string;
  action?: 'add' | 'edit';
  [key: string]: any;
}

interface AlertComponent {
  showAlert: (type: string, message: string) => void;
  [key: string]: any;
}

export default defineComponent({
  name: "MonoUsers",
  data() {
    return {
      okTitle: "",
      showModal: false,
      mono_users: [] as MonoUser[],
      currentMonoUser: {} as CurrentMonoUser,
      user: this.$route.query.user as string | undefined,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    openFormAddMonoUser(): void {
      this.okTitle = 'Add';
      this.currentMonoUser.token = '';
      this.currentMonoUser.name = '';
      this.currentMonoUser.action = 'add';
      this.showModal = true;
      console.log('this.currentMonoUser.action:', this.currentMonoUser.action)
    },
    async openFormEditMonoUser(id: number): Promise<void> {
      this.okTitle = 'Edit';
      MonoUsersService.getMonoUser(id)
        .then((response) => {
          this.currentMonoUser = response.data;
          this.currentMonoUser.action = 'edit';
          console.log(response.data, this.currentMonoUser.action);
          this.showModal = true;
        })
        .catch((e) => {
          console.log(e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'get User failed');
        });
    },
    doFormAction(): void {
      console.log('this.currentMonoUser.action: ', this.currentMonoUser.action)
      if (this.currentMonoUser.action == 'edit')
      {this.doUpdateMonoUser();}
      else if (this.currentMonoUser.action == 'add')
      {this.doAddMonoUser();}
    },
    async doUpdateMonoUser(): Promise<void> {
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
            (this.$refs.myAlert as AlertComponent).showAlert('success', 'User updated');
          })
          .catch((e) => {
            console.log(e);
            (this.$refs.myAlert as AlertComponent).showAlert('danger', 'User update failed');
          });
    },
    async doAddMonoUser(): Promise<void> {
        MonoUsersService.addMonoUser(this.currentMonoUser)
          .then((response) => {
            this.currentMonoUser = response.data;
            this.mono_users.push(this.currentMonoUser);
            (this.$refs.myAlert as AlertComponent).showAlert('success', 'User added');
          })
          .catch((e) => {
            console.log(e);
            (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Add user failed');
          });
          this.showModal = false;
    },
    async delMonoUser(): Promise<void> {
      MonoUsersService.deleteMonoUser(this.currentMonoUser.id)
        .then((response) => {
          console.log(response.data.data);
          const index = this.mono_users
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentMonoUser.id);

          this.mono_users.splice(index, 1);
          this.showModal = false;
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'User deleted');
        })
        .catch((e) => {
          console.log(e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'User delete failed');
        });
    },
    async getMonoUsers(): Promise<void> {
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
  mounted(): void {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    this.getMonoUsers();
  }
})
</script>
