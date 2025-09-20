<template>
	<div class="container-fluid">
		<div class="row justify-content-center">
			<div class="col-lg-10 col-xl-8">
				<alert-component ref="myAlert"></alert-component>

				<!-- Period and filter selector -->
				<div class="selector-wrapper mb-4">
					<selector-component @change="handleSelectChange" />
				</div>

				<!-- Month and Year display -->
				<div class="period-header mb-3">
					<h3 class="text-center fw-bold text-primary">
						{{ getMonthName(month) }} {{ year }}
					</h3>
				</div>

				<!-- Categories table -->
				<b-table-simple hover responsive small class="categories-table">
					<colgroup>
						<col style="width: 50%;" />
						<col style="width: 35%;" />
						<col style="width: 15%;" />
					</colgroup>
					<b-thead head-variant="dark">
						<b-tr class="totals-row">
							<b-th>Категорія</b-th>
							<b-th class="text-end">Сума</b-th>
							<b-th class="text-center">К-ть</b-th>
						</b-tr>
					</b-thead>
					<b-tbody v-if="catcosts.length > 0">
						<b-tr v-for="(category, index) in catcosts" :key="index">
							<b-td>
								<router-link
									class="category-link"
									:to="{
										name: 'payments',
										params: { action: 'show', year: year, month: month, category_id: category.category_id },
										query: { group_user_id: group_user_id }
									}"
								>
									<i class="bi bi-folder2-open me-2"></i>
									{{ category.name }}
								</router-link>
							</b-td>
							<b-td class="text-end amount-cell">
								{{ category.amount.toLocaleString() }}
								<span class="currency-badge">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
							</b-td>
							<b-td class="text-center count-cell">{{ category.cnt }}</b-td>
						</b-tr>
					</b-tbody>
					<b-tbody v-else>
						<b-tr>
							<b-td colspan="3" class="text-center text-muted py-4">
								<i class="bi bi-inbox fs-1 d-block mb-2"></i>
								Немає даних за цей період
							</b-td>
						</b-tr>
					</b-tbody>
					<b-tfoot v-if="catcosts.length > 0">
						<b-tr class="totals-footer">
							<b-td class="fw-bold">Загалом:</b-td>
							<b-td class="text-end fw-bold total-amount">
								{{ total.toLocaleString() }}
								<span class="currency-badge">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
							</b-td>
							<b-td class="text-center fw-bold">{{ total_cnt }}</b-td>
						</b-tr>
					</b-tfoot>
				</b-table-simple>
			</div>
		</div>
	</div>
</template>

<script>
import SelectorComponent from "../SelectorComponent.vue";
import PaymentService from "../../services/PaymentService";
import { getErrorMessage, logError } from '@/utils/errorHandler';

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
  },
  data() {
    return {
      catcosts: [],
      q: "",
      year: this.$route.params.year || new Date().getFullYear(),
      month: this.$route.params.month || new Date().getMonth() + 1,
      total: 0,
      total_cnt: 0,
      group_user_id: this.$route.query.group_user_id || localStorage.getItem('selectedGroupUserId') || undefined,
      lastRequest: null, // Для відстеження останнього запиту
      isRequestInProgress: false // Запобігання паралельним запитам
    };
  },
  methods: {
    getMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);
      return date.toLocaleString('uk-UA', { month: 'long' });
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
.container-fluid {
  padding-top: 20px;
}

.selector-wrapper {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.period-header {
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
}

.period-header h3 {
  margin: 0;
  text-transform: capitalize;
}

.categories-table {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
}

.categories-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.categories-table thead th {
  color: white !important;
  font-weight: 600;
  padding: 15px 12px;
  border: none;
}

.category-link {
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  padding: 4px 0;
}

.category-link:hover {
  color: #007bff;
  transform: translateX(5px);
}

.category-link i {
  color: #6c757d;
  transition: color 0.2s;
}

.category-link:hover i {
  color: #007bff;
}

.amount-cell {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-weight: 600;
  color: #28a745;
  font-size: 1.05em;
}

.count-cell {
  font-weight: 500;
  color: #6c757d;
}

.currency-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #e7f5ff;
  color: #0c8599;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
  margin-left: 4px;
}

.categories-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.categories-table tbody tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.01);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.categories-table tbody td {
  padding: 14px 12px;
  vertical-align: middle;
}

.totals-footer {
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
  border-top: 2px solid #dee2e6;
}

.totals-footer td {
  padding: 15px 12px !important;
  font-size: 1.1em;
}

.total-amount {
  color: #dc3545 !important;
  font-size: 1.15em;
}

.totals-row {
  border-bottom: 2px solid rgba(255,255,255,0.2);
}

/* Loading state */
.text-muted i {
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container-fluid {
    padding: 10px;
  }

  .categories-table {
    font-size: 0.9rem;
  }

  .amount-cell {
    font-size: 0.95em;
  }

  .currency-badge {
    display: block;
    margin-left: 0;
    margin-top: 2px;
  }
}
</style>