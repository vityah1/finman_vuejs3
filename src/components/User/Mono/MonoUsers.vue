<template>
  <div>
    <AlertComponent ref="myAlert"></AlertComponent>

    <!-- Modal -->
    <Dialog
      v-if="currentMonoUser"
      v-model:visible="showModal"
      :header="okTitle + ' MonoUser [' + currentMonoUser.id + ']'"
      modal
      style="width: 50rem"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div style="margin-bottom: 1rem;">
        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Name:</label>
        <InputText v-model="currentMonoUser.name" style="width: 100%;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Token:</label>
        <InputText v-model="currentMonoUser.token" style="width: 100%;" />
      </div>

      <template #footer>
        <PButton label="Скасувати" icon="pi pi-times" text @click="showModal = false" />
        <PButton v-if="currentMonoUser.action == 'edit'" label="Видалити" icon="pi pi-trash" severity="danger" @click="delMonoUser" />
        <PButton :label="okTitle" icon="pi pi-check" @click="doFormAction" />
      </template>
    </Dialog>

    <!-- Main content -->
    <PCard>
      <template #header>
        <div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="pi pi-users" style="font-size: 1.5rem; color: var(--primary-color);"></i>
          <span style="font-weight: 600;">Моно користувачі</span>
          <PButton
            icon="pi pi-arrow-left"
            label="Назад"
            text
            @click="goBackToSettings"
            style="margin-left: auto;"
          />
        </div>
      </template>

      <template #content>
        <div style="margin-bottom: 1rem;">
          <PButton label="Додати Моно користувача" icon="pi pi-plus" @click="openFormAddMonoUser()" />
        </div>

        <DataTable
          v-if="mono_users"
          :value="mono_users"
          @row-click="(event) => openFormEditMonoUser(event.data.id)"
          dataKey="id"
          stripedRows
          style="cursor: pointer;"
        >
          <template #empty>
            <div style="text-align: center; padding: 2rem; color: var(--text-color-secondary);">
              <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
              Немає Моно користувачів
            </div>
          </template>

          <Column field="id" header="ID" style="width: 80px;">
            <template #body="{ data }">
              <PTag :value="'#' + data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="name" header="Ім'я" />

          <Column field="token" header="Токен">
            <template #body="{ data }">
              <span style="font-family: monospace; font-size: 0.9rem;">
                {{ data.token ? data.token.substring(0, 20) + '...' : 'Не вказано' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </PCard>
  </div>
</template>

<script lang="ts">
import MonoUsersService from "../../../services/MonoUsersService";
import { defineComponent } from 'vue';

// PrimeVue imports
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

// Additional components
import AlertComponent from '../../AlertComponent.vue';

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
  components: {
    PCard: Card,
    DataTable,
    Column,
    PButton: Button,
    Dialog,
    InputText,
    PTag: Tag,
    AlertComponent
  },
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
    goBackToSettings() {
      this.$router.push({ name: 'config', query: { section: 'mono' } });
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
