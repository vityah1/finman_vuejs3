<template>
	<div>
		<PCard>
			<template #content>
				<alert-component ref="myAlert"></alert-component>

				<!-- Category header with back button and info -->
				<PCard>
					<template #header>
						<div style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
							<div style="display: flex; align-items: center; gap: 0.5rem;">
								<PButton icon="pi pi-arrow-left" text @click="$router.go(-1)" />
								<i class="pi pi-folder" style="font-size: 1.5rem; color: var(--primary-color);"></i>
								<h2 style="margin: 0; font-weight: 600;">{{ category_name }} - {{ getMonthName(month) }} {{ year }}</h2>
							</div>
							<div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
								<PButton icon="pi pi-plus" label="Додати" @click="openFormAddPayment" />
							</div>
						</div>
					</template>

					<template #content>
						<!-- Group operations toolbar -->
						<PCard v-if="selectedPayments.length > 0" style="margin-bottom: 1rem;">
							<template #content>
								<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
									<div style="display: flex; align-items: center; gap: 0.5rem;">
										<i class="pi pi-check-square" style="color: var(--primary-color);"></i>
										<span style="font-weight: 600;">Вибрано: {{ selectedPayments.length }}</span>
									</div>
									<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
										<PButton icon="pi pi-folder" label="Змінити категорію" @click="openBulkCategoryChange" />
										<PButton icon="pi pi-trash" label="Видалити" severity="danger" @click="confirmBulkDelete" />
										<PButton icon="pi pi-times" label="Скасувати" text @click="selectedPayments = []" />
									</div>
								</div>
							</template>
						</PCard>

						<!-- DataTable -->
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

						<!-- Summary panel aligned with table -->
						<div style="margin-top: 1rem; padding: 1rem; background: var(--surface-ground); border-radius: 0.375rem; border: 1px solid var(--surface-border);">
							<div style="display: flex; justify-content: flex-end; align-items: center; gap: 2rem;">
								<div style="display: flex; align-items: center; gap: 0.5rem;">
									<span style="color: var(--text-color-secondary); font-weight: 500;">Записів:</span>
									<PTag :value="payments.length" severity="info" style="font-weight: 600;" />
								</div>
								<div style="display: flex; align-items: center; gap: 0.25rem;">
									<span style="color: var(--text-color-secondary); font-weight: 500;">Загальна сума:</span>
									<span style="font-weight: 700; font-size: 1.3rem; color: var(--green-500);">{{ formatAmount(total) }}</span>
									<span style="color: var(--text-color-secondary); font-size: 0.9rem;">{{ $store.state.sprs.selectedCurrency || "UAH" }}</span>
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
			:style="{ width: '500px' }"
			class="payment-dialog"
		>
			<div v-if="currentPayment">
				<div style="margin-bottom: 1rem;">
					<label for="rdate" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Дата:</label>
					<Calendar v-model="currentPayment.rdate" id="rdate" dateFormat="yy-mm-dd" style="width: 100%;" />
				</div>

				<div style="margin-bottom: 1rem;">
					<label for="category" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Категорія:</label>
					<Dropdown
						v-model="selectedCategoryId"
						:options="formattedCategories"
						optionLabel="name"
						optionValue="id"
						placeholder="Виберіть категорію"
						id="category"
						style="width: 100%;" />
				</div>

				<div v-if="!isFuel" style="margin-bottom: 1rem;">
					<label for="mydesc" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Опис:</label>
					<InputText v-model="currentPayment.mydesc" id="mydesc" style="width: 100%;" />
				</div>

				<div v-if="isFuel">
					<div style="margin-bottom: 1rem;">
						<label for="km" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Кілометри:</label>
						<InputText v-model="currentPayment.refuel_data.km" id="km" style="width: 100%;" />
					</div>
					<div style="margin-bottom: 1rem;">
						<label for="litres" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Літри:</label>
						<InputText v-model="currentPayment.refuel_data.litres" id="litres" style="width: 100%;" />
					</div>
					<div style="margin-bottom: 1rem;">
						<label for="price" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Ціна (EUR):</label>
						<InputText v-model="currentPayment.refuel_data.price_val" id="price" style="width: 100%;" />
					</div>
					<div style="margin-bottom: 1rem;">
						<label for="station" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Заправка:</label>
						<InputText v-model="currentPayment.refuel_data.station_name" id="station" style="width: 100%;" />
					</div>
				</div>

				<div style="margin-bottom: 1rem;">
					<label for="amount" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Сума:</label>
					<InputText v-model="currentPayment.currency_amount" id="amount" type="number" style="width: 100%;" />
				</div>

				<div style="margin-bottom: 1rem;">
					<label for="currency" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Валюта:</label>
					<Dropdown
						v-model="currentPayment.currency"
						:options="currencyOptions"
						optionLabel="label"
						optionValue="value"
						placeholder="Виберіть валюту"
						id="currency"
						style="width: 100%;" />
				</div>

				<div style="margin-bottom: 1rem;">
					<label for="source" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Джерело:</label>
					<Dropdown
						v-model="currentPayment.source"
						:options="sources"
						optionLabel="label"
						optionValue="value"
						placeholder="Виберіть джерело"
						id="source"
						style="width: 100%;" />
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
			:style="{ width: '450px' }"
			class="payment-dialog"
		>
			<div style="margin-bottom: 1rem;">
				<p style="margin-bottom: 1rem;">
					Ви збираєтесь змінити категорію для <strong>{{ selectedPayments.length }}</strong> записів.
				</p>
				<label for="bulk-category" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Нова категорія:</label>
				<Dropdown
					v-model="bulkCategoryId"
					:options="formattedCategories"
					optionLabel="name"
					optionValue="id"
					placeholder="Виберіть категорію"
					id="bulk-category"
					style="width: 100%;" />
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
			:style="{ width: '350px' }"
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
        :style="{ width: '350px' }"
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
			this.currentPayment = {
				category_id: this.$route.params.category_id,
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
			// Ensure rdate is in correct format
			let rdateString;
			if (typeof this.currentPayment.rdate === 'string') {
				rdateString = this.currentPayment.rdate;
			} else if (this.currentPayment.rdate instanceof Date) {
				rdateString = this.currentPayment.rdate.toISOString().split('T')[0];
				this.currentPayment.rdate = rdateString;
			}

			const [year, month, day] = rdateString.split('-');
			const formattedMonth = month.replace(/^0+/, "");
			if (this.$route.params.year !== year || this.$route.params.month !== formattedMonth || this.$route.params.category_id !== this.currentPayment.category_id) {
				this.$router.push({
					name: "payments",
					params: { year, month: formattedMonth, category_id: this.currentPayment.category_id },
				});
			}
			this.showModal = false;
			await PaymentService.createPayment(this.currentPayment);
			await this.getPayments();
			if (this.$refs.myAlert) {
				this.$refs.myAlert.showAlert("success", "Платіж успішно додано");
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
			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				category_id: this.$route.params.category_id || "",
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
		this.category_name = this.findCategoryNameById(this.$route.params.category_id);

		await this.getPayments();

		if (this.$route.query.action === "add") {
			this.openFormAddPayment();
		}
	},
	watch: {
		'$store.state.sprs.selectedCurrency'() {
			this.getPayments();
		}
	}
});
</script>

<style scoped>
@media (max-width: 768px) {
	/* Dialog forms - FULLSCREEN on mobile */
	.payment-dialog :deep(.p-dialog) {
		width: 100vw;
		height: 100vh;
		margin: 0;
		max-height: 100vh;
		border-radius: 0;
	}

	.payment-dialog :deep(.p-dialog-content) {
		padding: 0.5rem;
		flex: 1;
		overflow-y: auto;
	}

	.payment-dialog :deep(.p-dialog-header) {
		padding: 0.75rem 0.5rem;
	}

	.payment-dialog :deep(.p-dialog-footer) {
		padding: 0.75rem 0.5rem;
		border-top: 1px solid var(--surface-border);
	}

	/* Confirmation dialogs - 90vw on mobile (not fullscreen) */
	.confirmation-dialog :deep(.p-dialog) {
		width: 90vw !important;
		max-width: 90vw;
	}

	.confirmation-dialog :deep(.p-dialog-content) {
		padding: 0.5rem;
	}

	.confirmation-dialog :deep(.p-dialog-header) {
		padding: 0.75rem 0.5rem;
	}

	.confirmation-dialog :deep(.p-dialog-footer) {
		padding: 0.75rem 0.5rem;
	}
}
</style>
