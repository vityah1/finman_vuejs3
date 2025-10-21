<template>
	<div>
		<PCard>
			<template #content>
				<alert-component ref="myAlert"></alert-component>

				<!-- Category header with back button and info -->
				<PCard>
					<template #header>
						<div class="category-header">
							<div class="header-left">
								<PButton icon="pi pi-arrow-left" text @click="$router.go(-1)" size="small" class="back-btn" />
								<i class="pi pi-folder category-icon"></i>
								<h2 class="category-title">{{ category_name }} - {{ getMonthName(month) }} {{ year }}</h2>
							</div>
							<div class="header-right">
								<PButton icon="pi pi-plus" label="Додати" @click="openFormAddPayment" size="small" class="add-btn" />
							</div>
						</div>
					</template>

					<template #content>
						<!-- Group operations toolbar -->
						<PCard v-if="selectedPayments.length > 0" class="bulk-toolbar">
							<template #content>
								<div class="bulk-toolbar-content">
									<div class="bulk-selection-info">
										<i class="pi pi-check-square"></i>
										<span class="selection-count">Вибрано: {{ selectedPayments.length }}</span>
									</div>
									<div class="bulk-actions">
										<PButton icon="pi pi-folder" label="Змінити категорію" @click="openBulkCategoryChange" size="small" class="bulk-btn" />
										<PButton icon="pi pi-trash" label="Видалити" severity="danger" @click="confirmBulkDelete" size="small" class="bulk-btn" />
										<PButton icon="pi pi-times" label="Скасувати" text @click="selectedPayments = []" size="small" class="bulk-btn" />
									</div>
								</div>
							</template>
						</PCard>

						<!-- DataTable - Desktop only -->
						<DataTable
							:value="payments"
							v-model:selection="selectedPayments"
							:paginator="false"
							:loading="loading"
							@row-click="onRowClick"
							dataKey="id"
							:metaKeySelection="false"
							showGridlines
							stripedRows
							class="desktop-table"
						>
							<template #empty>
								<div style="text-align: center; padding: 2rem;">
									<i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary); margin-bottom: 1rem; display: block;"></i>
									<span style="color: var(--text-color-secondary);">Немає платежів у цій категорії</span>
								</div>
							</template>

							<Column selectionMode="multiple" style="width: 3rem" />

							<Column field="rdate" header="Дата" :sortable="true" style="width: 12%;">
								<template #body="{ data }">
									<div style="display: flex; align-items: center; gap: 0.5rem;">
										<i class="pi pi-calendar" style="color: var(--primary-color);"></i>
										<span style="font-weight: 500;">{{ formatDate(data.rdate) }}</span>
									</div>
								</template>
							</Column>

							<Column field="category_name" header="Підкатегорія" style="width: 15%;">
								<template #body="{ data }">
									<span v-if="data.category_name !== category_name" style="font-style: italic; color: var(--text-color-secondary);">
										{{ data.category_name }}
									</span>
								</template>
							</Column>

							<Column field="mydesc" header="Опис" style="width: 35%;">
								<template #body="{ data }">
									<span style="font-weight: 500;">{{ data.mydesc }}</span>
								</template>
							</Column>

							<Column field="amount" header="Сума" :sortable="true" style="width: 15%; text-align: right;">
								<template #body="{ data }">
									<div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem;">
										<span style="font-weight: 600; font-size: 1.1rem; color: var(--green-500);">{{ formatAmount(data.amount) }}</span>
										<span style="color: var(--text-color-secondary); font-size: 0.9rem;">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
									</div>
								</template>
							</Column>

							<Column field="user_login" header="Користувач" style="width: 12%;">
								<template #body="{ data }">
									<PTag v-if="data.user_login" :value="data.user_login" severity="secondary" />
								</template>
							</Column>

							<Column header="Дії" style="width: 8%;">
								<template #body="{ data }">
									<div style="display: flex; gap: 0.25rem;">
										<PButton icon="pi pi-pencil" text size="small" @click.stop="openFormEditPayment(data.id)" />
										<PButton icon="pi pi-trash" text severity="danger" size="small" @click.stop="confirmDelete(data.id)" />
									</div>
								</template>
							</Column>
						</DataTable>

						<!-- Mobile Card View -->
						<div class="mobile-cards" v-if="!loading">
							<div v-if="payments.length === 0" class="empty-state">
								<i class="pi pi-inbox"></i>
								<span>Немає платежів у цій категорії</span>
							</div>
							<div v-for="payment in payments" :key="payment.id" class="payment-card" @click="openFormEditPayment(payment.id)">
								<div class="payment-card-header">
									<div class="payment-date">
										<i class="pi pi-calendar"></i>
										<span>{{ formatDate(payment.rdate) }}</span>
									</div>
									<div class="payment-amount">
										<span class="amount-value">{{ formatAmount(payment.amount) }}</span>
										<span class="amount-currency">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
									</div>
								</div>
								<div class="payment-card-body">
									<div class="payment-description">{{ payment.mydesc }}</div>
									<div v-if="payment.category_name !== category_name" class="payment-subcategory">
										{{ payment.category_name }}
									</div>
								</div>
								<div class="payment-card-footer">
									<div class="payment-user">
										<PTag v-if="payment.user_login" :value="payment.user_login" severity="secondary" />
									</div>
									<div class="payment-actions">
										<PButton icon="pi pi-pencil" text size="small" @click.stop="openFormEditPayment(payment.id)" />
										<PButton icon="pi pi-trash" text severity="danger" size="small" @click.stop="confirmDelete(payment.id)" />
									</div>
								</div>
							</div>
						</div>

						<!-- Summary panel -->
						<div class="summary-panel">
							<div class="summary-content">
								<div class="summary-count">
									<span class="summary-label">Записів:</span>
									<PTag :value="payments.length" severity="info" class="summary-tag" />
								</div>
								<div class="summary-total">
									<span class="summary-label">Загальна сума:</span>
									<span class="total-amount">{{ formatAmount(total) }}</span>
									<span class="total-currency">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
								</div>
							</div>
						</div>
					</template>
				</PCard>
			</template>
		</PCard>
	</div>

	<!-- Edit Dialog -->
	<Dialog
		v-model:visible="showModal"
		:header="okTitle"
		:modal="true"
		class="payment-dialog"
	>
			<div v-if="currentPayment">
				<div class="field">
					<label for="rdate">Дата:</label>
					<Calendar v-model="currentPayment.rdate" id="rdate" dateFormat="yy-mm-dd" />
				</div>

				<div class="field">
					<label for="category">Категорія:</label>
					<Dropdown
						v-model="selectedCategoryId"
						:options="formattedCategories"
						optionLabel="name"
						optionValue="id"
						placeholder="Виберіть категорію"
						id="category" />
				</div>

				<div v-if="!isFuel" class="field">
					<label for="mydesc">Опис:</label>
					<InputText v-model="currentPayment.mydesc" id="mydesc" />
				</div>

				<div v-if="isFuel">
					<div class="field">
						<label for="km">Кілометри:</label>
						<InputText v-model="currentPayment.refuel_data.km" id="km" />
					</div>
					<div class="field">
						<label for="litres">Літри:</label>
						<InputText v-model="currentPayment.refuel_data.litres" id="litres" />
					</div>
					<div class="field">
						<label for="price">Ціна (EUR):</label>
						<InputText v-model="currentPayment.refuel_data.price_val" id="price" />
					</div>
					<div class="field">
						<label for="station">Заправка:</label>
						<InputText v-model="currentPayment.refuel_data.station_name" id="station" />
					</div>
				</div>

				<div class="field">
					<label for="amount">Сума:</label>
					<InputText v-model="currentPayment.currency_amount" id="amount" type="number" />
				</div>

				<div class="field">
					<label for="currency">Валюта:</label>
					<Dropdown
						v-model="currentPayment.currency"
						:options="currencyOptions"
						optionLabel="label"
						optionValue="value"
						placeholder="Виберіть валюту"
						id="currency" />
				</div>

				<div class="field">
					<label for="source">Джерело:</label>
					<Dropdown
						v-model="currentPayment.source"
						:options="sources"
						optionLabel="label"
						optionValue="value"
						placeholder="Виберіть джерело"
						id="source" />
				</div>
			</div>

			<template #footer>
				<PButton label="Скасувати" icon="pi pi-times" text @click="showModal = false" />
				<PButton label="Зберегти" icon="pi pi-check" @click="doFormAction" />
				<PButton v-if="okTitle !== 'Додати'" label="Видалити" icon="pi pi-trash" severity="danger" @click="deletePayment" />
			</template>
		</Dialog>

	<!-- Bulk Category Change Dialog -->
	<Dialog
		v-model:visible="showBulkCategoryDialog"
		header="Змінити категорію для вибраних записів"
		:modal="true"
		class="confirmation-dialog"
	>
		<div class="field">
			<p style="margin-bottom: 1rem;">
				Ви збираєтесь змінити категорію для <strong>{{ selectedPayments.length }}</strong> записів.
			</p>
			<label for="bulk-category">Нова категорія:</label>
			<Dropdown
				v-model="bulkCategoryId"
				:options="formattedCategories"
				optionLabel="name"
				optionValue="id"
				placeholder="Виберіть категорію"
				id="bulk-category" />
		</div>

		<template #footer>
			<PButton label="Скасувати" icon="pi pi-times" text @click="showBulkCategoryDialog = false" />
			<PButton label="Змінити" icon="pi pi-check" @click="saveBulkCategoryChange" :disabled="!bulkCategoryId" />
		</template>
	</Dialog>

	<!-- Delete Confirmation -->
	<Dialog
		v-model:visible="showDeleteConfirm"
		header="Підтвердження видалення"
		:modal="true"
		class="confirmation-dialog"
	>
		<p>Ви впевнені, що хочете видалити цей платіж?</p>
		<template #footer>
			<PButton label="Ні" icon="pi pi-times" text @click="showDeleteConfirm = false" />
			<PButton label="Так" icon="pi pi-check" severity="danger" @click="deletePayment" />
		</template>
	</Dialog>

	<!-- Bulk Delete Confirmation -->
	<Dialog
		v-model:visible="showBulkDeleteConfirm"
		header="Підтвердження видалення"
		:modal="true"
		class="confirmation-dialog"
	>
		<p>Ви впевнені, що хочете видалити <strong>{{ selectedPayments.length }}</strong> платежів?</p>
		<template #footer>
			<PButton label="Ні" icon="pi pi-times" text @click="showBulkDeleteConfirm = false" />
			<PButton label="Так" icon="pi pi-check" severity="danger" @click="handleBulkDeleteConfirm" />
		</template>
	</Dialog>
</template>

<script>
import { defineComponent } from 'vue';
import PaymentService from "../../services/PaymentService";
import store from "@/store";
import { getErrorMessage, logError } from '@/utils/errorHandler';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

export default defineComponent({
	name: "PaymentDetail",
	components: {
		Dialog,
		Calendar,
		InputNumber,
		DataTable,
		Column,
		InputText,
		Dropdown,
		PCard: Card,
		PTag: Tag
	},
	data() {
		return {
			payments: [],
			selectedPayments: [],
			q: this.$route.query.q || "",
			total: 0,
			total_cnt: 0,
			loading: false,
			showModal: false,
			showDeleteConfirm: false,
      showBulkDeleteConfirm: false,
			showBulkCategoryDialog: false,
			bulkCategoryId: null,
			okTitle: "Редагувати",
			currentPayment: {
				category_id: this.$store.state.sprs.categories && this.$store.state.sprs.categories.length > 0 ? this.$store.state.sprs.categories[0].id : null,
				rdate: this.getCurrentDate(),
				mydesc: "",
				amount: 0,
				currency_amount: 0,
				currency: "UAH",
				source: "mono",
				refuel_data: {
					km: null,
					litres: null,
					price_val: null,
					station_name: null
				}
			},
			selectedCategoryId: null,
			categories: [],
			sources: [
				{ label: "PWA (Ручне додавання)", value: "pwa" },
				{ label: "MonoBank", value: "mono" },
				{ label: "PrivatBank", value: "pryvat" },
				{ label: "Revolut", value: "revolut" },
				{ label: "Wise", value: "wise" },
				{ label: "Portmone", value: "p24" },
				{ label: "PUMB", value: "pumb" },
				{ label: "Erste Bank", value: "erste" }
			],
			category_name: "",
			year: this.$route.params.year,
			month: this.$route.params.month,
			deletePaymentId: null
		};
	},
	computed: {
		currentUser() {
			return this.$store.state.auth.user;
		},
		formattedCategories() {
			if (!this.categories || this.categories.length === 0) {
				return [];
			}
			const formatCategory = (category, level = 0) => {
				const subcategories = this.categories.filter(cat => cat.parent_id === category.id);
				const indent = level > 0 ? "└─ ".repeat(level) : "";
				const result = [{
					...category,
					name: indent + category.name,
				}];
				subcategories.forEach(subcat => {
					result.push(...formatCategory(subcat, level + 1));
				});
				return result;
			};
			const mainCategories = this.categories.filter(cat => cat.parent_id === 0 || cat.parent_id === null);
			let formatted = [];
			mainCategories.forEach(cat => {
				formatted.push(...formatCategory(cat));
			});
			return formatted;
		},
		isFuel() {
			if (!this.selectedCategoryId || !this.categories) {
				return false;
			}
			const selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId);
			return selectedCategory ? selectedCategory.is_fuel : false;
		},
		currencyOptions() {
			// Get currencies from store or use default list
			const storeCurrencies = this.$store.state.sprs.currencies || [];
			if (storeCurrencies.length > 0) {
				return storeCurrencies.map(currency => ({
					label: currency.currencyCode || currency.currency,
					value: currency.currencyCode || currency.currency
				}));
			}
			// Default currencies if store is empty
			return [
				{ label: 'UAH', value: 'UAH' },
				{ label: 'USD', value: 'USD' },
				{ label: 'EUR', value: 'EUR' }
			];
		},
	},
	methods: {
		getMonthName(monthNumber) {
			const date = new Date();
			date.setMonth(monthNumber - 1);
			return date.toLocaleString('uk-UA', { month: 'long' });
		},

		formatDate(dateString) {
			const date = new Date(dateString);
			return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
		},

		formatAmount(amount) {
			return new Intl.NumberFormat('uk-UA', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(amount || 0);
		},

		getCurrentDate() {
			const today = new Date();
			return today.toISOString().split('T')[0];
		},

		findCategoryNameById(categoryId) {
			const category = this.categories.find(cat => cat.id == categoryId);
			return category ? category.name : "Невідома категорія";
		},

		onRowClick(event) {
			// При кліку з Ctrl або на чекбокс - тільки вибір
			if (event.originalEvent.ctrlKey || event.originalEvent.metaKey) {
				return; // Дозволяємо стандартну поведінку selection
			}
			// При звичайному кліку - відкриваємо форму редагування
			const payment = event.data;
			this.openFormEditPayment(payment.id);
		},

		openFormAddPayment() {
			this.okTitle = "Додати";
			// Якщо category_id === '_', використовуємо першу доступну категорію
			const categoryId = this.$route.params.category_id === '_'
				? (this.$store.state.sprs.categories?.[0]?.id || null)
				: this.$route.params.category_id;

			this.currentPayment = {
				category_id: categoryId,
				rdate: this.getCurrentDate(),
				mydesc: "",
				amount: 0,
				currency_amount: 0,
				currency: this.$store.state.sprs.selectedCurrency || "UAH",
				source: "pwa",
				refuel_data: {
					km: null,
					litres: null,
					price_val: null,
					station_name: null
				}
			};
			this.selectedCategoryId = this.currentPayment.category_id;
			this.showModal = true;
		},

		openFormEditPayment(id) {
			this.okTitle = "Редагувати";
			const payment = this.payments.find(p => p.id === id);
			if (payment) {
				this.currentPayment = { ...payment };
				// Convert datetime to date format for backend compatibility
				if (this.currentPayment.rdate) {
					if (typeof this.currentPayment.rdate === 'string') {
						this.currentPayment.rdate = this.currentPayment.rdate.split('T')[0];
					} else if (this.currentPayment.rdate instanceof Date) {
						this.currentPayment.rdate = this.currentPayment.rdate.toISOString().split('T')[0];
					}
				}
				this.selectedCategoryId = payment.category_id;
				if (!this.currentPayment.refuel_data) {
					this.currentPayment.refuel_data = {
						km: null,
						litres: null,
						price_val: null,
						station_name: null
					};
				}
				// Ensure currency field exists
				if (!this.currentPayment.currency) {
					this.currentPayment.currency = this.$store.state.sprs.selectedCurrency || "UAH";
				}
				this.showModal = true;
			}
		},

		openBulkCategoryChange() {
			if (!this.selectedPayments || this.selectedPayments.length === 0) {
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("warning", "Не вибрано жодного платежу");
				}
				return;
			}
			this.bulkCategoryId = null;
			this.showBulkCategoryDialog = true;
		},

		async saveBulkCategoryChange() {
			if (!this.bulkCategoryId) {
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("warning", "Виберіть категорію");
				}
				return;
			}

			try {
				let successCount = 0;
				let errorCount = 0;

				for (const payment of this.selectedPayments) {
					try {
						const updatedPayment = {
							...payment,
							category_id: this.bulkCategoryId
						};
						
						// Ensure rdate is in correct format
						if (updatedPayment.rdate instanceof Date) {
							updatedPayment.rdate = updatedPayment.rdate.toISOString().split('T')[0];
						} else if (typeof updatedPayment.rdate === 'string' && updatedPayment.rdate.includes('T')) {
							updatedPayment.rdate = updatedPayment.rdate.split('T')[0];
						}

						await PaymentService.updatePayment(payment.id, updatedPayment);
						successCount++;
					} catch (error) {
						errorCount++;
						logError(error, `PmtYearMonCat saveBulkCategoryChange for payment ${payment.id}`);
					}
				}

				this.showBulkCategoryDialog = false;
				this.selectedPayments = [];
				await this.getPayments();

				if (errorCount === 0) {
					if (this.$refs.myAlert) {
						this.$refs.myAlert.showAlert("success", `Категорію успішно змінено для ${successCount} записів`);
					}
				} else {
					if (this.$refs.myAlert) {
						this.$refs.myAlert.showAlert("warning", `Змінено: ${successCount}, Помилок: ${errorCount}`);
					}
				}
			} catch (e) {
				logError(e, "PmtYearMonCat saveBulkCategoryChange");
				const errorMessage = getErrorMessage(e, "Помилка зміни категорії");
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("danger", errorMessage);
				}
			}
		},

		confirmDelete(id) {
			this.deletePaymentId = id;
			this.showDeleteConfirm = true;
		},

		async deletePayment() {
			const id = this.deletePaymentId || this.currentPayment.id;
			if (!id) return;

			try {
				await PaymentService.deletePayment(id);
				await this.getPayments();
				this.showModal = false;
				this.showDeleteConfirm = false;
				this.deletePaymentId = null;
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("success", "Платіж успішно видалено");
				}
			} catch (e) {
				logError(e, "PmtYearMonCat deletePayment");
				const errorMessage = getErrorMessage(e, "Помилка видалення платежу");
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("danger", errorMessage);
				}
			}
		},

		async doFormAction() {
			this.currentPayment.category_id = this.selectedCategoryId;

			if (this.okTitle === "Додати") {
				await this.addPayment();
			} else {
				await this.updatePayment();
			}
		},

		async addPayment() {
			try {
				// Ensure rdate is in correct format
				let rdateString;
				if (typeof this.currentPayment.rdate === 'string') {
					rdateString = this.currentPayment.rdate;
				} else if (this.currentPayment.rdate instanceof Date) {
					rdateString = this.currentPayment.rdate.toISOString().split('T')[0];
					this.currentPayment.rdate = rdateString;
				}

				this.showModal = false;

				// Спочатку зберігаємо платіж
				await PaymentService.createPayment(this.currentPayment);

				// Завжди переходимо до категорії та періоду доданого платежу
				const [year, month, day] = rdateString.split('-');
				const formattedMonth = month.replace(/^0+/, "");

				// Завжди переходимо до категорії та періоду платежу
				this.$router.push({
					name: "payments",
					params: {
						year,
						month: formattedMonth,
						category_id: this.currentPayment.category_id
					},
				});

				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("success", "Платіж успішно додано");
				}
			} catch (e) {
				logError(e, "PmtYearMonCat addPayment");
				const errorMessage = getErrorMessage(e, "Помилка додавання платежу");
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("danger", errorMessage);
				}
			}
		},

		async updatePayment() {
			try {
				// Ensure rdate is in correct format
				if (this.currentPayment.rdate instanceof Date) {
					this.currentPayment.rdate = this.currentPayment.rdate.toISOString().split('T')[0];
				}

				const oldCategoryId = this.$route.params.category_id;
				await PaymentService.updatePayment(this.currentPayment.id, this.currentPayment);

				if (oldCategoryId && this.currentPayment.category_id.toString() !== oldCategoryId.toString()) {
					const [year, month, day] = this.currentPayment.rdate.split('-');
					const formattedMonth = month.replace(/^0+/, "");
					this.$router.push({
						name: "payments",
						params: { year, month: formattedMonth, category_id: this.currentPayment.category_id },
					});
				}
				await this.getPayments();
				this.showModal = false;
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("success", "Платіж успішно оновлено");
				}
			} catch (e) {
				logError(e, "PmtYearMonCat updatePayment");
				const errorMessage = getErrorMessage(e, "Помилка оновлення платежу");
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("danger", errorMessage);
				}
			}
		},

		async getPayments() {
			this.loading = true;
			// Якщо category_id === '_', не фільтруємо по категорії
			const categoryId = this.$route.params.category_id === '_' ? '' : this.$route.params.category_id;

			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				category_id: categoryId || "",
				q: this.$route.query.q || "",
				currency: store.state.sprs.selectedCurrency || "UAH",
				group_user_id: this.$route.query.group_user_id || "",
				source: this.$route.query.source || ""
			};
			try {
				const response = await PaymentService.getPayments(data);
				this.payments = response.data;
				this.total = this.payments.reduce((sum, val) => sum + Number(val.amount), 0);
				this.total_cnt = this.payments.length;
			} catch (e) {
				logError(e, "PmtYearMonCat getPayments");
				const errorMessage = getErrorMessage(e, "Помилка завантаження платежів");
				if (this.$refs.myAlert) {
					this.$refs.myAlert.showAlert("danger", errorMessage);
				}
			} finally {
				this.loading = false;
			}
		},

		isPaymentSelected(paymentId) {
			return this.selectedPayments && this.selectedPayments.some(p => p.id === paymentId);
		},

    confirmBulkDelete() {
      if (!this.selectedPayments.length) return;
      this.showBulkDeleteConfirm = true;
    },

    async handleBulkDeleteConfirm() {
      this.showBulkDeleteConfirm = false;
      try {
        for (const payment of this.selectedPayments) {
          await PaymentService.deletePayment(payment.id);
        }
        this.selectedPayments = [];
        await this.getPayments();
        if (this.$refs.myAlert) {
          this.$refs.myAlert.showAlert("success", "Платежі успішно видалено");
        }
      } catch (e) {
        logError(e, "PmtYearMonCat bulkDelete");
        const errorMessage = getErrorMessage(e, "Помилка видалення платежів");
        if (this.$refs.myAlert) {
          this.$refs.myAlert.showAlert("danger", errorMessage);
        }
      }
    },

		togglePaymentSelection(paymentId) {
			const payment = this.payments.find(p => p.id === paymentId);
			if (payment) {
				const index = this.selectedPayments.findIndex(p => p.id === paymentId);
				if (index >= 0) {
					this.selectedPayments.splice(index, 1);
				} else {
					this.selectedPayments.push(payment);
				}
			}
		},
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
			return;
		}

		const storeCategories = this.$store.state.sprs.categories;
		this.categories = Array.isArray(storeCategories) ? storeCategories : [];

		// Якщо category_id === '_', показуємо "Всі категорії"
		if (this.$route.params.category_id === '_') {
			this.category_name = "Всі категорії";
		} else {
			this.category_name = this.findCategoryNameById(this.$route.params.category_id);
		}

		await this.getPayments();

		// Перевіряємо параметр action і відкриваємо форму, потім прибираємо параметр
		if (this.$route.query.action === "add") {
			this.openFormAddPayment();
			// Прибираємо параметр action з URL щоб форма не відкривалась при перезавантаженні
			this.$router.replace({
				name: this.$route.name,
				params: this.$route.params,
				query: {}
			});
		}
	},
	watch: {
		'$store.state.sprs.selectedCurrency'() {
			this.getPayments();
		},
		'$route.query.action'(newVal) {
			// Якщо з'явився параметр action=add, відкриваємо форму
			if (newVal === 'add' && !this.showModal) {
				this.openFormAddPayment();
				// Прибираємо параметр action з URL
				this.$router.replace({
					name: this.$route.name,
					params: this.$route.params,
					query: {}
				});
			}
		}
	}
});
</script>

<style scoped>
/* Desktop table - hidden on mobile */
.desktop-table {
  display: block;
}

/* Mobile cards - hidden on desktop */
.mobile-cards {
  display: none;
}

/* Category header styles */
.category-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.category-title {
  margin: 0;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Bulk toolbar styles */
.bulk-toolbar {
  margin-bottom: 1rem;
}

.bulk-toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.bulk-selection-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-selection-info i {
  color: var(--primary-color);
}

.selection-count {
  font-weight: 600;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Summary panel styles */
.summary-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 0.375rem;
  border: 1px solid var(--surface-border);
}

.summary-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.summary-count,
.summary-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-label {
  color: var(--text-color-secondary);
  font-weight: 500;
}

.total-amount {
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--green-500);
}

.total-currency {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

/* Mobile specific styles */
@media (max-width: 768px) {
  /* Hide desktop table, show mobile cards */
  .desktop-table {
    display: none !important;
  }

  .mobile-cards {
    display: block;
  }

  /* Category header mobile */
  .category-header {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .category-title {
    font-size: 1rem;
  }

  .back-btn,
  .add-btn {
    font-size: 0.875rem;
  }

  /* Bulk toolbar mobile */
  .bulk-toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .bulk-actions {
    width: 100%;
  }

  .bulk-btn {
    flex: 1;
    font-size: 0.875rem;
  }

  /* Mobile payment cards */
  .payment-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .payment-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
  }

  .payment-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }

  .payment-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }

  .payment-date i {
    font-size: 0.875rem;
  }

  .payment-amount {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-weight: 600;
  }

  .amount-value {
    font-size: 1.1rem;
    color: var(--green-500);
  }

  .amount-currency {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }

  .payment-card-body {
    margin-bottom: 0.75rem;
  }

  .payment-description {
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .payment-subcategory {
    font-style: italic;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }

  .payment-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--surface-border);
  }

  .payment-actions {
    display: flex;
    gap: 0.25rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
  }

  .empty-state i {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  /* Summary panel mobile */
  .summary-panel {
    padding: 0.75rem;
  }

  .summary-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .summary-count,
  .summary-total {
    justify-content: space-between;
  }

  .total-amount {
    font-size: 1.1rem;
  }
}

/* Dialog styles come from main.css (fullscreen on mobile, 750px on desktop) */
</style>
