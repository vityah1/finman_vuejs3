# Utilities Module Structure - FinMan Vue.js

## 📁 Структура файлів

```
src/components/Utilities/
├── UtilitiesMain.vue      # Головна сторінка модуля з аналітикою
├── AddressList.vue        # Управління адресами/домогосподарствами  
├── ServiceList.vue        # Служби конкретної адреси
├── TariffList.vue         # Тарифи конкретної служби
├── ReadingList.vue        # Показники конкретної адреси
└── AddReading.vue         # Форма додавання показників
```

## 🚀 Додані маршрути в router.ts

```javascript
// Utilities routes
{
	path: "/utilities",
	name: "utilities",
	component: () => import("./components/Utilities/UtilitiesMain.vue"),
	meta: { requiresAuth: true },
},
{
	path: "/utilities/addresses", 
	name: "utilities_addresses",
	component: () => import("./components/Utilities/AddressList.vue"),
	meta: { requiresAuth: true },
},
{
	path: "/utilities/addresses/:addressId/services",
	name: "utilities_services", 
	component: () => import("./components/Utilities/ServiceList.vue"),
	meta: { requiresAuth: true },
},
{
	path: "/utilities/services/:serviceId/tariffs",
	name: "utilities_tariffs",
	component: () => import("./components/Utilities/TariffList.vue"), 
	meta: { requiresAuth: true },
},
{
	path: "/utilities/addresses/:addressId/readings",
	name: "utilities_readings",
	component: () => import("./components/Utilities/ReadingList.vue"),
	meta: { requiresAuth: true },
},
{
	path: "/utilities/readings/add",
	name: "utilities_add_reading", 
	component: () => import("./components/Utilities/AddReading.vue"),
	meta: { requiresAuth: true },
}
```

## 🧭 Додане меню в NavigationMenu.vue

```html
<b-nav-item-dropdown v-if="currentUser" text="Utilities">
	<template #button-content>
		<i class="fas fa-home"></i> Комунальні
	</template>
	<b-dropdown-item>
		<router-link :to="{ name: 'utilities' }" class="nav-link">
			<i class="fas fa-chart-line"></i> Головна
		</router-link>
	</b-dropdown-item>
	<b-dropdown-item>
		<router-link :to="{ name: 'utilities_addresses' }" class="nav-link">
			<i class="fas fa-map-marker-alt"></i> Адреси
		</router-link>
	</b-dropdown-item>
	<b-dropdown-item>
		<router-link :to="{ name: 'utilities_add_reading' }" class="nav-link">
			<i class="fas fa-plus"></i> Додати показники
		</router-link>
	</b-dropdown-item>
</b-nav-item-dropdown>
```

## 🔗 API Integration (ORVAL)

Модуль використовує автогенеровані хуки з `/src/api/utilities/utilities.ts`:

### Addresses API
- `useGetAddressesApiUtilitiesAddressesGet()`
- `useCreateAddressApiUtilitiesAddressesPost()` 
- `useUpdateAddressApiUtilitiesAddressesAddressIdPatch()`
- `useDeleteAddressApiUtilitiesAddressesAddressIdDelete()`

### Services API
- `useGetServicesApiUtilitiesServicesGet(params)`
- `useCreateServiceApiUtilitiesServicesPost()`
- `useUpdateServiceApiUtilitiesServicesServiceIdPatch()`
- `useDeleteServiceApiUtilitiesServicesServiceIdDelete()`

### Tariffs API
- `useGetTariffsApiUtilitiesTariffsGet(params)`
- `useCreateTariffApiUtilitiesTariffsPost()`
- `useUpdateTariffApiUtilitiesTariffsServiceIdPatch()`
- `useDeleteTariffApiUtilitiesTariffsServiceIdDelete()`

### Readings API  
- `useGetReadingsApiUtilitiesReadingsGet(params)`
- `useCreateReadingApiUtilitiesReadingsPost()`
- `useUpdateReadingApiUtilitiesReadingsServiceIdPatch()`
- `useDeleteReadingApiUtilitiesReadingsServiceIdDelete()`

## 💡 Рекомендації для подальшого розвитку

1. **Компонент ReadingList.vue** потребує доповнення логіки:
   - Редагування показників
   - Видалення показників  
   - Позначення як оплачені

2. **Додати компонент глобальних сповіщень** для відображення результатів операцій

3. **Інтеграція з основною системою платежів** FinMan для синхронізації даних

4. **Додати експорт даних** у PDF/Excel форматах

5. **Графіки споживання** для візуального аналізу

---
*Структура створена для FinMan Vue.js 3 проекту*
