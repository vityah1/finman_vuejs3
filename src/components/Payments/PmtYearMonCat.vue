<template>
	<div class="container-fluid">
		<alert-component ref="myAlert"></alert-component>
		<!-- Modal -->
		<b-modal v-model="showModal" :title="okTitle" @ok="doFormAction()">
			<template #modal-header>
				<h5 class="modal-title text-danger">
					{{ okTitle }} Payment [{{ currentPayment.id }}]
				</h5>
			</template>
			<template #default>
				<b-form v-if="currentPayment">
					<div class="form-row">
						<label for="rdate">Date:</label>
						<input id="rdate" v-model="currentPayment.rdate" class="form-control" type="date" />
					</div>
					<div class="form-row">
						<label for="main_category">Category:</label>
						<select id="main_category" v-model="selectedCategoryId" class="form-control"
								name="main_category">
							<option disabled value="">Select category...</option>
							<template v-for="category in formattedCategories" :key="category.id">
								<option :value="category.id">{{ category.name }}</option>
							</template>
						</select>
					</div>
					<div v-if="isFuel" class="form-row">
						<label for="id_km">km:</label>
						<input id="id_km" v-model="currentPayment.refuel_data.km" class="form-control" type="text" />
						<label for="id_litres">Litres:</label>
						<input id="id_litres" v-model="currentPayment.refuel_data.litres" class="form-control" type="text" />
						<label for="id_price_val">Price (EUR):</label>
						<input id="id_price_val" v-model="currentPayment.refuel_data.price_val" class="form-control" type="text" />
						<label for="id_name_station">Name station:</label>
						<input id="id_name_station" v-model="currentPayment.refuel_data.station_name"
                           class="form-control" type="text" />
					</div>
					<div v-if="!isFuel" class="form-row">
						<label for="mydesc">Description:</label>
						<input id="mydesc" v-model="currentPayment.mydesc" class="form-control" type="text" />
					</div>
					<div class="row">
						<div class="col-md-4">
							<label for="amount"><strong>Amount:</strong></label>
							<input id="amount" v-model="currentPayment.currency_amount" class="form-control" type="text" />
						</div>
						<div class="col-md-4">
							<label for="source">Source:</label>
							<select id="source" ref="source" v-model="currentPayment.source" class="form-control"
									name="source">
								<option v-for="item in sources" :key="item.id" :value="item.source">{{ item.source }}
								</option>
							</select>
						</div>
						<div class="col-md-4">
							<label for="currency">Currency:</label>
							<select id="currency" ref="currency" v-model="currentPayment.currency" class="form-control"
									name="currency">
								<option value="USD">USD</option>
								<option value="EUR">EUR</option>
								<option value="UAH">UAH</option>
							</select>
						</div>
					</div>
				</b-form>
				<b-button v-if="currentPayment.action === 'edit'" class="mt-2" variant="danger" @click="delPayment">
					Delete
				</b-button>
			</template>
		</b-modal>

		<!-- Navigation and header -->
		<div class="header-section mb-4">
			<div class="row align-items-center">
				<div class="col-auto">
					<router-link
						class="back-button"
						:to="{ name: 'payments_year_month', params: { year: $route.params.year, month: $route.params.month } }">
						<i class="fas fa-arrow-left"></i>
						<span class="ms-2">Назад</span>
					</router-link>
				</div>
				<div class="col">
					<h3 class="mb-0 category-title">
						<i class="bi bi-folder-fill me-2"></i>
						{{ category_name }}
					</h3>
					<div class="period-info">
						<span class="badge bg-info">{{ getMonthName($route.params.month) }} {{ $route.params.year }}</span>
						<span v-if="$route.query.user" class="badge bg-secondary ms-2">{{ $route.query.user }}</span>
					</div>
				</div>
			</div>
			<!-- Total summary -->
			<div v-if="total" class="total-summary mt-3">
				<div class="row align-items-center">
					<div class="col-auto">
						<span class="total-label">Загальна сума:</span>
					</div>
					<div class="col-auto">
						<span class="total-amount">{{ total.toLocaleString() }}</span>
						<span class="currency-badge ms-2">{{ selectedCurrency || "UAH" }}</span>
					</div>
					<div class="col-auto">
						<span class="total-count">{{ total_cnt }} {{ getPaymentWord(total_cnt) }}</span>
					</div>
				</div>
			</div>
		</div>
		<div v-if="hasSelectedPayments" class="row mb-3">
			<div class="col-md-8">
				<div class="d-flex">
					<b-dropdown :text="`Операції з вибраними (${selectedPaymentsCount})`" variant="primary" class="mr-2">
						<b-dropdown-item @click="showChangeCategoryModal">
							<i class="fas fa-tag mr-2"></i> Змінити категорію
						</b-dropdown-item>
						<b-dropdown-item @click="showBulkDeleteConfirmModal">
							<i class="fas fa-trash-alt mr-2"></i> Видалити
						</b-dropdown-item>
					</b-dropdown>
				</div>
			</div>
		</div>

		<!-- Модальне вікно для зміни категорії вибраних платежів -->
		<b-modal v-model="showCategoryModal" title="Зміна категорії для платежів" @ok="changeCategory">
			<template #modal-header>
				<h5 class="modal-title">Зміна категорії для платежів ({{ selectedPaymentsCount }})</h5>
			</template>
			<template #default>
				<div class="mb-3">
					<label class="form-label">Виберіть нову категорію:</label>
					<select v-model="newCategoryId" class="form-control">
						<option disabled value="">Оберіть категорію...</option>
						<template v-for="category in formattedCategories" :key="category.id">
							<option :value="category.id">{{ category.name }}</option>
						</template>
					</select>
				</div>
				<div class="mb-3">
					<h6>Вибрані платежі:</h6>
					<ul class="list-group">
						<li v-for="payment in selectedPaymentsList" :key="payment.id" class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<small>{{ formatDate(payment.rdate) }}</small>:
								{{ payment.mydesc || payment.category_name }}
							</div>
							<span class="badge bg-primary rounded-pill">
								{{ payment.amount ? payment.amount.toLocaleString() : '0' }}
							</span>
						</li>
					</ul>
				</div>
			</template>
		</b-modal>

		<!-- Модальне вікно для підтвердження масового видалення платежів -->
		<b-modal v-model="showDeleteModal" title="Підтвердження видалення" @ok="bulkDeletePayments">
			<template #modal-header>
				<h5 class="modal-title text-danger">Підтвердження видалення платежів</h5>
			</template>
			<template #default>
				<div class="alert alert-warning">
					<i class="fas fa-exclamation-triangle mr-2"></i> Ви дійсно бажаєте видалити {{ selectedPaymentsCount }} платежів? Ця дія безворотна.
				</div>
				<div class="mb-3">
					<h6>Вибрані платежі для видалення:</h6>
					<ul class="list-group">
						<li v-for="payment in selectedPaymentsList" :key="payment.id" class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<small>{{ formatDate(payment.rdate) }}</small>:
								{{ payment.mydesc || payment.category_name }}
							</div>
							<span class="badge bg-danger rounded-pill">
								{{ payment.amount ? payment.amount.toLocaleString() : '0' }}
							</span>
						</li>
					</ul>
				</div>
			</template>
			<template #modal-footer="{ ok, cancel }">
				<b-button variant="secondary" @click="cancel()">
					Скасувати
				</b-button>
				<b-button variant="danger" @click="ok()">
					Видалити
				</b-button>
			</template>
		</b-modal>

		<!-- Payments table -->
		<div class="row">
			<div class="col-12">
				<div class="payments-table-wrapper">
					<b-table-simple hover responsive class="payments-detail-table">
						<colgroup>
							<col style="width: 50px;" />
							<col style="width: 120px;" />
							<col style="width: 150px;" />
							<col style="width: auto;" />
							<col style="width: 150px;" />
							<col style="width: 100px;" />
						</colgroup>
						<b-thead head-variant="dark">
							<b-tr>
								<b-th class="text-center checkbox-column">
									<input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="form-check-input" />
								</b-th>
								<b-th class="sortable-header" @click="sortBy('rdate')">
									Дата
									<i class="fas fa-sort ms-1"></i>
								</b-th>
								<b-th>Підкатегорія</b-th>
								<b-th class="sortable-header" @click="sortBy('mydesc')">
									Опис
									<i class="fas fa-sort ms-1"></i>
								</b-th>
								<b-th class="sortable-header text-end" @click="sortBy('amount')">
									Сума
									<i class="fas fa-sort ms-1"></i>
								</b-th>
								<b-th class="text-center">Користувач</b-th>
							</b-tr>
						</b-thead>
						<b-tbody v-if="payments.length > 0">
							<b-tr v-for="(payment, index) in sortedPayments" :key="index" class="payment-row">
								<b-td class="text-center checkbox-column" @click.stop>
									<input type="checkbox"
										:checked="isPaymentSelected(payment.id)"
										@change="togglePaymentSelection(payment.id)"
										class="form-check-input" />
								</b-td>
								<b-td @click="openFormEditPayment(payment.id)" class="date-cell">
									{{ formatDate(payment.rdate) }}
								</b-td>
								<b-td @click="openFormEditPayment(payment.id)" class="category-cell">
									<span v-if="payment.category_name !== category_name" class="subcategory-badge">
										{{ payment.category_name }}
									</span>
								</b-td>
								<b-td @click="openFormEditPayment(payment.id)" class="description-cell">
									{{ payment.mydesc }}
								</b-td>
								<b-td @click="openFormEditPayment(payment.id)" class="amount-cell text-end">
									<span class="amount-value">{{ payment.amount ? payment.amount.toLocaleString() : '0' }}</span>
								</b-td>
								<b-td @click="openFormEditPayment(payment.id)" class="user-cell text-center">
									<span class="user-badge">{{ payment.user_login }}</span>
								</b-td>
							</b-tr>
						</b-tbody>
						<b-tbody v-else>
							<b-tr>
								<b-td colspan="6" class="text-center py-5">
									<div class="no-data">
										<i class="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
										<span class="text-muted">Немає платежів за цей період</span>
									</div>
								</b-td>
							</b-tr>
						</b-tbody>
					</b-table-simple>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import moment from "moment";
import store from "../../store";
// import { formatDate } from "@vueuse/shared";

export default {
	name: "PaymentsDetail",
	data() {
		return {
			selectedCategoryId: "",
			okTitle: "",
			showModal: false,
			showCategoryModal: false,
			showDeleteModal: false,
			newCategoryId: "",
			payments: [],
			q: this.$route.query.q || "",
			total: 0,
			total_cnt: 0,
			currentPayment: {
				category_id: this.$store.state.sprs.categories && this.$store.state.sprs.categories.length > 0 ? this.$store.state.sprs.categories[0].id : null,
				rdate: this.getCurrentDate(),
				refuel_data: { km: "", litres: "", price_val: "", station_name: "" },
				currency_amount: 0,
				mydesc: "",
				currency: "UAH",
				source: "pwa",
			},
			selectedCategory: { name: "" },
			categories: [],
			sources: [],
			currencies: [],
			category_name: "",
			sortKey: "",
			sortOrder: 1,
			selectedPayments: {},
			selectAll: false,
		};
	},
	computed: {
		formattedCategories() {
			return this.formatCategories(this.categories);
		},
		isFuel() {
			return this.selectedCategory && this.selectedCategory.is_fuel;
		},
		currentUser() {
			return this.$store.state.auth.user;
		},
		selectedCurrency() {
			return store.state.sprs.selectedCurrency;
		},
		sortedPayments() {
    if (!this.sortKey) return this.payments;
    return [...this.payments].sort((a, b) => {
      let aValue = a[this.sortKey];
      let bValue = b[this.sortKey];
      if (this.sortKey === 'rdate') {
        aValue = this.parseDate(aValue);
        bValue = this.parseDate(bValue);
      }
      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;
      return result * this.sortOrder;
    });
  },
		hasSelectedPayments() {
			return this.selectedPaymentsCount > 0;
		},
		selectedPaymentsCount() {
			return Object.values(this.selectedPayments).filter(value => value).length;
		},
		selectedPaymentsList() {
			return this.payments.filter(payment => this.selectedPayments[payment.id]);
		},
		selectedPaymentIds() {
			return Object.keys(this.selectedPayments)
				.filter(key => this.selectedPayments[key])
				.map(key => parseInt(key));
		},
	},
	watch: {
		selectedCategoryId(newCategoryId) {
			this.currentPayment.category_id = parseInt(newCategoryId);
			// Перевіряємо, чи categories є масивом перед викликом find
			if (Array.isArray(this.categories)) {
				this.selectedCategory = this.categories.find(category => category.id === parseInt(newCategoryId)) || { name: "" };
			} else {
				console.error('categories не є масивом:', this.categories);
				this.selectedCategory = { name: "" };
			}
			if (this.isFuel && !this.currentPayment.refuel_data.km && this.currentPayment.mydesc) {
				this.currentPayment.refuel_data.station_name = this.currentPayment.mydesc;
			}
		},
		'$store.state.sprs.selectedCurrency'() {
        this.getPayments();
    },
		"$route.query.action"(newAction) {
			if (newAction === "add") {
				this.openFormAddPayment();
			}
		},
		"$route.path"() {
			this.getPayments();
		},
		"$store.state.buttonClicked"(newAction) {
			if (newAction) {
				this.openFormAddPayment();
				this.$store.commit("setButtonClicked", false);
			}
		}
		},
	methods: {
		getMonthName(monthNumber) {
			const date = new Date();
			date.setMonth(monthNumber - 1);
			return date.toLocaleString('uk-UA', { month: 'long' });
		},
		getPaymentWord(count) {
			const lastDigit = count % 10;
			const lastTwoDigits = count % 100;

			if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
				return 'платежів';
			}

			if (lastDigit === 1) {
				return 'платіж';
			} else if (lastDigit >= 2 && lastDigit <= 4) {
				return 'платежі';
			} else {
				return 'платежів';
			}
		},
		formatDate(date) {
			return moment(date).format('DD.MM.YYYY');
		},
		parseDate(date) {
			// Використовуємо moment без вказання формату, щоб він ідентифікував формат автоматично
			return moment(date).toDate();
		},
		formatCategories(categories, parentId = null, prefix = "") {
			if (!Array.isArray(categories)) {
				return [];
			}
			return categories.reduce((acc, category) => {
				if (category.parent_id === parentId || (parentId === null && !category.parent_id)) {
					acc.push({ ...category, name: prefix + category.name });
					const children = this.formatCategories(categories, category.id, prefix + "--");
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		},
		getCurrentDate() {
			const date = new Date();
			return date.toISOString().split("T")[0];
		},
		setCategory() {
			// Просто використовуємо категорії зі store
			this.categories = this.$store.state.sprs.categories;
			console.log('Категорії отримано зі store:', this.categories.length);
		},
		openFormAddPayment() {
			// Отримуємо категорії зі store
			this.setCategory();

			// Перевіряємо, чи є категорії
			if (this.categories.length === 0) {
				console.error('Немає доступних категорій для вибору');
				this.$refs.myAlert.showAlert('danger', 'Немає доступних категорій. Спробуйте оновити сторінку.');
				return;
			}

			this.okTitle = "Add";
			this.currentPayment = {
				category_id: this.categories[0].id,
				rdate: this.getCurrentDate(),
				refuel_data: { km: "", litres: "", price_val: "", station_name: "" },
				currency_amount: 0,
				mydesc: "",
				currency: "UAH",
				source: "pwa",
				action: "add",
			};

			// Встановлюємо початкову категорію в селекторі
			this.selectedCategoryId = this.categories[0].id.toString();
			console.log('Встановлено початкову категорію:', this.selectedCategoryId);

			this.showModal = true;
		},
		async openFormEditPayment(id) {
			try {
				// Отримуємо категорії зі store
				this.setCategory();

				// Отримуємо дані платежу
				const response = await PaymentService.getPayment(id);
				this.currentPayment = {
					...response.data,
					rdate: moment(response.data.rdate).format("YYYY-MM-DD"),
					action: "edit",
				};
				if (!this.currentPayment.refuel_data) {
					this.currentPayment.refuel_data = { km: "", litres: "", price_val: "", station_name: "" };
				}

				// Встановлюємо ID категорії для вибору в селекторі
				const categoryId = this.currentPayment.category_id;
				console.log('Встановлюємо категорію:', categoryId);
				this.selectedCategoryId = categoryId ? categoryId.toString() : "";

				this.okTitle = "Edit";
				this.showModal = true;
			} catch (e) {
				console.error('Помилка відкриття форми редагування:', e);
			}
		},
		async doFormAction() {
			if (this.currentPayment.action === "edit") {
				await this.doUpdatePayment();
			} else if (this.currentPayment.action === "add") {
				await this.doAddPayment();
			}
		},
		async doAddPayment() {
			try {
				await PaymentService.addPayment(this.currentPayment);
				this.$refs.myAlert.showAlert("success", "Payment added");
				const [year, month] = this.currentPayment.rdate.split("-").slice(0, 2);
				const formattedMonth = month.replace(/^0+/, "");
				if (this.$route.params.year !== year || this.$route.params.month !== formattedMonth || this.$route.params.category_id !== this.currentPayment.category_id) {
					this.$router.push({
						name: "payments",
						params: { year, month: formattedMonth, category_id: this.currentPayment.category_id },
					});
				}
				this.showModal = false;
			} catch (e) {
				console.log(e);
				this.$refs.myAlert.showAlert("danger", "Payment add failed");
			}
		},
		async doUpdatePayment() {
			try {
				// Зберігаємо стару категорію для порівняння
				const oldCategoryId = this.$route.params.category_id;

				await PaymentService.updatePayment(this.currentPayment.id, this.currentPayment);

				// Перевіряємо, чи змінилася категорія
				if (oldCategoryId && this.currentPayment.category_id.toString() !== oldCategoryId.toString()) {
					// Якщо категорія змінилася і ми знаходимося в списку конкретної категорії,
					// потрібно оновити весь список
					this.$refs.myAlert.showAlert("success", "Payment updated");
					this.showModal = false;
					// Оновлюємо список платежів
					this.getPayments();
				} else {
					// Якщо категорія не змінилася, просто оновлюємо платіж у списку
					this.payments = this.payments.map(c => (c.id === this.currentPayment.id ? this.currentPayment : c));
					this.$refs.myAlert.showAlert("success", "Payment updated");
					this.showModal = false;
				}
			} catch (e) {
				console.log(e);
				this.$refs.myAlert.showAlert("danger", "Payment update failed");
			}
		},
		async delPayment() {
			try {
				await PaymentService.deletePayment(this.currentPayment.id);
				this.payments = this.payments.filter(c => c.id !== this.currentPayment.id);
				this.showModal = false;
			} catch (e) {
				console.log(e);
			}
		},
		async getPayments() {
    let data = {
        sort: this.$route.query.sort || "",
        year: this.$route.params.year || "",
        month: this.$route.params.month || "",
        category_id: this.$route.params.category_id || "",
        q: this.$route.query.q || "",
        currency: store.state.sprs.selectedCurrency || "UAH",
        group_user_id: this.$route.query.group_user_id || ""
    };
    try {
        const response = await PaymentService.getPayments(data);
        this.payments = response.data;
        this.total = this.payments.reduce((sum, val) => sum + Number(val.amount), 0);
        this.total_cnt = this.payments.length;
    } catch (e) {
        console.log(e);
    }
},
		sortBy(key) {
			if (this.sortKey === key) {
				this.sortOrder *= -1;
			} else {
				this.sortKey = key;
				this.sortOrder = 1;
			}
		},
		findCategoryNameById(categoryId) {
			if (!Array.isArray(this.categories) || !this.categories.length) {
				return "";
			}
			return this.categories.find(category => category.id === parseInt(categoryId))?.name || "";
		},
		isPaymentSelected(paymentId) {
			return Boolean(this.selectedPayments[paymentId]);
		},

		togglePaymentSelection(paymentId) {
			// У Vue 3 ми можемо просто присвоїти значення
			const newValue = !this.isPaymentSelected(paymentId);
			// Створюємо новий об'єкт для реактивності
			this.selectedPayments = { ...this.selectedPayments, [paymentId]: newValue };
			console.log(`Платіж ${paymentId} ${newValue ? 'вибрано' : 'знято'}`);
		},

		toggleSelectAll() {
			const newValue = this.selectAll;
			const newSelectedPayments = {};
			this.payments.forEach(payment => {
				newSelectedPayments[payment.id] = newValue;
			});
			this.selectedPayments = newSelectedPayments;
			console.log(`${newValue ? 'Вибрано' : 'Знято'} всі платежі`);
		},
		showChangeCategoryModal() {
			this.newCategoryId = "";
			this.showCategoryModal = true;
		},
		showBulkDeleteConfirmModal() {
			this.showDeleteModal = true;
		},
		bulkDeletePayments() {
			const payload = {
				payment_ids: this.selectedPaymentIds
			};

			PaymentService.bulkDeletePayments(payload)
				.then(response => {
					if (response.data.status === "ok") {
						this.$refs.myAlert.showAlert('success', response.data.message);
						// Оновлюємо список платежів
						this.getPayments();
						// Скидаємо вибрані платежі
						this.selectedPayments = {};
						this.selectAll = false;
					} else {
						this.$refs.myAlert.showAlert('danger', 'Не вдалося видалити платежі');
					}
				})
				.catch(error => {
					console.error("Error deleting payments:", error);
					this.$refs.myAlert.showAlert('danger', 'Не вдалося видалити платежі: ' + error.message);
				});
		},
		changeCategory() {
			if (!this.newCategoryId) {
				this.$refs.myAlert.showAlert('danger', 'Виберіть категорію');
				return;
			}

			const payload = {
				payment_ids: this.selectedPaymentIds,
				category_id: parseInt(this.newCategoryId)
			};

			PaymentService.changePaymentsCategory(payload)
				.then(response => {
					if (response.data.status === "ok") {
						this.$refs.myAlert.showAlert('success', response.data.message);
						// Оновлення даних після зміни категорії
						this.getPayments();
						// Скидаємо вибрані платежі
						this.selectedPayments = {};
						this.selectAll = false;
					} else {
						this.$refs.myAlert.showAlert('danger', 'Не вдалося змінити категорію');
					}
				})
				.catch(error => {
					console.error("Error changing category:", error);
					this.$refs.myAlert.showAlert('danger', 'Не вдалося змінити категорію: ' + error.message);
				});
		},
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		// Перевіряємо, чи дані з store є масивами
		const storeCategories = this.$store.state.sprs.categories;
		this.categories = Array.isArray(storeCategories) ? storeCategories : [];

		const storeCurrencies = this.$store.state.sprs.currencies;
		this.currencies = Array.isArray(storeCurrencies) ? storeCurrencies : [];

		const storeSources = this.$store.state.sprs.sources;
		this.sources = Array.isArray(storeSources) ? storeSources : [];

		console.log('Категорії завантажено:', this.categories.length);

		this.category_name = this.findCategoryNameById(this.$route.params.category_id);
		await this.getPayments();
		if (this.$route.query.action === "add") {
			this.openFormAddPayment();
		}

	},
};
</script>

<style scoped>
.container-fluid {
	padding-top: 20px;
}

/* Header section */
.header-section {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 25px;
	border-radius: 12px;
	box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.back-button {
	color: white;
	text-decoration: none;
	font-weight: 500;
	transition: all 0.3s ease;
	padding: 8px 16px;
	background: rgba(255,255,255,0.1);
	border-radius: 8px;
	display: inline-flex;
	align-items: center;
}

.back-button:hover {
	background: rgba(255,255,255,0.2);
	color: white;
	transform: translateX(-3px);
}

.category-title {
	color: white;
	font-weight: 600;
	margin-bottom: 8px !important;
}

.category-title i {
	opacity: 0.9;
}

.period-info .badge {
	font-size: 0.9em;
	padding: 6px 12px;
}

/* Total summary */
.total-summary {
	background: white;
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.total-label {
	font-size: 1.1em;
	font-weight: 600;
	color: #495057;
}

.total-amount {
	font-size: 1.8em;
	font-weight: bold;
	color: #dc3545;
	font-family: 'SF Mono', Monaco, 'Courier New', monospace;
}

.currency-badge {
	display: inline-block;
	padding: 6px 12px;
	background: #e7f5ff;
	color: #0c8599;
	border-radius: 6px;
	font-size: 0.85em;
	font-weight: 600;
}

.total-count {
	font-size: 1.1em;
	color: #6c757d;
	font-weight: 500;
}

/* Payments table */
.payments-table-wrapper {
	margin-top: 30px;
}

.payments-detail-table {
	background: white;
	box-shadow: 0 2px 12px rgba(0,0,0,0.08);
	border-radius: 12px;
	overflow: hidden;
}

.payments-detail-table thead {
	background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
}

.payments-detail-table thead th {
	color: white !important;
	font-weight: 600;
	padding: 14px 12px;
	border: none;
	font-size: 0.95em;
}

.sortable-header {
	cursor: pointer;
	transition: background 0.2s;
	user-select: none;
}

.sortable-header:hover {
	background: rgba(255,255,255,0.1);
}

.sortable-header i {
	opacity: 0.7;
	font-size: 0.85em;
}

.checkbox-column {
	width: 50px !important;
}

.form-check-input {
	cursor: pointer;
	width: 18px;
	height: 18px;
}

/* Payment rows */
.payment-row {
	transition: all 0.2s ease;
	border-bottom: 1px solid #f0f0f0;
}

.payment-row:hover {
	background-color: #f8f9fa;
	transform: scale(1.005);
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	cursor: pointer;
}

.payment-row td {
	padding: 12px 10px;
	vertical-align: middle;
}

.date-cell {
	font-weight: 500;
	color: #495057;
}

.category-cell .subcategory-badge {
	display: inline-block;
	padding: 4px 10px;
	background: #f0f3ff;
	color: #5969dd;
	border-radius: 6px;
	font-size: 0.85em;
	font-weight: 500;
}

.description-cell {
	color: #212529;
	font-weight: 400;
}

.amount-cell .amount-value {
	font-family: 'SF Mono', Monaco, 'Courier New', monospace;
	font-weight: 600;
	color: #28a745;
	font-size: 1.05em;
}

.user-cell .user-badge {
	display: inline-block;
	padding: 3px 8px;
	background: #e9ecef;
	color: #495057;
	border-radius: 4px;
	font-size: 0.85em;
}

/* No data state */
.no-data {
	padding: 40px;
}

.no-data i {
	color: #dee2e6;
}

/* Bulk actions dropdown */
.dropdown-toggle {
	box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.header-section {
		padding: 15px;
	}

	.category-title {
		font-size: 1.4em;
	}

	.total-amount {
		font-size: 1.5em;
	}

	.payments-detail-table {
		font-size: 0.85rem;
	}

	.payments-detail-table th,
	.payments-detail-table td {
		padding: 8px 6px;
	}

	.subcategory-badge,
	.user-badge {
		font-size: 0.75em;
	}
}
</style>