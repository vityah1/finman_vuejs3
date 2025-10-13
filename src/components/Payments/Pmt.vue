<template>
	<div class="container-fluid p-compact">
		<alert-component ref="myAlert"></alert-component>
		<div v-if="loading" class="text-center py-4">
			<i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
			<p class="mt-2">Завантаження даних за роками...</p>
		</div>
		<div v-else>
			<div class="row">
				<div class="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
					<div class="page-header mb-compact">
						<h3 class="m-0"><i class="pi pi-calendar mr-2"></i>Витрати за роками</h3>
					</div>

					<!-- Summary cards -->
					<div class="row mb-3">
						<div class="col-md-6">
							<summary-card
								title="Загальна сума"
								:value="totalAmount"
								currency="UAH"
								icon="pi pi-wallet"
								variant="primary"
								:compact="true"
							/>
						</div>
						<div class="col-md-6">
							<summary-card
								title="Кількість років"
								:value="years.length"
								format="number"
								:show-currency="false"
								icon="pi pi-calendar"
								variant="info"
								:compact="true"
							/>
						</div>
					</div>

					<!-- Desktop: PrimeVue DataTable -->
					<div class="desktop-only">
						<PCard class="p-0">
							<template #content>
								<DataTable
									:value="years"
									:paginator="false"
									class="p-datatable-sm p-datatable-compact"
									:loading="loading"
								>
									<Column field="year" header="Рік" class="text-center" style="width: 30%">
										<template #body="{ data }">
											<router-link
												class="year-link font-bold"
												:to="{ name: 'payments_year', params: { year: data.year } }"
											>
												<i class="pi pi-calendar mr-1"></i>{{ data.year }}
											</router-link>
										</template>
									</Column>
									<Column field="amount" header="Сума" class="text-right" style="width: 50%">
										<template #body="{ data }">
											<span class="amount-cell">
												{{ formatAmount(data.amount) }}
												<span class="currency-badge">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
											</span>
										</template>
									</Column>
									<Column field="cnt" header="Кількість" class="text-center" style="width: 20%" />

									<template #empty>
										<div class="text-center py-4">
											<i class="pi pi-inbox text-4xl text-muted mb-2"></i>
											<p class="text-muted">Немає даних для відображення</p>
										</div>
									</template>
								</DataTable>
							</template>
						</PCard>
					</div>

					<!-- Mobile: Card view -->
					<div class="mobile-only">
						<div v-if="years && years.length > 0">
							<div v-for="(year, index) in years" :key="index" class="mobile-card">
								<div class="card-row">
									<div class="card-content">
										<router-link
											class="year-link font-bold"
											:to="{ name: 'payments_year', params: { year: year.year } }"
										>
											<i class="pi pi-calendar mr-1"></i>{{ year.year }} рік
										</router-link>
										<small class="text-muted">Транзакцій: {{ year.cnt }}</small>
									</div>
									<div class="card-amount-col">
										{{ formatAmount(year.amount) }}
									</div>
								</div>
							</div>
						</div>
						<div v-else class="text-center py-4">
							<i class="pi pi-inbox text-4xl text-muted mb-2"></i>
							<p class="text-muted">Немає даних для відображення</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import store from "@/store";
import { getErrorMessage, logError } from '@/utils/errorHandler';
import SummaryCard from '@/components/shared/SummaryCard.vue';

/**
 * @typedef {Object} YearData
 * @property {number} year
 * @property {number} amount
 * @property {number} cnt
 */

export default {
  name: "PaymentsYear",
  components: {
    SummaryCard
  },
  data() {
    return {
      years: [],
      loading: false
    };
  },
  computed: {
    totalAmount() {
      if (!this.years || this.years.length === 0) return 0;
      return this.years.reduce((sum, year) => sum + Number(year.amount), 0);
    }
  },
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat('uk-UA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    },

    async retrieveYears() {
      this.loading = true;
      try {
        // Check if user is authenticated
        if (this.$store.state.auth.status?.loggedIn) {
          console.log('Завантажуємо роки платежів... (користувач авторизований)');
          const response = await PaymentService.getPaymentsYears({currency: store.state.sprs.selectedCurrency || "UAH"});
          this.years = response.data;
          console.log('Роки платежів завантажено:', response.data);
        } else {
          console.log('Користувач не авторизований, не завантажуємо роки платежів');
          this.years = [];
        }
      } catch (e) {
        logError(e, "Pmt retrieveYears");
        const errorMessage = getErrorMessage(e, "Помилка завантаження років платежів");
        if (this.$refs.myAlert) {
          this.$refs.myAlert.showAlert("danger", errorMessage);
        }
        this.years = [];
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.retrieveYears();
  },
  created() {
    // Subscribe to authentication state changes
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'auth/loginSuccess') {
        console.log('Користувач авторизувався, оновлюємо список років');
        this.retrieveYears();
      }
    });
  },
  watch: {
    '$store.state.sprs.selectedCurrency'() {
      this.retrieveYears();
    }
  }
}
</script>

<style scoped>
/* Page header with gradient */
.page-header {
  background: var(--bg-gradient);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}

.page-header h3 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
}

/* Year link styling */
.year-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
}

.year-link:hover {
  color: var(--color-primary-dark);
  text-decoration: none;
  transform: translateX(2px);
}

/* PrimeVue DataTable customization */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  background: var(--table-header-bg);
  color: var(--table-header-color);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: var(--spacing-sm) var(--spacing-md);
  vertical-align: middle;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr:hover) {
  background: var(--bg-hover);
  transform: scale(1.005);
  box-shadow: var(--shadow-sm);
}

:deep(.p-card .p-card-content) {
  padding: 0;
}

/* Amount cell styling */
.amount-cell {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  font-size: var(--font-size-base);
}

/* Mobile cards */
.mobile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  transition: var(--transition-fast);
}

.mobile-card:hover {
  background: var(--bg-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-amount-col {
  flex-shrink: 0;
  text-align: right;
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
  font-size: var(--font-size-lg);
}

/* Currency badge */
.currency-badge {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(12, 133, 153, 0.1);
  color: #0c8599;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-left: 4px;
}

/* Loading spinner */
.pi-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>