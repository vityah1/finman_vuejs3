<template>
  <div class="card">
    <Menubar :model="menuItems">
      <template #start>
        <router-link to="/" class="navbar-brand me-2 d-flex align-items-center">
          <i class="pi pi-home me-2"></i>
          <span class="fw-bold">FinMan</span>
        </router-link>
      </template>
      <template #end>
        <div class="d-flex align-items-center gap-2">
          <Dropdown v-if="currentUser" v-model="selectedCurrency" :options="currencyOptions" placeholder="Валюта" style="width: 6rem;" />
          <Button v-if="currentUser" icon="pi pi-plus" @click="goToAddPayment" rounded text />
          <Button type="button" icon="pi pi-user" @click="toggleUserMenu" aria-haspopup="true" aria-controls="overlay_menu" rounded text/>
          <Menu ref="userMenu" id="overlay_menu" :model="userMenuItems" :popup="true" />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Menu from 'primevue/menu';

const store = useStore();
const router = useRouter();

// --- State ---
const userMenu = ref();
const currentUser = computed(() => store.state.auth.user);
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// --- Currency Selector ---
const selectedCurrency = computed({
  get: () => store.state.sprs.selectedCurrency,
  set: (value) => store.dispatch("sprs/updateSelectedCurrency", value),
});
const currencyOptions = ref(['UAH', 'USD', 'EUR']);

// --- Menu Models ---
const menuItems = computed(() => {
  if (!currentUser.value) {
    return [
      {
        label: 'Про програму',
        icon: 'pi pi-info-circle',
        command: () => router.push('/about')
      }
    ];
  }
  return [
    {
      label: 'Поточний',
      icon: 'pi pi-calendar',
      command: () => router.push({ name: 'payments_year_month', params: { year: currentYear, month: currentMonth } })
    },
    {
      label: 'Витрати',
      icon: 'pi pi-chart-line',
      items: [
        {
          label: 'Останні',
          icon: 'pi pi-history',
          command: () => router.push({ name: 'payments', params: {action: 'last', year: currentYear, month: currentMonth, category_id: '_' }})
        },
        {
          label: 'Роки',
          icon: 'pi pi-calendar-times',
          command: () => router.push({ name: 'payments_years' })
        }
      ]
    },
    {
      label: 'Банки',
      icon: 'pi pi-building-columns',
      items: [
        {
          label: 'Mono',
          icon: 'pi pi-credit-card',
          command: () => router.push({ name: 'mono_payments' })
        },
        {
          label: 'Імпорт',
          icon: 'pi pi-upload',
          command: () => router.push({ name: 'import' })
        }
      ]
    },
    {
      label: 'Комунальні',
      icon: 'pi pi-building',
      items: [
        {
          label: 'Головна',
          icon: 'pi pi-chart-bar',
          command: () => router.push({ name: 'utilities' })
        },
        {
          label: 'Адреси',
          icon: 'pi pi-map-marker',
          command: () => router.push({ name: 'utilities_addresses' })
        },
        {
          label: 'Додати показники',
          icon: 'pi pi-plus-circle',
          command: () => router.push({ name: 'utilities_add_reading' })
        }
      ]
    },
    {
        label: 'Про програму',
        icon: 'pi pi-info-circle',
        command: () => router.push('/about')
    }
  ];
});

const userMenuItems = computed(() => {
  if (!currentUser.value) {
    return [
      { label: 'Вхід', icon: 'pi pi-sign-in', command: () => router.push('/login') },
      { label: 'Реєстрація', icon: 'pi pi-user-plus', command: () => router.push('/register') }
    ];
  }
  return [
    { label: `Профіль: ${currentUser.value.login}`, icon: 'pi pi-user', command: () => router.push('/profile') },
    { separator: true },
    { label: 'Категорії', icon: 'pi pi-tags', command: () => router.push('/category') },
    { label: 'Налаштування', icon: 'pi pi-cog', command: () => router.push('/config') },
    { separator: true },
    { label: 'Вихід', icon: 'pi pi-sign-out', command: () => logOut() }
  ];
});

// --- Methods ---
const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};

const logOut = () => {
  store.dispatch("auth/logout");
  router.push({ name: "login" });
};

const goToAddPayment = () => {
    const category_id = store.state.sprs.categories?.[0]?.id || '_';
    router.push({
        name: "payments",
        params: {
            year: currentYear,
            month: currentMonth,
            category_id: category_id,
        },
        query: {
            action: "add",
        },
    });
};

</script>

<style scoped>
/* Add any necessary styling here */
</style>
