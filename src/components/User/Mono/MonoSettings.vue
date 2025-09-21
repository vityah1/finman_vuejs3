<template>
  <div>
    <AlertComponent ref="myAlert"></AlertComponent>

    <!-- Main content -->
    <PCard>
      <template #header>
        <div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="pi pi-key" style="font-size: 1.5rem; color: var(--primary-color);"></i>
          <span style="font-weight: 600;">Моно токени</span>
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
        <div v-if="mono_users.length === 0" style="text-align: center; padding: 2rem; color: var(--text-color-secondary);">
          <i class="pi pi-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          Немає Моно користувачів для налаштування токенів
        </div>

        <div v-for="mono_user in mono_users" :key="mono_user.mono_user_id" style="margin-bottom: 2rem;">
          <PCard>
            <template #header>
              <div style="padding: 1rem;">
                <h4 style="margin: 0; color: var(--text-color);">{{ mono_user.name }}</h4>
              </div>
            </template>

            <template #content>
              <!-- API Webhook Info -->
              <div style="margin-bottom: 1.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Webhook цього API сервера:</label>
                <InputText
                  :value="mono_user.this_api_webhook"
                  readonly
                  style="width: 100%; font-family: monospace; background-color: var(--surface-100);"
                />
              </div>

              <!-- User Webhook Setting -->
              <div style="margin-bottom: 1.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Поточний webhook користувача:</label>
                <div style="display: flex; gap: 0.5rem;">
                  <InputText
                    v-model="mono_user.webHookUrl"
                    placeholder="Введіть URL webhook"
                    style="flex: 1;"
                  />
                  <PButton
                    label="Встановити webhook"
                    icon="pi pi-save"
                    @click="save_webhook(mono_user.mono_user_id, mono_user.webHookUrl)"
                  />
                </div>
              </div>

              <!-- Accounts Table -->
              <div v-if="mono_user.filteredData && mono_user.filteredData.length > 0">
                <label style="font-weight: 600; margin-bottom: 1rem; display: block;">Рахунки користувача:</label>
                <DataTable :value="mono_user.filteredData" stripedRows>
                  <Column field="type" header="Тип" />
                  <Column field="maskedPan" header="Картка">
                    <template #body="{ data }">
                      <div>
                        <div v-for="(pan, index) in data.maskedPan" :key="index" style="font-family: monospace;">
                          {{ pan }}
                        </div>
                        <PTag :value="'ID: ' + data.id" severity="secondary" style="margin-top: 0.25rem;" />
                      </div>
                    </template>
                  </Column>
                  <Column field="balance" header="Баланс">
                    <template #body="{ data }">
                      <span style="font-weight: 600; color: var(--green-500);">
                        {{ (data.balance / 100).toLocaleString() }} {{ getCurrenciesByCode(data.currencyCode) }}
                      </span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>
          </PCard>
        </div>
      </template>
    </PCard>
  </div>
</template>

<script lang="ts">
import MonoService from "../../../services/MonoService";
import { defineComponent } from 'vue';

// PrimeVue imports
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

// Additional components
import AlertComponent from '../../AlertComponent.vue';

export default defineComponent({
  name: "MonoSettings",
  components: {
    PCard: Card,
    DataTable,
    Column,
    PButton: Button,
    InputText,
    PTag: Tag,
    AlertComponent
  },
  data() {
    return {
      mono_users: [],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    getCurrenciesByCode(currencyCode) {
    const currency = this.currencies.find(c => c.currencyCode === currencyCode);
    return currency ? currency.currency : '';
  },
    async save_webhook(mono_user_id, webHookUrl) {
      var data = {
        mono_user_id: mono_user_id,
        webHookUrl: webHookUrl
      };
      console.log(data);
      MonoService.setWebhook(data)
        .then((response) => {
          this.content = JSON.stringify(response.data, null, 2);
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.currencies = this.$store.state.sprs.currencies;
    MonoService.GetMonoUsersInfo(this.currentUser.id).then(
      (response) => {
        this.mono_users = response.data;
        console.log(this.jsonResponse);
        this.mono_users.forEach((element) => {
          element.filteredData = element.accounts.filter(
            item => item.currencyCode > 25 && (
              item.type == 'black' || item.type == 'white'));
        });
      },
      (error) => {
        this.content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
  },
  methods: {
    save_webhook(monoUserId: number, webhookUrl: string) {
      // Implementation for saving webhook
      console.log('Saving webhook for user:', monoUserId, 'URL:', webhookUrl);
      // You would call MonoService.setWebhook or similar here
    },
    goBackToSettings() {
      this.$router.push({ name: 'config', query: { section: 'mono' } });
    },
  },
});
</script>