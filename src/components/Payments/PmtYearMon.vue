<template>
	<div>
		<PCard>
			<template #content>
				<alert-component ref="myAlert"></alert-component>

				<!-- Period and filter selector -->
				<div>
					<selector-component @change="handleSelectChange" :currentYear="year" :currentMonth="month" />
				</div>

				<!-- Month and Year display with icon -->
				<PCard>
					<template #header>
						<div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
							<i class="pi pi-calendar" style="font-size: 1.5rem; color: var(--primary-color);"></i>
							<h2 style="margin: 0; font-weight: 600;">
								{{ getMonthName(month) }} {{ year }}
							</h2>
						</div>
					</template>

					<template #content>
						<!-- Categories table with PrimeVue DataTable - NO CHECKBOXES on month level -->
						<DataTable
							:value="catcosts"
							:loading="loading"
							@row-click="onRowClick"
							dataKey="category_id"
							:paginator="false"
							showGridlines
							stripedRows
						>
							<template #empty>
								<div style="text-align: center; padding: 2rem;">
									<i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary); margin-bottom: 1rem; display: block;"></i>
									<span style="color: var(--text-color-secondary);">Немає даних за цей період</span>
								</div>
							</template>

							<Column field="name" header="Категорія" style="width: 50%">
								<template #body="slotProps">
									<div style="display: flex; align-items: center; gap: 0.5rem;">
										<i class="pi pi-folder" style="color: var(--primary-color);"></i>
										<span style="font-weight: 500;">{{ slotProps.data.name }}</span>
									</div>
								</template>
							</Column>

							<Column field="amount" header="Сума" style="width: 35%; text-align: right;">
								<template #body="slotProps">
									<div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem;">
										<span style="font-weight: 600; font-size: 1.1rem;">{{ slotProps.data.amount.toLocaleString() }}</span>
										<span style="color: var(--text-color-secondary); font-size: 0.9rem;">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
									</div>
								</template>
							</Column>

							<Column field="cnt" header="К-ть" style="width: 15%; text-align: center;">
								<template #body="slotProps">
									<PTag :value="slotProps.data.cnt" severity="info" />
								</template>
							</Column>

						</DataTable>

						<!-- Summary panel aligned with table -->
						<div style="margin-top: 1rem; padding: 1rem; background: var(--surface-ground); border-radius: 0.375rem; border: 1px solid var(--surface-border);">
							<div style="display: flex; justify-content: flex-end; align-items: center; gap: 2rem;">
								<div style="display: flex; align-items: center; gap: 0.5rem;">
									<span style="color: var(--text-color-secondary); font-weight: 500;">Операцій:</span>
									<PTag :value="total_cnt" severity="success" style="font-weight: 600;" />
								</div>
								<div style="display: flex; align-items: center; gap: 0.25rem;">
									<span style="color: var(--text-color-secondary); font-weight: 500;">Загальна сума:</span>
									<span style="font-weight: 700; font-size: 1.4rem; color: var(--primary-color);">{{ total.toLocaleString() }}</span>
									<span style="color: var(--text-color-secondary); font-size: 1rem;">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
								</div>
							</div>
						</div>
					</template>
				</PCard>
			</template>
		</PCard>
	</div>
</template>

<script>
import SelectorComponent from "../SelectorComponent.vue";
import PaymentService from "../../services/PaymentService";
import { getErrorMessage, logError } from '@/utils/errorHandler';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

/**
 * @typedef {Object} CategoryCost
 * @property {number} category_id
 * @property {string} name
 * @property {number} amount
 * @property {number} cnt
 */

/**
 * @typedef {Object} RequestParams
 * @property {(number|string)} year
 * @property {(number|string)} month
 * @property {string} [group_user_id]
 * @property {string} [currency]
 * @property {boolean} [forceUpdate]
 */

export default {
  name: "PaymentYearMonth",
  components: {
    SelectorComponent,
    DataTable,
    Column,
    PCard: Card,
    PTag: Tag
  },
  data() {
    return {
      catcosts: [],
      loading: false,
      q: "",
      year: parseInt(this.$route.params.year) || new Date().getFullYear(),
      month: parseInt(this.$route.params.month) || new Date().getMonth() + 1,
      total: 0,
      total_cnt: 0,
      group_user_id: this.$route.query.group_user_id || localStorage.getItem('selectedGroupUserId') || undefined,
      lastRequest: null,
      isRequestInProgress: false
    };
  },
  methods: {
    getMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);
      return date.toLocaleString('uk-UA', { month: 'long' });
    },

    onRowClick(event) {
      // На рівні місяця завжди переходимо в категорію
      const category = event.data;
      this.navigateToCategory(category.category_id);
    },

    navigateToCategory(categoryId) {
      this.$router.push({
        name: 'payments',
        params: { year: this.year, month: this.month, category_id: categoryId },
        query: { group_user_id: this.group_user_id }
      });
    },

    areParamsValid(params) {
      if (!params) return false;
      
      // Перевіряємо кастомні дати
      if (params.start_date && params.end_date) {
        return true;
      }
      
      // Перевіряємо рік/місяць
      return !!params.year && !!params.month;
    },

    // У методі safeApiRequest зробіть валюту частиною унікального ідентифікатора запиту
    async safeApiRequest(params) {
      console.log("Планується запит з параметрами:", params);

      if (!this.areParamsValid(params)) {
        console.warn("Пропуск запиту з невалідними параметрами", params);
        return null;
      }

      // Додайте валюту до параметрів для формування унікального ключа
      const fullParams = {
        ...params,
        currency: params.currency || this.$store.state.sprs.selectedCurrency
      };

      // Включіть валюту в requestKey
      const requestKey = JSON.stringify(fullParams);

      // Перезаписуйте lastRequest якщо валюта змінилася
      if (this.lastRequest === requestKey && !params.forceUpdate) {
        console.warn("Пропуск повторного запиту з тими самими параметрами");
        return null;
      }

      this.isRequestInProgress = true;
      this.lastRequest = requestKey;

      try {
        const response = await PaymentService.getPaymentsPeriod(fullParams);

        // Обробка результату як і раніше...
        this.catcosts = response.data;
        let total = 0;
        let total_cnt = 0;
        this.catcosts.forEach((val) => {
          total += Number(val.amount);
          total_cnt += Number(val.cnt);
        });
        this.total = total;
        this.total_cnt = total_cnt;

        return response;
      } catch (error) {
        logError(error, "PmtYearMon API request");
        const errorMessage = getErrorMessage(error, "Помилка завантаження даних");
        if (this.$refs.myAlert) {
          this.$refs.myAlert.showAlert("danger", errorMessage);
        }
        // Очищуємо дані при помилці
        this.catcosts = [];
        this.total = 0;
        this.total_cnt = 0;
        throw error;
      } finally {
        this.isRequestInProgress = false;
      }
    },

    // Обробник події зміни фільтрів
    handleSelectChange(eventData) {
      if (!eventData) {
        console.warn("Пропуск обробки події з неповними даними", eventData);
        return;
      }

      // Перевіряємо режим фільтрації
      if (eventData.mode === 'custom') {
        if (!eventData.start_date || !eventData.end_date) {
          console.warn("Пропуск обробки кастомного періоду без дат", eventData);
          return;
        }
      } else {
        if (!eventData.year || !eventData.month) {
          console.warn("Пропуск обробки періоду без року/місяця", eventData);
          return;
        }
      }

      console.log("Обробка події зміни фільтрів:", eventData);

      // Оновлення локальних параметрів
      if (eventData.mode === 'period') {
        this.year = eventData.year;
        this.month = eventData.month;
      }
      this.group_user_id = eventData.group_user_id;

      // Зберігаємо у localStorage
      if (eventData.group_user_id) {
        localStorage.setItem('selectedGroupUserId', eventData.group_user_id);
      } else {
        localStorage.removeItem('selectedGroupUserId');
      }

      // Виконуємо запит з правильними параметрами
      const requestParams = eventData.mode === 'custom' 
        ? {
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            group_user_id: this.group_user_id
          }
        : {
            year: this.year,
            month: this.month,
            group_user_id: this.group_user_id
          };

      this.safeApiRequest(requestParams).then(() => {
        // Оновлюємо URL ТІЛЬКИ після успішного запиту
        const query = {};
        if (this.group_user_id) query.group_user_id = this.group_user_id;

        // Використовуємо replace, щоб не створювати нову запись в історії
        this.$router.replace({
          name: 'payments_year_month',
          params: { year: this.year, month: this.month },
          query
        }).catch((err) => {
          // Ігноруємо помилки навігації
          console.warn("Ігнорована помилка навігації:", err);
        });
      }).catch((error) => {
        // Помилка вже оброблена в safeApiRequest, просто логуємо
        console.warn("Запит не вдався, URL не оновлено");
      });
    }
  },
  mounted() {
    // При монтуванні компонента виконуємо початковий запит
    this.safeApiRequest({
      year: this.year,
      month: this.month,
      group_user_id: this.group_user_id
    }).catch((error) => {
      // Помилка вже оброблена в safeApiRequest
      console.warn("Початковий запит не вдався");
    });
  },
	watch: {
  '$store.state.sprs.selectedCurrency'(newCurrency) {
    // Передайте forceUpdate: true, щоб обійти перевірку на повторний запит
    this.safeApiRequest({
      year: this.year,
      month: this.month,
      group_user_id: this.group_user_id,
      currency: newCurrency,
      forceUpdate: true
    }).catch((error) => {
      // Помилка вже оброблена в safeApiRequest
      console.warn("Запит при зміні валюти не вдався");
    });
  }
	}
};
</script>

<style scoped>
/* NO CUSTOM STYLES - USING PURE PRIMEVUE DEFAULTS */
</style>