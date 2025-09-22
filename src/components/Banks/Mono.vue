<template>
  <div>
    <PCard>
      <template #header>
        <div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="pi pi-credit-card" style="font-size: 1.5rem; color: var(--primary-color);"></i>
          <span style="font-weight: 600;">Платежі MonoBank</span>
        </div>
      </template>

      <template #content>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <!-- Дата початку -->
          <div>
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
              <i class="pi pi-calendar" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
              Дата початку:
            </label>
            <Calendar
              v-model="start_date"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="РРРР-ММ-ДД"
              style="width: 100%;"
            />
          </div>

          <!-- Дата кінця -->
          <div>
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
              <i class="pi pi-calendar" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
              Дата кінця:
            </label>
            <Calendar
              v-model="end_date"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="РРРР-ММ-ДД"
              style="width: 100%;"
            />
          </div>

          <!-- Користувач Моно -->
          <div>
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
              <i class="pi pi-user" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
              Моно користувач:
            </label>
            <Dropdown
              v-model="mono_user_id"
              :options="monoUserOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Всі користувачі"
              style="width: 100%;"
            />
          </div>

          <!-- Дія -->
          <div>
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
              <i class="pi pi-cog" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
              Оберіть дію:
            </label>
            <Dropdown
              v-model="mode"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Оберіть дію"
              style="width: 100%;"
            />
          </div>
        </div>

        <PButton
          label="Отримати платежі"
          icon="pi pi-download"
          @click="getMonoPayments"
          :loading="isLoading"
          style="width: 100%; margin-bottom: 1rem;"
        />

        <!-- Результат -->
        <div v-if="HTMLResponse" style="margin-top: 1rem;">
          <PCard>
            <template #header>
              <div style="padding: 1rem;">
                <h5 style="margin: 0; color: var(--text-color);">
                  <i class="pi pi-info-circle" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                  Інформація про платежі:
                </h5>
              </div>
            </template>
            <template #content>
              <div v-html="HTMLResponse" style="font-family: monospace; white-space: pre-wrap;"></div>
            </template>
          </PCard>
        </div>

        <!-- Помилка -->
        <div v-if="content" style="margin-top: 1rem;">
          <Message severity="error" :closable="false">
            <div style="font-family: monospace;">{{ content }}</div>
          </Message>
        </div>
      </template>
    </PCard>
  </div>
</template>

<script>
import MonoService from "../../services/MonoService";
import MonoUsersService from '../../services/MonoUsersService';
import { defineComponent } from 'vue';

// PrimeVue imports
import Card from 'primevue/card';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Message from 'primevue/message';

export default defineComponent({
  name: "MonoPayments",
  components: {
    PCard: Card,
    Calendar,
    Dropdown,
    PButton: Button,
    Message
  },
  data() {
    return {
      HTMLResponse: '',
      content: '',
      start_date: '',
      end_date: '',
      mode: 'show',
      mono_users: [],
      mono_user_id: '',
      isLoading: false,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    monoUserOptions() {
      return [
        { label: 'Всі користувачі', value: '' },
        ...this.mono_users.map(user => ({
          label: user.name,
          value: user.id
        }))
      ];
    },
    modeOptions() {
      return [
        { label: 'Показати', value: 'show' },
        { label: 'Імпортувати', value: 'import' },
        { label: 'Синхронізувати', value: 'sync' }
      ];
    }
  },
  mounted() {
    this.getMonoUsers();
  },
  methods: {
    async getMonoPayments() {
      this.isLoading = true;
      this.HTMLResponse = '';
      this.content = '';

      // Конвертуємо дати з Date об'єктів в рядки якщо потрібно
      const formatDate = (date) => {
        if (!date) return '';
        if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        }
        return date;
      };

      const data = {
        user_id: this.currentUser.id,
        from_date: formatDate(this.start_date),
        to_date: formatDate(this.end_date),
        mode: this.mode,
        mono_user_id: this.mono_user_id,
      };

      console.log(data);

      try {
        const response = await MonoService.getMonoPayments(data);
        this.HTMLResponse = response.data;
      } catch (e) {
        console.log(e);
        this.content = e.response?.data?.message || e.message || 'Помилка завантаження платежів';
      } finally {
        this.isLoading = false;
      }
    },
    async getMonoUsers() {
      try {
        const response = await MonoUsersService.getMonoUsers();
        this.mono_users = response.data;
      } catch (e) {
        console.log(e);
        this.content = e.response?.data?.message || e.message || 'Помилка завантаження користувачів';
      }
    },
  },
});
</script>